import { Controller, Get, Post, Param } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.entity';

@Controller('public/exercises')
export class ExercisePublicController {
  constructor(private readonly exerciseService: ExerciseService) {}

  // Récupérer tous les exercices d'une leçon (public)
  @Get('lesson/:lessonId')
  async getExercisesByLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<Exercise[]> {
    return await this.exerciseService.getExercisesByLesson(+lessonId);
  }

  // Récupérer un exercice par son ID (public)
  @Get(':id')
  async getExerciseById(@Param('id') id: string): Promise<Exercise> {
    return await this.exerciseService.getExerciseById(+id);
  }

  // Créer des exercices de test pour une leçon (public)
  @Post('lesson/:lessonId/sample')
  async createSampleExercises(
    @Param('lessonId') lessonId: string,
  ): Promise<Exercise[]> {
    return await this.exerciseService.createSampleExercises(+lessonId);
  }
}
