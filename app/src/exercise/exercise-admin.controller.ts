import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/exercises')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
export class ExerciseAdminController {
  constructor(private readonly exerciseService: ExerciseService) {}

  // Récupérer tous les exercices avec pagination
  @Get()
  async getAllExercises(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('lessonId') lessonId?: number,
    @Query('type') type?: string,
  ): Promise<{
    exercises: Exercise[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [exercises, total] = await this.exerciseService.findAllWithPagination(
      page,
      limit,
      lessonId,
      type,
    );

    return {
      exercises,
      total,
      page,
      limit,
    };
  }

  // Récupérer un exercice par ID
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
  @Put(':id')
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
    return { message: 'Exercice supprimé avec succès' };
  }

  // Dupliquer un exercice
  @Post(':id/duplicate')
  async duplicateExercise(@Param('id') id: string): Promise<Exercise> {
    return await this.exerciseService.duplicateExercise(+id);
  }

  // Activer/Désactiver un exercice
  @Put(':id/toggle-status')
  async toggleExerciseStatus(@Param('id') id: string): Promise<Exercise> {
    return await this.exerciseService.toggleExerciseStatus(+id);
  }

  // Récupérer les statistiques des exercices
  @Get('stats/overview')
  async getExerciseStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    return await this.exerciseService.getExerciseStats();
  }
}
