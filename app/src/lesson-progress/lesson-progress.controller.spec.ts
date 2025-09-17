import { Test, TestingModule } from '@nestjs/testing';
import { LessonProgressController } from './lesson-progress.controller';

describe('LessonProgressController', () => {
  let controller: LessonProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonProgressController],
    }).compile();

    controller = module.get<LessonProgressController>(LessonProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
