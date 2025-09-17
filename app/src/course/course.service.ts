import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import {
  CourseResponseDto,
  CourseWithCompleteInfoDto,
} from './dto/course-response.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
    });
  }

  async findById(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findAllWithCompleteInfo(): Promise<CourseWithCompleteInfoDto[]> {
    const courses = await this.courseRepository.find({
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
    });

    return courses.map((course) => this.enrichCourseData(course));
  }

  async findByIdWithCompleteInfo(
    id: number,
  ): Promise<CourseWithCompleteInfoDto> {
    const course = await this.findById(id);
    return this.enrichCourseData(course);
  }

  // Méthode pour récupérer les cours par catégorie et niveau
  async findByCategoryAndLevel(
    categoryId: number,
    levelId: number,
  ): Promise<CourseWithCompleteInfoDto[]> {
    const courses = await this.courseRepository.find({
      where: {
        categoryId: categoryId,
        levelId: levelId,
      },
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
      order: {
        createdAt: 'DESC',
        lessons: { order: 'ASC' },
        quizzes: { id: 'ASC' },
      },
    });

    return courses.map((course) => this.enrichCourseData(course));
  }

  // Méthode pour récupérer les cours par catégorie
  async findByCategory(
    categoryId: number,
  ): Promise<CourseWithCompleteInfoDto[]> {
    const courses = await this.courseRepository.find({
      where: {
        categoryId: categoryId,
      },
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
      order: {
        level: { id: 'ASC' },
        createdAt: 'DESC',
      },
    });

    return courses.map((course) => this.enrichCourseData(course));
  }

  // Méthode pour récupérer les cours par niveau
  async findByLevel(levelId: number): Promise<CourseWithCompleteInfoDto[]> {
    const courses = await this.courseRepository.find({
      where: {
        levelId: levelId,
      },
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
      order: {
        category: { id: 'ASC' },
        createdAt: 'DESC',
      },
    });

    return courses.map((course) => this.enrichCourseData(course));
  }

  // Méthode pour récupérer un cours avec toutes ses relations pour l'affichage
  async getCourseForDisplay(
    courseId: number,
  ): Promise<CourseWithCompleteInfoDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'category',
        'subcategory',
        'level',
        'instructor',
        'lessons',
        'enrollments',
        'quizzes',
        'quizzes.questions',
        'quizzes.questions.answers',
      ],
      order: {
        lessons: { order: 'ASC' },
        quizzes: { id: 'ASC' },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.enrichCourseData(course);
  }

  private enrichCourseData(course: Course): CourseWithCompleteInfoDto {
    const enrichedCourse = new CourseWithCompleteInfoDto();

    // Copier les propriétés de base
    Object.assign(enrichedCourse, course);

    // Ajouter les propriétés calculées
    enrichedCourse.totalLessons = course.lessons?.length || 0;
    enrichedCourse.totalQuizzes = course.quizzes?.length || 0;
    enrichedCourse.totalQuestions =
      course.quizzes?.reduce(
        (total, quiz) => total + (quiz.questions?.length || 0),
        0,
      ) || 0;

    // Calculer la durée estimée (exemple: 15 min par leçon + 10 min par quiz)
    enrichedCourse.estimatedDuration =
      enrichedCourse.totalLessons * 15 + enrichedCourse.totalQuizzes * 10;

    // Déterminer le sujet basé sur la catégorie
    if (course.category) {
      enrichedCourse.subject = course.category.name;
      enrichedCourse.subjectInfo = {
        categoryId: course.category.id,
        categoryName: course.category.name,
        subcategoryId: course.subcategory?.id,
        subcategoryName: course.subcategory?.name,
        levelId: course.level?.id,
        levelName: course.level?.name,
      };
    } else {
      enrichedCourse.subject = 'Non défini';
      enrichedCourse.subjectInfo = null;
    }

    return enrichedCourse;
  }

  async create(courseData: any, user: any): Promise<Course> {
    const course = new Course();
    Object.assign(course, courseData);
    if (user && user.userId) {
      course.instructorId = user.userId;
    }
    return this.courseRepository.save(course);
  }

  async update(id: number, courseData: any): Promise<Course> {
    const course = await this.findById(id);
    Object.assign(course, courseData);
    return this.courseRepository.save(course);
  }

  async delete(id: number): Promise<void> {
    const course = await this.findById(id);
    await this.courseRepository.remove(course);
  }

  async getCourseQuizzes(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['quizzes', 'quizzes.questions', 'quizzes.questions.answers'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return course.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        text: question.text,
        options: question.answers.map((answer) => ({
          id: answer.id,
          text: answer.text,
          isCorrect: answer.isCorrect,
        })),
      })),
    }));
  }
}
