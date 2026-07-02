import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
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

  // 启用全局序列化：让 DTO 上的 @Exclude() 等装饰器在响应时生效
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const logger = new Logger('Bootstrap');

  // 打印数据库连接信息
  logger.log('=== 数据库连接配置 ===');
  logger.log(`Host: ${process.env.DB_HOST ?? 'localhost'}`);
  logger.log(`Port: ${process.env.DB_PORT ?? '3306'}`);
  logger.log(`Username: ${process.env.DB_USERNAME ?? 'root'}`);
  logger.log(`Password: ${process.env.DB_PASSWORD ?? '(空)'}`);
  logger.log(`Database: ${process.env.DB_DATABASE ?? 'wx_nest'}`);
  logger.log(`Synchronize: ${process.env.DB_SYNCHRONIZE === 'true' ? '是' : '否'}`);
  logger.log(`日志级别: ${logLevel}`);
  logger.log('========================');

  // Swagger 配置
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('wx-nest API')
      .setDescription('微信教育管理系统 API 文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '请输入 JWT token',
          in: 'header',
        },
        'bearer',
      )
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
