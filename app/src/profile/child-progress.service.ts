import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildProgress } from './child-progress.entity';
import { ChildLevel } from './child-level.entity';

@Injectable()
export class ChildProgressService {
  constructor(
    @InjectRepository(ChildProgress)
    private readonly childProgressRepository: Repository<ChildProgress>,
    @InjectRepository(ChildLevel)
    private readonly childLevelRepository: Repository<ChildLevel>,
  ) {}

  // Créer ou mettre à jour la progression d'un enfant pour une leçon
  async updateLessonProgress(
    childId: number,
    lessonId: number,
    courseId: number,
    progressData: {
      progressPercentage: number;
      timeSpent: number;
      score?: number;
      isCompleted?: boolean;
    },
  ): Promise<ChildProgress> {
    let progress = await this.childProgressRepository.findOne({
      where: { childId, lessonId, courseId },
    });

    if (!progress) {
      progress = this.childProgressRepository.create({
        childId,
        lessonId,
        courseId,
        ...progressData,
      });
    } else {
      Object.assign(progress, progressData);
    }

    progress.lastAccessedAt = new Date();

    if (progress.isCompleted) {
      progress.status = 'completed';
    } else if (progress.progressPercentage > 0) {
      progress.status = 'in_progress';
    }

    return this.childProgressRepository.save(progress);
  }

  // Mettre à jour le niveau d'un enfant
  async updateChildLevel(
    childId: number,
    levelData: {
      currentLevel?: 'debutant' | 'intermediaire' | 'avance' | 'expert';
      levelNumber?: number;
      experiencePoints?: number;
      totalLessonsCompleted?: number;
      totalQuizzesPassed?: number;
    },
  ): Promise<ChildLevel> {
    let childLevel = await this.childLevelRepository.findOne({
      where: { childId },
    });

    if (!childLevel) {
      childLevel = this.childLevelRepository.create({
        childId,
        ...levelData,
      });
    } else {
      Object.assign(childLevel, levelData);
    }

    // Calculer automatiquement le niveau basé sur l'expérience
    if (childLevel.experiencePoints >= 1000) {
      childLevel.currentLevel = 'expert';
      childLevel.levelNumber = 4;
    } else if (childLevel.experiencePoints >= 600) {
      childLevel.currentLevel = 'avance';
      childLevel.levelNumber = 3;
    } else if (childLevel.experiencePoints >= 300) {
      childLevel.currentLevel = 'intermediaire';
      childLevel.levelNumber = 2;
    } else {
      childLevel.currentLevel = 'debutant';
      childLevel.levelNumber = 1;
    }

    childLevel.lastStudyDate = new Date();
    return this.childLevelRepository.save(childLevel);
  }

  // Obtenir la progression complète d'un enfant
  async getChildProgress(childId: number): Promise<{
    progress: ChildProgress[];
    level: ChildLevel;
    statistics: {
      totalLessons: number;
      completedLessons: number;
      averageScore: number;
      totalTimeSpent: number;
      currentStreak: number;
    };
  }> {
    const progress = await this.childProgressRepository.find({
      where: { childId },
      relations: ['course', 'lesson'],
    });

    const level = await this.childLevelRepository.findOne({
      where: { childId },
    });

    const completedLessons = progress.filter((p) => p.isCompleted);
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageScore =
      completedLessons.length > 0
        ? completedLessons.reduce((sum, p) => sum + p.score, 0) /
          completedLessons.length
        : 0;

    const statistics = {
      totalLessons: progress.length,
      completedLessons: completedLessons.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      currentStreak: level?.streakDays || 0,
    };

    return { progress, level, statistics };
  }

  // Obtenir les cours recommandés pour un enfant basé sur son niveau
  async getRecommendedCourses(childId: number): Promise<any[]> {
    const childLevel = await this.childLevelRepository.findOne({
      where: { childId },
    });

    if (!childLevel) {
      // Si pas de niveau défini, recommander le niveau débutant
      return [];
    }

    // Logique pour recommander des cours basés sur le niveau
    // À implémenter selon vos besoins
    return [];
  }

  // Marquer une leçon comme terminée et mettre à jour l'XP
  async completeLesson(
    childId: number,
    lessonId: number,
    courseId: number,
    score: number,
  ): Promise<void> {
    // Mettre à jour la progression
    await this.updateLessonProgress(childId, lessonId, courseId, {
      progressPercentage: 100,
      isCompleted: true,
      score,
      timeSpent: 0, // À calculer selon le temps réel passé
    });

    // Mettre à jour le niveau et l'XP
    const xpGained = Math.round(score / 10) + 10; // XP basé sur le score
    await this.updateChildLevel(childId, {
      experiencePoints: xpGained,
      totalLessonsCompleted: 1,
    });
  }
}
