import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // 打印数据库连接信息
  console.log('=== 数据库连接配置 ===');
  console.log(`Host: ${process.env.DB_HOST ?? 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT ?? '3306'}`);
  console.log(`Username: ${process.env.DB_USERNAME ?? 'root'}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '***' : '(空)'}`);
  console.log(`Database: ${process.env.DB_DATABASE ?? 'wx_nest'}`);
  console.log(`Synchronize: ${process.env.DB_SYNCHRONIZE === 'true' ? '是' : '否'}`);
  console.log('========================');

  const app = await NestFactory.create(AppModule);

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
