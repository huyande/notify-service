import { Test, TestingModule } from '@nestjs/testing';
import { LessonLogService } from './lesson-log.service';

describe('LessonLogService', () => {
  let service: LessonLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonLogService],
    }).compile();

    service = module.get<LessonLogService>(LessonLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
