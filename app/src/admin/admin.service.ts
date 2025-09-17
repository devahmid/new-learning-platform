import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Quiz } from '../quiz/quiz.entity';
import { QuizResult } from '../quiz-result/quiz-result.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
import { LessonProgress } from '../lesson-progress/lesson-progress.entity';
import { LevelService } from '../level/level.service';

export interface DashboardStats {
  users: {
    total: number;
    students: number;
    parents: number;
    teachers: number;
    admins: number;
    newThisWeek: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    newThisMonth: number;
  };
  lessons: {
    total: number;
    completed: number;
    inProgress: number;
  };
  quizzes: {
    total: number;
    completed: number;
    averageScore: number;
  };
  activities: {
    recent: Array<{
      id: string;
      type:
        | 'course_created'
        | 'user_registered'
        | 'quiz_completed'
        | 'lesson_updated';
      description: string;
      timestamp: Date;
      userId?: string;
      courseId?: string;
    }>;
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    description: string;
    timestamp: Date;
    dismissed: boolean;
  }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizResult)
    private quizResultRepository: Repository<QuizResult>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    private levelService: LevelService,
  ) {}

  // 📊 Récupérer toutes les statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      userStats,
      courseStats,
      lessonStats,
      quizStats,
      recentActivities,
      systemAlerts,
    ] = await Promise.all([
      this.getUserStats(),
      this.getCourseStats(),
      this.getLessonStats(),
      this.getQuizStats(),
      this.getRecentActivities(),
      this.getSystemAlerts(),
    ]);

    return {
      users: userStats,
      courses: courseStats,
      lessons: lessonStats,
      quizzes: quizStats,
      activities: { recent: recentActivities },
      alerts: systemAlerts,
    };
  }

  // 👥 Statistiques des utilisateurs
  async getUserStats() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, newThisWeek] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: {
          createdAt: Between(weekAgo, now),
        },
      }),
    ]);

    // Compter par rôle en utilisant la vraie propriété 'role'
    const students = await this.userRepository.count({
      where: { role: 'student' },
    });
    const parents = await this.userRepository.count({
      where: { role: 'parent' },
    });
    const teachers = await this.userRepository.count({
      where: { role: 'teacher' },
    });
    const admins = await this.userRepository.count({
      where: { role: 'admin' },
    });

    return {
      total,
      students,
      parents,
      teachers,
      admins,
      newThisWeek,
    };
  }

  // 📚 Statistiques des cours
  async getCourseStats() {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, newThisMonth] = await Promise.all([
      this.courseRepository.count(),
      this.courseRepository.count({
        where: {
          createdAt: Between(monthAgo, now),
        },
      }),
    ]);

    // Pour l'instant, on simule les statuts car ils n'existent pas dans l'entité
    const published = Math.floor(total * 0.75); // 75% des cours sont "publiés"
    const draft = Math.floor(total * 0.2); // 20% sont en brouillon
    const archived = total - published - draft; // Le reste est archivé

    return {
      total,
      published,
      draft,
      archived,
      newThisMonth,
    };
  }

  // 📖 Statistiques des leçons
  async getLessonStats() {
    const [total] = await Promise.all([this.lessonRepository.count()]);

    // Pour l'instant, on simule les statuts car ils n'existent pas dans l'entité
    const completed = Math.floor(total * 0.85); // 85% des leçons sont "terminées"
    const inProgress = total - completed; // Le reste est en cours

    return {
      total,
      completed,
      inProgress,
    };
  }

  // 🧩 Statistiques des quiz
  async getQuizStats() {
    const [total, completed, averageScore] = await Promise.all([
      this.quizRepository.count(),
      this.quizResultRepository.count(),
      this.quizResultRepository
        .createQueryBuilder('qr')
        .select('AVG(qr.score)', 'avgScore')
        .getRawOne()
        .then((result) => parseFloat(result.avgScore) || 0),
    ]);

    return {
      total,
      completed,
      averageScore: Math.round(averageScore),
    };
  }

  // 📈 Activités récentes
  async getRecentActivities() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Récupérer les dernières activités
    const recentUsers = await this.userRepository.find({
      where: {
        createdAt: Between(dayAgo, now),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentCourses = await this.courseRepository.find({
      where: {
        createdAt: Between(dayAgo, now),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentQuizResults = await this.quizResultRepository.find({
      where: {
        createdAt: Between(dayAgo, now),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Transformer en format d'activités
    const activities = [];

    // Utilisateurs récents
    recentUsers.forEach((user, index) => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registered' as const,
        description: `Nouvel utilisateur "${user.firstName || 'Utilisateur'} ${user.lastName || 'Anonyme'}" inscrit`,
        timestamp: user.createdAt,
        userId: user.id.toString(),
      });
    });

    // Cours récents
    recentCourses.forEach((course, index) => {
      activities.push({
        id: `course_${course.id}`,
        type: 'course_created' as const,
        description: `Nouveau cours "${course.title}" créé`,
        timestamp: course.createdAt,
        courseId: course.id.toString(),
      });
    });

    // Quiz récents
    recentQuizResults.forEach((result, index) => {
      activities.push({
        id: `quiz_${result.id}`,
        type: 'quiz_completed' as const,
        description: `Quiz complété avec un score de ${result.score}%`,
        timestamp: result.createdAt, // Utiliser createdAt au lieu de completedAt
      });
    });

    // Trier par date et prendre les 10 plus récentes
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  // 🚨 Alertes système
  async getSystemAlerts() {
    // Vérifier l'espace disque (simulation)
    const diskSpace = await this.checkDiskSpace();
    const alerts = [];

    if (diskSpace < 20) {
      alerts.push({
        id: 'disk_space',
        type: 'warning' as const,
        title: 'Espace disque faible',
        description: `Il reste seulement ${diskSpace}% d'espace disque disponible`,
        timestamp: new Date(),
        dismissed: false,
      });
    }

    // Vérifier les sauvegardes
    const lastBackup = await this.getLastBackupDate();
    const daysSinceBackup = Math.floor(
      (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceBackup > 7) {
      alerts.push({
        id: 'backup_required',
        type: 'warning' as const,
        title: 'Sauvegarde requise',
        description: `La dernière sauvegarde date de ${daysSinceBackup} jours`,
        timestamp: new Date(),
        dismissed: false,
      });
    }

    // Vérifier les performances
    const performance = await this.checkSystemPerformance();
    if (performance.responseTime > 1000) {
      alerts.push({
        id: 'performance_issue',
        type: 'warning' as const,
        title: 'Problème de performance',
        description: `Temps de réponse élevé: ${performance.responseTime}ms`,
        timestamp: new Date(),
        dismissed: false,
      });
    }

    return alerts;
  }

  // 🔔 Notifications
  async getNotifications() {
    // Récupérer les notifications non lues
    const notifications = [];

    // Notifications de nouveaux utilisateurs
    const newUsers = await this.userRepository.count({
      where: {
        createdAt: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });

    if (newUsers > 0) {
      notifications.push({
        id: 'new_users',
        type: 'info',
        title: 'Nouveaux utilisateurs',
        message: `${newUsers} nouvel(le)(s) utilisateur(s) cette semaine`,
        timestamp: new Date(),
      });
    }

    // Notifications de cours
    const newCourses = await this.courseRepository.count({
      where: {
        createdAt: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date(),
        ),
      },
    });

    if (newCourses > 0) {
      notifications.push({
        id: 'new_courses',
        type: 'info',
        title: 'Nouveaux cours',
        message: `${newCourses} nouveau(x) cours créé(s) cette semaine`,
        timestamp: new Date(),
      });
    }

    return notifications;
  }

  // 📊 Export des données
  async exportDashboardData() {
    const stats = await this.getDashboardStats();
    return JSON.stringify(stats, null, 2);
  }

  // 🎯 Marquer une alerte comme lue
  async dismissAlert(alertId: string) {
    // Logique pour marquer l'alerte comme lue
    console.log(`Alerte ${alertId} marquée comme lue`);
    return { success: true };
  }

  // 🔧 Méthodes utilitaires privées
  private async checkDiskSpace(): Promise<number> {
    // Simulation - à remplacer par une vraie vérification
    return Math.floor(Math.random() * 30) + 10; // 10-40%
  }

  private async getLastBackupDate(): Promise<Date> {
    // Simulation - à remplacer par une vraie vérification
    return new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
  }

  private async checkSystemPerformance(): Promise<{ responseTime: number }> {
    // Simulation - à remplacer par une vraie vérification
    return { responseTime: Math.floor(Math.random() * 2000) + 100 };
  }

  // 📚 Méthodes CRUD pour les cours
  async createCourse(courseData: any): Promise<Course> {
    try {
      // Créer l'entité sans les relations complexes pour l'instant
      const courseDataToSave = {
        title: courseData.title,
        description: courseData.description,
        videoUrl: courseData.videoUrl,
        pdfUrl: courseData.pdfUrl,
        categoryId: courseData.categoryId,
        subcategoryId: courseData.subcategoryId,
        levelId: courseData.levelId,
        instructorId: courseData.instructorId || 1, // ID par défaut pour l'admin
      };

      const course = this.courseRepository.create(courseDataToSave);
      const savedCourse = await this.courseRepository.save(course);

      // Créer les leçons si elles existent
      if (courseData.lessons && courseData.lessons.length > 0) {
        await this.createLessons(savedCourse.id, courseData.lessons);
      }

      // Créer les quiz si ils existent
      if (courseData.quizzes && courseData.quizzes.length > 0) {
        await this.createQuizzes(savedCourse.id, courseData.quizzes);
      }

      // Récupérer le cours complet avec ses relations
      return await this.getCourseById(savedCourse.id);
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      throw new Error('Impossible de créer le cours');
    }
  }

  async getAllCourses(): Promise<Course[]> {
    try {
      const courses = await this.courseRepository.find({
        relations: [
          'lessons',
          'quizzes',
          'category',
          'subcategory',
          'level',
          'instructor',
        ],
        order: {
          createdAt: 'DESC',
        },
      });
      return courses;
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      throw new Error('Impossible de récupérer les cours');
    }
  }

  async getCourseById(id: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['lessons', 'quizzes', 'category', 'subcategory', 'level'],
      });
      if (!course) {
        throw new Error('Cours non trouvé');
      }
      return course;
    } catch (error) {
      console.error('Erreur lors de la récupération du cours:', error);
      throw new Error('Impossible de récupérer le cours');
    }
  }

  async updateCourse(id: number, courseData: any): Promise<Course> {
    try {
      const updateResult = await this.courseRepository.update(id, courseData);
      if (updateResult.affected === 0) {
        throw new Error('Cours non trouvé');
      }
      return await this.getCourseById(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
      throw new Error('Impossible de mettre à jour le cours');
    }
  }

  async deleteCourse(id: number): Promise<boolean> {
    try {
      const result = await this.courseRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      throw new Error('Impossible de supprimer le cours');
    }
  }

  // 📂 Méthodes pour les catégories et niveaux
  async getCategories(): Promise<any[]> {
    try {
      // Retourner les catégories stockées en mémoire
      return [...this.categories];
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  }

  // Stockage en mémoire des catégories
  private categories: any[] = [
    {
      id: 1,
      name: 'Langues',
      description: 'Apprentissage des langues',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 20,
    },
    {
      id: 2,
      name: 'Sciences',
      description: 'Physique, chimie, SVT',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 15,
    },
    {
      id: 3,
      name: 'Mathématiques',
      description: 'Algèbre, géométrie, analyse',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 18,
    },
  ];

  async createCategory(categoryData: any): Promise<any> {
    try {
      const newId = Math.max(...this.categories.map((c) => c.id), 0) + 1;
      const newCategory = {
        id: newId,
        name: categoryData.name,
        description: categoryData.description || '',
        courseCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.categories.push(newCategory);
      return newCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw new Error('Impossible de créer la catégorie');
    }
  }

  async updateCategory(id: number, categoryData: any): Promise<any> {
    try {
      const index = this.categories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Catégorie non trouvée');
      const updated = {
        ...this.categories[index],
        name: categoryData.name,
        description: categoryData.description || '',
        updatedAt: new Date(),
      };
      this.categories[index] = updated;
      return updated;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw new Error('Impossible de mettre à jour la catégorie');
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      const index = this.categories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Catégorie non trouvée');
      this.categories.splice(index, 1);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      throw new Error('Impossible de supprimer la catégorie');
    }
  }

  // Stockage en mémoire des sous-catégories
  private subcategories: any[] = [
    {
      id: 1,
      name: 'Arabe',
      categoryId: 1,
      description: 'Langue arabe',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 8,
    },
    {
      id: 2,
      name: 'Français',
      categoryId: 1,
      description: 'Langue française',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 12,
    },
    {
      id: 3,
      name: 'Anglais',
      categoryId: 1,
      description: 'Langue anglaise',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 15,
    },
    {
      id: 4,
      name: 'Physique',
      categoryId: 2,
      description: 'Sciences physiques',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 6,
    },
    {
      id: 5,
      name: 'Chimie',
      categoryId: 2,
      description: 'Sciences chimiques',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 4,
    },
    {
      id: 6,
      name: 'Algèbre',
      categoryId: 3,
      description: 'Mathématiques algébriques',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 10,
    },
    {
      id: 7,
      name: 'Géométrie',
      categoryId: 3,
      description: 'Mathématiques géométriques',
      createdAt: new Date(),
      updatedAt: new Date(),
      courseCount: 8,
    },
  ];

  async getSubcategories(): Promise<any[]> {
    try {
      // Retourner les sous-catégories avec les noms des catégories parentes
      return this.subcategories.map((subcategory) => ({
        ...subcategory,
        categoryName:
          this.categories.find((c) => c.id === subcategory.categoryId)?.name ||
          'Inconnue',
      }));
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des sous-catégories:',
        error,
      );
      return [];
    }
  }

  async createSubcategory(subcategoryData: any): Promise<any> {
    try {
      const newId = Math.max(...this.subcategories.map((s) => s.id), 0) + 1;
      const newSubcategory = {
        id: newId,
        name: subcategoryData.name,
        categoryId: subcategoryData.categoryId,
        description: subcategoryData.description || '',
        courseCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.subcategories.push(newSubcategory);

      // Retourner avec le nom de la catégorie
      const categoryName =
        this.categories.find((c) => c.id === newSubcategory.categoryId)?.name ||
        'Inconnue';
      return { ...newSubcategory, categoryName };
    } catch (error) {
      console.error('Erreur lors de la création de la sous-catégorie:', error);
      throw new Error('Impossible de créer la sous-catégorie');
    }
  }

  async updateSubcategory(id: number, subcategoryData: any): Promise<any> {
    try {
      const index = this.subcategories.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Sous-catégorie non trouvée');

      const updated = {
        ...this.subcategories[index],
        name: subcategoryData.name,
        categoryId: subcategoryData.categoryId,
        description: subcategoryData.description || '',
        updatedAt: new Date(),
      };
      this.subcategories[index] = updated;

      // Retourner avec le nom de la catégorie
      const categoryName =
        this.categories.find((c) => c.id === updated.categoryId)?.name ||
        'Inconnue';
      return { ...updated, categoryName };
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la sous-catégorie:',
        error,
      );
      throw new Error('Impossible de mettre à jour la sous-catégorie');
    }
  }

  async deleteSubcategory(id: number): Promise<void> {
    try {
      const index = this.subcategories.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Sous-catégorie non trouvée');
      this.subcategories.splice(index, 1);
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de la sous-catégorie:',
        error,
      );
      throw new Error('Impossible de supprimer la sous-catégorie');
    }
  }

  // Utilisation du vrai LevelService pour la persistance en BDD

  async getLevels(): Promise<any[]> {
    try {
      // Utiliser le vrai LevelService pour récupérer depuis la BDD
      return await this.levelService.findAll();
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux:', error);
      return [];
    }
  }

  async createLevel(levelData: any): Promise<any> {
    try {
      // Utiliser le vrai LevelService pour créer en BDD
      const newLevel = await this.levelService.create({
        name: levelData.name,
        description: levelData.description || '',
      });

      console.log('Niveau créé en BDD:', newLevel);
      return newLevel;
    } catch (error) {
      console.error('Erreur lors de la création du niveau:', error);
      throw new Error('Impossible de créer le niveau');
    }
  }

  async updateLevel(id: number, levelData: any): Promise<any> {
    try {
      // Utiliser le vrai LevelService pour mettre à jour en BDD
      const updatedLevel = await this.levelService.update(id, {
        name: levelData.name,
        description: levelData.description || '',
      });

      console.log('Niveau mis à jour en BDD:', updatedLevel);
      return updatedLevel;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du niveau:', error);
      throw new Error('Impossible de mettre à jour le niveau');
    }
  }

  async deleteLevel(id: number): Promise<void> {
    try {
      // Utiliser le vrai LevelService pour supprimer en BDD
      await this.levelService.remove(id);

      console.log('Niveau supprimé en BDD avec ID:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du niveau:', error);
      throw new Error('Impossible de supprimer le niveau');
    }
  }

  // 🔧 Méthodes privées pour créer les relations
  private async createLessons(
    courseId: number,
    lessonsData: any[],
  ): Promise<void> {
    try {
      for (const lessonData of lessonsData) {
        const lesson = this.lessonRepository.create({
          ...lessonData,
          courseId: courseId,
        });
        await this.lessonRepository.save(lesson);
      }
    } catch (error) {
      console.error('Erreur lors de la création des leçons:', error);
      throw new Error('Impossible de créer les leçons');
    }
  }

  private async createQuizzes(
    courseId: number,
    quizzesData: any[],
  ): Promise<void> {
    try {
      for (const quizData of quizzesData) {
        const quiz = this.quizRepository.create({
          ...quizData,
          courseId: courseId,
        });
        await this.quizRepository.save(quiz);
      }
    } catch (error) {
      console.error('Erreur lors de la création des quiz:', error);
      throw new Error('Impossible de créer les quiz');
    }
  }
}
