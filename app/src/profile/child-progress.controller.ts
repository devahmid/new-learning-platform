import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChildProgressService } from './child-progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('child-progress')
export class ChildProgressController {
  constructor(private readonly childProgressService: ChildProgressService) {}

  @Get(':childId')
  @UseGuards(JwtAuthGuard)
  async getChildProgress(@Param('childId') childId: string) {
    return this.childProgressService.getChildProgress(+childId);
  }

  @Post('lesson')
  @UseGuards(JwtAuthGuard)
  async updateLessonProgress(
    @Body()
    body: {
      childId: number;
      lessonId: number;
      courseId: number;
      progressPercentage: number;
      timeSpent: number;
      score?: number;
      isCompleted?: boolean;
    },
  ) {
    return this.childProgressService.updateLessonProgress(
      body.childId,
      body.lessonId,
      body.courseId,
      {
        progressPercentage: body.progressPercentage,
        timeSpent: body.timeSpent,
        score: body.score,
        isCompleted: body.isCompleted,
      },
    );
  }

  @Put('level/:childId')
  @UseGuards(JwtAuthGuard)
  async updateChildLevel(
    @Param('childId') childId: string,
    @Body()
    levelData: {
      currentLevel?: 'debutant' | 'intermediaire' | 'avance' | 'expert';
      levelNumber?: number;
      experiencePoints?: number;
      totalLessonsCompleted?: number;
      totalQuizzesPassed?: number;
    },
  ) {
    return this.childProgressService.updateChildLevel(+childId, levelData);
  }

  @Post('complete-lesson')
  @UseGuards(JwtAuthGuard)
  async completeLesson(
    @Body()
    body: {
      childId: number;
      lessonId: number;
      courseId: number;
      score: number;
    },
  ) {
    await this.childProgressService.completeLesson(
      body.childId,
      body.lessonId,
      body.courseId,
      body.score,
    );
    return { message: 'Leçon terminée avec succès' };
  }

  @Get(':childId/recommended-courses')
  @UseGuards(JwtAuthGuard)
  async getRecommendedCourses(@Param('childId') childId: string) {
    return this.childProgressService.getRecommendedCourses(+childId);
  }
}




