import { Test, TestingModule } from '@nestjs/testing';
import { QuizResultService } from './quiz-result.service';

describe('QuizResultService', () => {
  let service: QuizResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizResultService],
    }).compile();

    service = module.get<QuizResultService>(QuizResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
