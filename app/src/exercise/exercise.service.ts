import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseQuestion } from './exercise-question.entity';
import { ExerciseAnswer } from './exercise-answer.entity';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ExerciseQuestion)
    private exerciseQuestionRepository: Repository<ExerciseQuestion>,
    @InjectRepository(ExerciseAnswer)
    private exerciseAnswerRepository: Repository<ExerciseAnswer>,
  ) {}

  // Récupérer tous les exercices d'une leçon
  async getExercisesByLesson(lessonId: number): Promise<Exercise[]> {
    const exercises = await this.exerciseRepository.find({
      where: { lessonId, isActive: true },
      relations: ['questions', 'questions.answers'],
      order: { order: 'ASC' },
    });

    return exercises;
  }

  // Récupérer un exercice par son ID
  async getExerciseById(exerciseId: number): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
      relations: ['questions', 'questions.answers'],
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    return exercise;
  }

  // Créer un nouvel exercice
  async createExercise(exerciseData: Partial<Exercise>): Promise<Exercise> {
    const exercise = this.exerciseRepository.create(exerciseData);
    return await this.exerciseRepository.save(exercise);
  }

  // Mettre à jour un exercice
  async updateExercise(
    exerciseId: number,
    updateData: Partial<Exercise>,
  ): Promise<Exercise> {
    await this.exerciseRepository.update(exerciseId, updateData);
    return await this.getExerciseById(exerciseId);
  }

  // Supprimer un exercice
  async deleteExercise(exerciseId: number): Promise<void> {
    const result = await this.exerciseRepository.delete(exerciseId);
    if (result.affected === 0) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }
  }

  // Récupérer tous les exercices avec pagination
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    lessonId?: number,
    type?: string,
  ): Promise<[Exercise[], number]> {
    const queryBuilder = this.exerciseRepository
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.questions', 'questions')
      .leftJoinAndSelect('questions.answers', 'answers')
      .leftJoinAndSelect('exercise.lesson', 'lesson');

    if (lessonId) {
      queryBuilder.where('exercise.lessonId = :lessonId', { lessonId });
    }

    if (type) {
      queryBuilder.andWhere('exercise.type = :type', { type });
    }

    queryBuilder
      .orderBy('exercise.order', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  // Dupliquer un exercice
  async duplicateExercise(exerciseId: number): Promise<Exercise> {
    const originalExercise = await this.getExerciseById(exerciseId);

    const duplicatedExercise = await this.createExercise({
      title: `${originalExercise.title} (Copie)`,
      description: originalExercise.description,
      type: originalExercise.type,
      order: originalExercise.order + 1,
      isActive: false, // Désactivé par défaut
      lessonId: originalExercise.lessonId,
    });

    // Dupliquer les questions et réponses
    for (const question of originalExercise.questions) {
      const duplicatedQuestion = await this.exerciseQuestionRepository.save({
        text: question.text,
        audioUrl: question.audioUrl,
        metadata: question.metadata,
        exerciseId: duplicatedExercise.id,
        order: question.order,
      });

      for (const answer of question.answers) {
        await this.exerciseAnswerRepository.save({
          text: answer.text,
          isCorrect: answer.isCorrect,
          order: answer.order,
          questionId: duplicatedQuestion.id,
        });
      }
    }

    return await this.getExerciseById(duplicatedExercise.id);
  }

  // Activer/Désactiver un exercice
  async toggleExerciseStatus(exerciseId: number): Promise<Exercise> {
    const exercise = await this.getExerciseById(exerciseId);
    return await this.updateExercise(exerciseId, {
      isActive: !exercise.isActive,
    });
  }

  // Récupérer les statistiques des exercices
  async getExerciseStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    const total = await this.exerciseRepository.count();
    const active = await this.exerciseRepository.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    // Statistiques par type
    const typeStats = await this.exerciseRepository
      .createQueryBuilder('exercise')
      .select('exercise.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('exercise.type')
      .getRawMany();

    const byType = typeStats.reduce(
      (acc, stat) => {
        acc[stat.type] = parseInt(stat.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      byType,
      active,
      inactive,
    };
  }

  // Créer des exercices de test pour une leçon
  async createSampleExercises(lessonId: number): Promise<Exercise[]> {
    const exercises = [];

    // Exercice 1: Flashcards
    const flashcardExercise = await this.createExercise({
      title: 'Flashcards - Vocabulaire de base',
      description: 'Mémorisez les mots arabes de base',
      type: 'flashcard',
      lessonId,
      order: 1,
    });

    // Questions pour les flashcards
    const flashcardQuestions = [
      {
        text: 'Bonjour',
        metadata: { pronunciation: 'marhaban', difficulty: 'easy' as const },
        answers: [{ text: 'مرحبا', isCorrect: true, order: 1 }],
      },
      {
        text: 'Merci',
        metadata: { pronunciation: 'shukran', difficulty: 'easy' as const },
        answers: [{ text: 'شكرا', isCorrect: true, order: 1 }],
      },
      {
        text: 'Au revoir',
        metadata: {
          pronunciation: "ma'a as-salama",
          difficulty: 'easy' as const,
        },
        answers: [{ text: 'مع السلامة', isCorrect: true, order: 1 }],
      },
      {
        text: 'Excusez-moi',
        metadata: { pronunciation: 'afwan', difficulty: 'easy' as const },
        answers: [{ text: 'عفوا', isCorrect: true, order: 1 }],
      },
      {
        text: 'Bienvenue',
        metadata: {
          pronunciation: 'ahlan wa sahlan',
          difficulty: 'easy' as const,
        },
        answers: [{ text: 'أهلا وسهلا', isCorrect: true, order: 1 }],
      },
    ];

    for (const [index, questionData] of flashcardQuestions.entries()) {
      const question = await this.exerciseQuestionRepository.save({
        text: questionData.text,
        metadata: questionData.metadata,
        exerciseId: flashcardExercise.id,
        order: index + 1,
      });

      for (const answerData of questionData.answers) {
        await this.exerciseAnswerRepository.save({
          ...answerData,
          questionId: question.id,
        });
      }
    }

    exercises.push(flashcardExercise);

    // Exercice 2: Traduction
    const translationExercise = await this.createExercise({
      title: 'Exercice de traduction',
      description: 'Traduisez les phrases suivantes',
      type: 'translation',
      lessonId,
      order: 2,
    });

    const translationQuestions = [
      {
        text: 'Comment dit-on "Bonjour" en arabe ?',
        answers: [{ text: 'مرحبا', isCorrect: true, order: 1 }],
      },
      {
        text: 'Traduisez "شكرا" en français',
        answers: [{ text: 'Merci', isCorrect: true, order: 1 }],
      },
      {
        text: 'Comment dit-on "Au revoir" en arabe ?',
        answers: [{ text: 'مع السلامة', isCorrect: true, order: 1 }],
      },
    ];

    for (const [index, questionData] of translationQuestions.entries()) {
      const question = await this.exerciseQuestionRepository.save({
        text: questionData.text,
        exerciseId: translationExercise.id,
        order: index + 1,
      });

      for (const answerData of questionData.answers) {
        await this.exerciseAnswerRepository.save({
          ...answerData,
          questionId: question.id,
        });
      }
    }

    exercises.push(translationExercise);

    // Exercice 3: Écoute
    const listeningExercise = await this.createExercise({
      title: "Exercice d'écoute",
      description: 'Écoutez et répétez les mots',
      type: 'listening',
      lessonId,
      order: 3,
    });

    const listeningQuestions = [
      {
        text: 'مرحبا',
        metadata: { pronunciation: 'marhaban', difficulty: 'easy' as const },
        answers: [{ text: 'Bonjour', isCorrect: true, order: 1 }],
      },
      {
        text: 'شكرا',
        metadata: { pronunciation: 'shukran', difficulty: 'easy' as const },
        answers: [{ text: 'Merci', isCorrect: true, order: 1 }],
      },
    ];

    for (const [index, questionData] of listeningQuestions.entries()) {
      const question = await this.exerciseQuestionRepository.save({
        text: questionData.text,
        metadata: questionData.metadata,
        exerciseId: listeningExercise.id,
        order: index + 1,
      });

      for (const answerData of questionData.answers) {
        await this.exerciseAnswerRepository.save({
          ...answerData,
          questionId: question.id,
        });
      }
    }

    exercises.push(listeningExercise);

    return exercises;
  }
}
