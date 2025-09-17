import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { CreateUserDto } from '../user/CreateUserDto';
import { UpdateUserDto } from '../user/update-user.dto';
import { CreateParentDto } from '../profile/dto/create-parent.dto';
import { CreateChildDto } from '../profile/dto/create-child.dto';
import { UpdateParentDto } from '../profile/dto/update-parent.dto';
import { UpdateChildDto } from '../profile/dto/update-child.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/users')
// @UseGuards(JwtAuthGuard, RolesGuard) // Temporairement désactivé pour les tests
// @Roles('admin')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  // 📋 Récupérer tous les utilisateurs (admin)
  @Get()
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: 'parent' | 'child',
    @Query('search') search?: string,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const users = await this.userService.findAll();
      
      // Filtrage par type
      let filteredUsers = users;
      if (type) {
        filteredUsers = users.filter(user => user.type === type);
      }
      
      // Recherche par nom, email
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }
      
      // Pagination
      const pageNum = page || 1;
      const limitNum = limit || 50;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers,
        total: filteredUsers.length,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      throw new HttpException(
        'Erreur lors de la récupération des utilisateurs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 👤 Récupérer un utilisateur par ID (admin)
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      throw new HttpException(
        'Erreur lors de la récupération de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ➕ Créer un nouvel utilisateur (admin)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      throw new HttpException(
        'Erreur lors de la création de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ➕ Créer un parent (admin)
  @Post('parents')
  async createParent(@Body() createParentDto: CreateParentDto): Promise<User> {
    try {
      return await this.userService.createParent(createParentDto);
    } catch (error) {
      console.error('❌ Erreur lors de la création du parent:', error);
      throw new HttpException(
        'Erreur lors de la création du parent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ➕ Créer un enfant (admin)
  @Post('children')
  async createChild(@Body() createChildDto: CreateChildDto): Promise<User> {
    try {
      return await this.userService.createChild(createChildDto);
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'enfant:', error);
      throw new HttpException(
        'Erreur lors de la création de l\'enfant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✏️ Mettre à jour un utilisateur (admin)
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.userService.updateUser(id, updateUserDto);
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new HttpException(
        'Erreur lors de la mise à jour de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✏️ Mettre à jour un parent (admin)
  @Patch('parents/:id')
  async updateParent(
    @Param('id') id: number,
    @Body() updateParentDto: UpdateParentDto,
  ): Promise<User> {
    try {
      const parent = await this.userService.updateParent(id, updateParentDto);
      if (!parent) {
        throw new HttpException('Parent non trouvé', HttpStatus.NOT_FOUND);
      }
      return parent;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('❌ Erreur lors de la mise à jour du parent:', error);
      throw new HttpException(
        'Erreur lors de la mise à jour du parent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✏️ Mettre à jour un enfant (admin)
  @Patch('children/:id')
  async updateChild(
    @Param('id') id: number,
    @Body() updateChildDto: UpdateChildDto,
  ): Promise<User> {
    try {
      const child = await this.userService.updateChild(id, updateChildDto);
      if (!child) {
        throw new HttpException('Enfant non trouvé', HttpStatus.NOT_FOUND);
      }
      return child;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('❌ Erreur lors de la mise à jour de l\'enfant:', error);
      throw new HttpException(
        'Erreur lors de la mise à jour de l\'enfant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🗑️ Supprimer un utilisateur (admin)
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ message: string }> {
    try {
      await this.userService.deleteUser(id);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      throw new HttpException(
        'Erreur lors de la suppression de l\'utilisateur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🗑️ Supprimer un enfant (admin)
  @Delete('children/:id')
  async deleteChild(@Param('id') id: number): Promise<{ message: string }> {
    try {
      await this.userService.deleteChild(id);
      return { message: 'Enfant supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'enfant:', error);
      throw new HttpException(
        'Erreur lors de la suppression de l\'enfant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📊 Statistiques des utilisateurs (admin)
  @Get('stats/overview')
  async getUserStats(): Promise<{
    total: number;
    parents: number;
    children: number;
    newThisWeek: number;
    activeUsers: number;
  }> {
    try {
      const users = await this.userService.findAll();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const parents = users.filter(user => user.type === 'parent').length;
      const children = users.filter(user => user.type === 'child').length;
      const newThisWeek = users.filter(user => 
        user.createdAt && new Date(user.createdAt) >= weekAgo
      ).length;
      
      return {
        total: users.length,
        parents,
        children,
        newThisWeek,
        activeUsers: users.length, // À adapter selon votre logique métier
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 Recherche avancée d'utilisateurs (admin)
  @Get('search/advanced')
  async advancedSearch(
    @Query('query') query: string,
    @Query('type') type?: 'parent' | 'child',
    @Query('level') level?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<User[]> {
    try {
      let users = await this.userService.findAll();
      
      // Filtrage par type
      if (type) {
        users = users.filter(user => user.type === type);
      }
      
      // Filtrage par niveau
      if (level) {
        users = users.filter(user => user.level?.name === level);
      }
      
      // Filtrage par date de création
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        users = users.filter(user => 
          user.createdAt && new Date(user.createdAt) >= fromDate
        );
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        users = users.filter(user => 
          user.createdAt && new Date(user.createdAt) <= toDate
        );
      }
      
      // Recherche textuelle
      if (query) {
        const queryLower = query.toLowerCase();
        users = users.filter(user => 
          user.firstName?.toLowerCase().includes(queryLower) ||
          user.lastName?.toLowerCase().includes(queryLower) ||
          user.email?.toLowerCase().includes(queryLower) ||
          user.phoneNumber?.includes(query)
        );
      }
      
      return users;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche avancée:', error);
      throw new HttpException(
        'Erreur lors de la recherche avancée',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
