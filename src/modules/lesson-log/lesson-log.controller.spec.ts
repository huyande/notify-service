import { Test, TestingModule } from '@nestjs/testing';
import { LessonLogController } from './lesson-log.controller';
import { LessonLogService } from './lesson-log.service';

describe('LessonLogController', () => {
  let controller: LessonLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonLogController],
      providers: [LessonLogService],
    }).compile();

    controller = module.get<LessonLogController>(LessonLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
