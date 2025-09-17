import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 📊 Statistiques principales du dashboard
  @Get('dashboard/stats')
  async getDashboardStats() {
    try {
      const stats = await this.adminService.getDashboardStats();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 👥 Statistiques des utilisateurs
  @Get('users/stats')
  async getUserStats() {
    try {
      const stats = await this.adminService.getUserStats();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des stats utilisateurs:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques utilisateurs',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 📚 Statistiques des cours
  @Get('courses/stats')
  async getCourseStats() {
    try {
      const stats = await this.adminService.getCourseStats();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des stats cours:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 📈 Activités récentes
  @Get('activities/recent')
  async getRecentActivities() {
    try {
      const activities = await this.adminService.getRecentActivities();
      return {
        success: true,
        data: activities,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des activités:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des activités récentes',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚨 Alertes système
  @Get('alerts')
  async getSystemAlerts() {
    try {
      const alerts = await this.adminService.getSystemAlerts();
      return {
        success: true,
        data: alerts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des alertes:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des alertes système',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🔔 Notifications
  @Get('notifications')
  async getNotifications() {
    try {
      const notifications = await this.adminService.getNotifications();
      return {
        success: true,
        data: notifications,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des notifications:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la récupération des notifications',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 📊 Export des données
  @Get('dashboard/export')
  async exportDashboardData(@Res() res: Response) {
    try {
      const data = await this.adminService.exportDashboardData();
      const filename = `dashboard-${new Date().toISOString().split('T')[0]}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.status(HttpStatus.OK).send(data);
    } catch (error) {
      console.error("❌ Erreur lors de l'export:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Erreur lors de l'export des données",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 🎯 Marquer une alerte comme lue
  @Put('alerts/:id/dismiss')
  async dismissAlert(@Param('id') id: string) {
    try {
      const result = await this.adminService.dismissAlert(id);
      return {
        success: true,
        data: result,
        message: `Alerte ${id} marquée comme lue`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture de l'alerte:", error);
      return {
        success: false,
        error: "Erreur lors de la fermeture de l'alerte",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🔒 Vérifier les permissions (pour la sécurité)
  @Get('permissions')
  async checkPermissions() {
    try {
      // Ici vous pouvez ajouter la logique de vérification des permissions
      // basée sur le rôle de l'utilisateur connecté
      return {
        success: true,
        data: {
          canManageUsers: true,
          canManageCourses: true,
          canViewStats: true,
          canManageSystem: true,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la vérification des permissions:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la vérification des permissions',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 📱 Statistiques de performance
  @Get('performance')
  async getPerformanceStats() {
    try {
      // Ici vous pouvez ajouter de vraies métriques de performance
      const performance = {
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        uptime: '99.9%',
        memoryUsage: `${Math.floor(Math.random() * 30) + 50}%`, // 50-80%
        cpuUsage: `${Math.floor(Math.random() * 40) + 30}%`, // 30-70%
        activeConnections: Math.floor(Math.random() * 100) + 10,
        requestsPerSecond: Math.floor(Math.random() * 50) + 10,
      };

      return {
        success: true,
        data: performance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des stats de performance:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques de performance',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🔄 Rafraîchir les données
  @Get('dashboard/refresh')
  async refreshDashboardData() {
    try {
      const stats = await this.adminService.getDashboardStats();
      return {
        success: true,
        data: stats,
        message: 'Données rafraîchies avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      return {
        success: false,
        error: 'Erreur lors du rafraîchissement des données',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 📚 Gestion des cours - CRUD complet
  @Get('courses')
  async getAllCourses() {
    try {
      const courses = await this.adminService.getAllCourses();
      return {
        success: true,
        data: courses,
        message: 'Cours récupérés avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cours:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('courses')
  async createCourse(@Body() courseData: any) {
    try {
      const course = await this.adminService.createCourse(courseData);
      return {
        success: true,
        data: course,
        message: 'Cours créé avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du cours:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string) {
    try {
      const course = await this.adminService.getCourseById(parseInt(id));
      return {
        success: true,
        data: course,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du cours:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put('courses/:id')
  async updateCourse(@Param('id') id: string, @Body() courseData: any) {
    try {
      const course = await this.adminService.updateCourse(
        parseInt(id),
        courseData,
      );
      return {
        success: true,
        data: course,
        message: 'Cours mis à jour avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du cours:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteCourse(parseInt(id));
      return {
        success: true,
        data: result,
        message: 'Cours supprimé avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du cours:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du cours',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      const categories = await this.adminService.getCategories();
      return {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des catégories',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('categories')
  async createCategory(@Body() categoryData: any) {
    try {
      const category = await this.adminService.createCategory(categoryData);
      return {
        success: true,
        data: category,
        message: 'Catégorie créée avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la catégorie:', error);
      return {
        success: false,
        error: 'Erreur lors de la création de la catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() categoryData: any) {
    try {
      const category = await this.adminService.updateCategory(
        parseInt(id),
        categoryData,
      );
      return {
        success: true,
        data: category,
        message: 'Catégorie mise à jour avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la catégorie:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.adminService.deleteCategory(parseInt(id));
      return {
        success: true,
        message: 'Catégorie supprimée avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la catégorie:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression de la catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('subcategories')
  async getSubcategories() {
    try {
      const subcategories = await this.adminService.getSubcategories();
      return {
        success: true,
        data: subcategories,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des sous-catégories:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la récupération des sous-catégories',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('subcategories')
  async createSubcategory(@Body() subcategoryData: any) {
    try {
      const subcategory =
        await this.adminService.createSubcategory(subcategoryData);
      return {
        success: true,
        data: subcategory,
        message: 'Sous-catégorie créée avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la création de la sous-catégorie:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la création de la sous-catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put('subcategories/:id')
  async updateSubcategory(
    @Param('id') id: string,
    @Body() subcategoryData: any,
  ) {
    try {
      const subcategory = await this.adminService.updateSubcategory(
        parseInt(id),
        subcategoryData,
      );
      return {
        success: true,
        data: subcategory,
        message: 'Sous-catégorie mise à jour avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la mise à jour de la sous-catégorie:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la sous-catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete('subcategories/:id')
  async deleteSubcategory(@Param('id') id: string) {
    try {
      await this.adminService.deleteSubcategory(parseInt(id));
      return {
        success: true,
        message: 'Sous-catégorie supprimée avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la suppression de la sous-catégorie:',
        error,
      );
      return {
        success: false,
        error: 'Erreur lors de la suppression de la sous-catégorie',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('levels')
  async getLevels() {
    try {
      const levels = await this.adminService.getLevels();
      return {
        success: true,
        data: levels,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des niveaux:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des niveaux',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('levels')
  async createLevel(@Body() levelData: any) {
    try {
      const level = await this.adminService.createLevel(levelData);
      return {
        success: true,
        data: level,
        message: 'Niveau créé avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du niveau:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du niveau',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put('levels/:id')
  async updateLevel(@Param('id') id: string, @Body() levelData: any) {
    try {
      const level = await this.adminService.updateLevel(
        parseInt(id),
        levelData,
      );
      return {
        success: true,
        data: level,
        message: 'Niveau mis à jour avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du niveau:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du niveau',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete('levels/:id')
  async deleteLevel(@Param('id') id: string) {
    try {
      await this.adminService.deleteLevel(parseInt(id));
      return {
        success: true,
        message: 'Niveau supprimé avec succès',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du niveau:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du niveau',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
