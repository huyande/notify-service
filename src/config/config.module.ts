import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${nodeEnv}`, '.env'],
      load: [databaseConfig],
    }),
  ],
})
export class AppConfigModule {}
