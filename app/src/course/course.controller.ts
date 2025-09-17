import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './course.entity';
import { CourseWithCompleteInfoDto } from './dto/course-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  getAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get('complete')
  getAllWithCompleteInfo(): Promise<CourseWithCompleteInfoDto[]> {
    return this.courseService.findAllWithCompleteInfo();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() courseData: any): Promise<Course> {
    const user = (req as any).user;
    return this.courseService.create(courseData, user);
  }

  // Route de test temporaire pour créer des cours sans authentification
  @Post('test')
  createTestCourse(@Body() courseData: any): Promise<Course> {
    // Utiliser un utilisateur de test
    const testUser = { userId: 1 };
    return this.courseService.create(courseData, testUser);
  }

  @Get(':id')
  getById(@Param('id') id: number): Promise<Course> {
    return this.courseService.findById(id);
  }

  @Get(':id/complete')
  getByIdWithCompleteInfo(
    @Param('id') id: number,
  ): Promise<CourseWithCompleteInfoDto> {
    return this.courseService.findByIdWithCompleteInfo(id);
  }

  // Nouvelle route pour récupérer les cours par catégorie et niveau
  @Get('category/:categoryId/level/:levelId')
  getByCategoryAndLevel(
    @Param('categoryId') categoryId: number,
    @Param('levelId') levelId: number,
  ): Promise<CourseWithCompleteInfoDto[]> {
    return this.courseService.findByCategoryAndLevel(categoryId, levelId);
  }

  // Route pour récupérer les cours par catégorie
  @Get('category/:categoryId')
  getByCategory(
    @Param('categoryId') categoryId: number,
  ): Promise<CourseWithCompleteInfoDto[]> {
    return this.courseService.findByCategory(categoryId);
  }

  // Route pour récupérer les cours par niveau
  @Get('level/:levelId')
  getByLevel(
    @Param('levelId') levelId: number,
  ): Promise<CourseWithCompleteInfoDto[]> {
    return this.courseService.findByLevel(levelId);
  }

  // Route pour récupérer un cours avec toutes ses relations pour l'affichage
  @Get(':id/display')
  getCourseForDisplay(
    @Param('id') id: number,
  ): Promise<CourseWithCompleteInfoDto> {
    return this.courseService.getCourseForDisplay(id);
  }

  // Route pour récupérer les quiz d'un cours
  @Get(':id/quizzes')
  getCourseQuizzes(@Param('id') id: number) {
    return this.courseService.getCourseQuizzes(id);
  }
}
