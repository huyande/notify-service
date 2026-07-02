import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ChildModule } from './modules/child/child.module';
import { CourseModule } from './modules/course/course.module';
import { FamilyModule } from './modules/family/family.module';
import { LessonLogModule } from './modules/lesson-log/lesson-log.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    FamilyModule,
    ChildModule,
    CourseModule,
    LessonLogModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
