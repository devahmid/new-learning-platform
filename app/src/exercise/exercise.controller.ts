import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  // Récupérer tous les exercices d'une leçon
  @Get('lesson/:lessonId')
  async getExercisesByLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<Exercise[]> {
    return await this.exerciseService.getExercisesByLesson(+lessonId);
  }

  // Récupérer un exercice par son ID
  @Get(':id')
  async getExerciseById(@Param('id') id: string): Promise<Exercise> {
    return await this.exerciseService.getExerciseById(+id);
  }

  // Créer un nouvel exercice
  @Post()
  async createExercise(
    @Body() exerciseData: Partial<Exercise>,
  ): Promise<Exercise> {
    return await this.exerciseService.createExercise(exerciseData);
  }

  // Mettre à jour un exercice
  @Patch(':id')
  async updateExercise(
    @Param('id') id: string,
    @Body() updateData: Partial<Exercise>,
  ): Promise<Exercise> {
    return await this.exerciseService.updateExercise(+id, updateData);
  }

  // Supprimer un exercice
  @Delete(':id')
  async deleteExercise(@Param('id') id: string): Promise<{ message: string }> {
    await this.exerciseService.deleteExercise(+id);
    return { message: 'Exercise deleted successfully' };
  }

  // Créer des exercices de test pour une leçon
  @Post('lesson/:lessonId/sample')
  async createSampleExercises(
    @Param('lessonId') lessonId: string,
  ): Promise<Exercise[]> {
    return await this.exerciseService.createSampleExercises(+lessonId);
  }

  // Endpoint public pour créer des exercices de test (sans authentification)
  @Post('lesson/:lessonId/sample-public')
  async createSampleExercisesPublic(
    @Param('lessonId') lessonId: string,
  ): Promise<Exercise[]> {
    return await this.exerciseService.createSampleExercises(+lessonId);
  }
}
