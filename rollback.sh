#!/usr/bin/env bash
#
# notify-service 回滚脚本：选择历史镜像重建容器。
# 用法：./rollback.sh            交互式选择
#       ./rollback.sh 20261105-3f 直接回滚到指定标签
#       ./rollback.sh -y         跳过二次确认

set -Eeuo pipefail

readonly CONTAINER_NAME="notify-service"
readonly IMAGE_REPOSITORY="notify-service"
readonly APP_PORT=3000

usage() {
  cat <<'EOF'
用法：./rollback.sh [选项] [镜像标签]

不带参数时列出镜像并交互式选择；也可直接指定标签，如
  ./rollback.sh 20261105-3f
  ./rollback.sh notify-service:20261105-3f

选项：
  -y, --yes    跳过二次确认
  -h, --help   显示本帮助
EOF
}

assume_yes=0
target=""
while (( $# )); do
  case "$1" in
    -y|--yes) assume_yes=1; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "未知选项：$1" >&2; usage >&2; exit 2 ;;
    *)
      if [[ -n "${target}" ]]; then
        echo "错误：只能指定一个镜像标签" >&2
        exit 2
      fi
      target="$1"; shift ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未安装 docker" >&2
  exit 1
fi

if [[ ! -f .env.production ]]; then
  echo "错误：缺少 .env.production（与 build.sh 使用同一份运行配置）" >&2
  exit 1
fi

# 当前容器使用的镜像，用于在列表中标记
current_image=""
if docker container inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
  current_image="$(docker inspect --format '{{.Config.Image}}' "${CONTAINER_NAME}")"
fi

declare -a tags=() since=()

# 按创建时间从新到旧读取镜像（与 build.sh 的清理顺序一致）
while IFS=$'\t' read -r _created created_since ref; do
  tags+=("${ref}")
  since+=("${created_since}")
done < <(docker image ls \
  --filter "reference=${IMAGE_REPOSITORY}:*" \
  --format '{{.CreatedAt}}\t{{.CreatedSince}}\t{{.Repository}}:{{.Tag}}' | sort -r)

if (( ${#tags[@]} == 0 )); then
  echo "错误：没有可用的 ${IMAGE_REPOSITORY} 镜像" >&2
  exit 1
fi

if [[ -n "${target}" ]]; then
  if [[ "${target}" == *:* ]]; then
    selected="${target}"
  else
    selected="${IMAGE_REPOSITORY}:${target}"
  fi
  if ! docker image inspect "${selected}" >/dev/null 2>&1; then
    echo "错误：镜像 ${selected} 不存在" >&2
    echo "可用镜像（最新在前）：" >&2
    docker image ls \
      --filter "reference=${IMAGE_REPOSITORY}:*" \
      --format '  {{.Repository}}:{{.Tag}}  {{.CreatedSince}}' >&2
    exit 1
  fi
else
  echo "可用镜像（最新在前）："
  for i in "${!tags[@]}"; do
    marker=""
    [[ "${tags[$i]}" == "${current_image}" ]] && marker="  ← 当前运行"
    printf '  %2d) %-30s %s%s\n' "$((i + 1))" "${tags[$i]}" "${since[$i]}" "${marker}"
  done

  selected=""
  while [[ -z "${selected}" ]]; do
    if ! read -r -p "请选择要回滚到的镜像编号（q 退出）： " choice; then
      echo
      echo "未接收到输入，已取消"
      exit 1
    fi
    case "${choice}" in
      q|Q|quit|exit) echo "已取消"; exit 0 ;;
      ''|*[!0-9]*)
        echo "请输入数字编号，或输入 q 退出"
        continue ;;
    esac
    if (( 10#${choice} >= 1 && 10#${choice} <= ${#tags[@]} )); then
      selected="${tags[$((10#${choice} - 1))]}"
    else
      echo "编号超出范围：1-${#tags[@]}"
    fi
  done
fi

echo
echo "将执行："
echo "  停止并删除容器：${CONTAINER_NAME}"
echo "  使用镜像启动：  ${selected}"
if [[ -n "${current_image}" ]]; then
  echo "  当前运行镜像：  ${current_image}"
fi
echo

if (( ! assume_yes )); then
  if ! read -r -p "确认回滚？(y/N) " answer; then
    echo
    echo "未接收到输入，已取消"
    exit 1
  fi
  case "${answer}" in
    y|Y|yes|YES) ;;
    *) echo "已取消"; exit 0 ;;
  esac
fi

if docker ps --quiet --filter "name=^/${CONTAINER_NAME}$" | grep -q .; then
  echo "停止正在运行的容器：${CONTAINER_NAME}"
  docker stop "${CONTAINER_NAME}"
fi

if docker ps --all --quiet --filter "name=^/${CONTAINER_NAME}$" | grep -q .; then
  echo "删除已有容器：${CONTAINER_NAME}"
  docker rm "${CONTAINER_NAME}"
fi

# 启动参数与 build.sh 保持一致
echo "启动容器：${CONTAINER_NAME}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --add-host=host.docker.internal:host-gateway \
  -p "${APP_PORT}":3000 \
  --env-file "$(pwd)/.env.production" \
  "${selected}"

echo "回滚完成：${CONTAINER_NAME} 已使用镜像 ${selected}"
docker ps --filter "name=^/${CONTAINER_NAME}$" --format '  容器状态：{{.Status}}'
echo "如需恢复到其他版本，再次执行 ./rollback.sh 选择对应镜像即可"
