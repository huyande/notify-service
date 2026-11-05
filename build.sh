#!/usr/bin/env bash
#
# notify-service 构建部署脚本：拉代码 → 构建镜像 → 重建容器（保留历史镜像用于回滚）
# 前置条件：本目录存在已填好的 .env.production（Redis 地址、Bull Board 账户等）。

set -Eeuo pipefail

readonly CONTAINER_NAME="notify-service"
readonly IMAGE_REPOSITORY="notify-service"
# 保留的历史镜像数量（不含本次构建的镜像），用于快速回滚
readonly KEEP_HISTORY_IMAGES=3
# 容器对外端口（与应用 APP_PORT 保持一致）
readonly APP_PORT=3000

# 生成镜像标签：日期 + 2 位随机字符串，例如 20261105-3f
generate_image_tag() {
  printf '%s-%02x' "$(date +%Y%m%d)" "$((RANDOM % 256))"
}

# 按创建时间从新到旧删除超出保留数量的历史镜像
prune_old_images() {
  local current_ref="$1"
  local -a refs=()
  local line ref
  local index=0

  while IFS= read -r line; do
    [[ -n "${line}" ]] || continue
    ref="${line##* }"
    [[ "${ref}" == *":<none>" ]] && continue
    [[ "${ref}" == "${current_ref}" ]] && continue
    refs+=("${ref}")
  done < <(docker image ls \
    --filter "reference=${IMAGE_REPOSITORY}:*" \
    --format '{{.CreatedAt}} {{.Repository}}:{{.Tag}}' | sort -r)

  (( ${#refs[@]} == 0 )) && return 0

  for ref in "${refs[@]}"; do
    index=$((index + 1))
    if (( index > KEEP_HISTORY_IMAGES )); then
      echo "删除旧镜像：${ref}"
      if ! docker image rm --force "${ref}"; then
        echo "警告：删除镜像 ${ref} 失败，请手动清理" >&2
      fi
    fi
  done
}

if [[ ! -f .env.production ]]; then
  echo "错误：缺少 .env.production（参考 .env.example 填写后重试）" >&2
  exit 1
fi

echo "拉取最新代码"
git pull

# 生成唯一标签，避免同一时刻重复构建覆盖历史镜像
image_tag=""
for _ in $(seq 1 10); do
  candidate="$(generate_image_tag)"
  if ! docker image inspect "${IMAGE_REPOSITORY}:${candidate}" >/dev/null 2>&1; then
    image_tag="${candidate}"
    break
  fi
done
if [[ -z "${image_tag}" ]]; then
  echo "错误：连续生成重复的镜像标签，请重试" >&2
  exit 1
fi
readonly IMAGE_NAME="${IMAGE_REPOSITORY}:${image_tag}"

echo "构建镜像：${IMAGE_NAME}"
docker build --tag "${IMAGE_NAME}" .

if docker ps --quiet --filter "name=^/${CONTAINER_NAME}$" | grep -q .; then
  echo "停止正在运行的容器：${CONTAINER_NAME}"
  docker stop "${CONTAINER_NAME}"
fi

if docker ps --all --quiet --filter "name=^/${CONTAINER_NAME}$" | grep -q .; then
  echo "删除已有容器：${CONTAINER_NAME}"
  docker rm "${CONTAINER_NAME}"
fi

prune_old_images "${IMAGE_NAME}"

echo "启动容器：${CONTAINER_NAME}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${APP_PORT}":3000 \
  --add-host=host.docker.internal:host-gateway \
  --env-file "$(pwd)/.env.production" \
  "${IMAGE_NAME}"

echo "部署完成：${CONTAINER_NAME}（镜像：${IMAGE_NAME}）"
echo "可用镜像（最新在前，最多保留 1 个当前镜像 + ${KEEP_HISTORY_IMAGES} 个历史镜像）："
docker image ls \
  --filter "reference=${IMAGE_REPOSITORY}:*" \
  --format '  {{.Repository}}:{{.Tag}}  {{.CreatedSince}}'
