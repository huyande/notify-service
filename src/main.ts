import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // 从环境变量获取日志级别，默认 'log'
  const logLevel = process.env.LOG_LEVEL ?? 'log';

  // 根据 LOG_LEVEL 确定要启用的日志级别
  const allLevels: ('log' | 'error' | 'warn' | 'debug' | 'verbose')[] = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ];
  const levelOrder: Record<string, number> = {
    error: 0,
    warn: 1,
    log: 2,
    debug: 3,
    verbose: 4,
  };

  const enabledLevels = allLevels.filter(
    (level) => levelOrder[level] <= levelOrder[logLevel],
  );

  const app = await NestFactory.create(AppModule, {
    logger: enabledLevels,
  });

  // 全局校验管道：DTO 校验 + 隐式类型转换
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 配置
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('notify-service API')
      .setDescription('微信小程序订阅消息推送服务 API 文档')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(process.env.APP_PORT ?? process.env.PORT ?? 3000);
}
void bootstrap();
