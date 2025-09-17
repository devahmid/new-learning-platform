import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Category } from '../category/category.entity';
import { Subcategory } from '../subcategory/entities/subcategory.entity';
import { Level } from '../level/level.entity';
import { User } from '../user/user.entity';
import { Quiz } from '../quiz/quiz.entity';
import { Question } from '../question/question.entity';
import { Answer } from '../answer/answer.entity';

@Injectable()
export class CourseSeedService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async seedCourses() {
    console.log('🌱 Seeding courses...');

    try {
      // Récupérer ou créer les entités de base
      const category = await this.getOrCreateCategory();
      const subcategory = await this.getOrCreateSubcategory(category);
      const level = await this.getOrCreateLevel();
      const instructor = await this.getOrCreateInstructor();

      // Créer le cours principal
      const course = await this.createMainCourse(
        category,
        subcategory,
        level,
        instructor,
      );

      // Mettre à jour TOUTES les leçons existantes avec les nouvelles URLs
      await this.updateAllExistingLessons();

      // Créer les quiz pour le cours
      await this.createQuizzesForCourse(course);

      console.log('✅ Courses seeded successfully!');
      return { success: true, courseId: course.id };
    } catch (error) {
      console.error('❌ Error seeding courses:', error);
      throw error;
    }
  }

  private async getOrCreateCategory(): Promise<Category> {
    let category = await this.categoryRepository.findOne({
      where: { name: 'Langues' },
    });

    if (!category) {
      category = this.categoryRepository.create({
        name: 'Langues',
        description: 'Cours de langues étrangères',
      });
      await this.categoryRepository.save(category);
    }

    return category;
  }

  private async getOrCreateSubcategory(
    category: Category,
  ): Promise<Subcategory> {
    let subcategory = await this.subcategoryRepository.findOne({
      where: { name: 'Arabe' },
    });

    if (!subcategory) {
      subcategory = this.subcategoryRepository.create({
        name: 'Arabe',
        description: 'Cours de langue arabe',
        category: category,
      });
      await this.subcategoryRepository.save(subcategory);
    }

    return subcategory;
  }

  private async getOrCreateLevel(): Promise<Level> {
    let level = await this.levelRepository.findOne({
      where: { name: 'Débutant' },
    });

    if (!level) {
      level = this.levelRepository.create({
        name: 'Débutant',
        description: "Niveau débutant pour l'apprentissage de l'arabe",
      });
      await this.levelRepository.save(level);
    }

    return level;
  }

  private async getOrCreateInstructor(): Promise<User> {
    let instructor = await this.userRepository.findOne({
      where: { email: 'prof.arabe@example.com' },
    });

    if (!instructor) {
      instructor = this.userRepository.create({
        firstName: 'Prof',
        lastName: 'Arabe',
        email: 'prof.arabe@example.com',
        password: 'hashedPassword123',
        role: 'teacher',
      });
      await this.userRepository.save(instructor);
    }

    return instructor;
  }

  private async createMainCourse(
    category: Category,
    subcategory: Subcategory,
    level: Level,
    instructor: User,
  ): Promise<Course> {
    let course = await this.courseRepository.findOne({
      where: { title: 'Arabe Niveau 1 - Débutant' },
    });

    if (!course) {
      course = this.courseRepository.create({
        title: 'Arabe Niveau 1 - Débutant',
        description:
          "Cours complet d'arabe pour débutants avec vocabulaire, grammaire et exercices pratiques",
        categoryId: category.id,
        subcategoryId: subcategory.id,
        levelId: level.id,
        instructorId: instructor.id,
      });
      await this.courseRepository.save(course);
    }

    return course;
  }

  private async updateAllExistingLessons() {
    console.log('🔄 Updating all existing lessons with new video URLs...');

    const lessonsData = [
      {
        title: 'Les salutations en arabe',
        content: 'Apprenez les salutations de base en arabe',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        fileUrl: 'https://example.com/lesson1.pdf',
        duration: 15,
      },
      {
        title: 'Les nombres de 1 à 10',
        content: 'Apprenez à compter de 1 à 10 en arabe',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        fileUrl: 'https://example.com/lesson2.pdf',
        duration: 20,
      },
      {
        title: 'Les couleurs de base',
        content: 'Apprenez les couleurs principales en arabe',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        fileUrl: 'https://example.com/lesson3.pdf',
        duration: 18,
      },
      {
        title: "Les lettres de l'alphabet",
        content: "Découvrez l'alphabet arabe",
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        fileUrl: 'https://example.com/lesson4.pdf',
        duration: 25,
      },
      {
        title: 'Les voyelles courtes',
        content: 'Apprenez les voyelles courtes en arabe',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        fileUrl: 'https://example.com/lesson5.pdf',
        duration: 22,
      },
      {
        title: 'Formation des mots simples',
        content: 'Apprenez à former des mots simples en arabe',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        fileUrl: 'https://example.com/lesson6.pdf',
        duration: 20,
      },
    ];

    // Récupérer toutes les leçons existantes
    const existingLessons = await this.lessonRepository.find();
    console.log(`📚 Found ${existingLessons.length} existing lessons`);

    // Mettre à jour chaque leçon avec une nouvelle URL
    for (let i = 0; i < existingLessons.length; i++) {
      const lesson = existingLessons[i];
      const lessonData = lessonsData[i % lessonsData.length]; // Cycle à travers les données

      // Mettre à jour la leçon
      await this.lessonRepository.update(lesson.id, {
        title: lessonData.title,
        content: lessonData.content,
        videoUrl: lessonData.videoUrl,
        fileUrl: lessonData.fileUrl,
      });

      console.log(`✅ Updated lesson ${lesson.id}: ${lessonData.title}`);
    }

    console.log('🎯 All existing lessons updated with new video URLs');
  }

  private async createQuizzesForCourse(course: Course) {
    console.log('🎯 Creating quizzes for course...');

    // Supprimer les quiz existants pour ce cours
    await this.quizRepository.delete({ courseId: course.id });

    // Créer le quiz principal
    const quiz = await this.quizRepository.save({
      title: 'Quiz de révision - Arabe Niveau 1',
      courseId: course.id,
    });

    console.log(`✅ Created quiz: ${quiz.title}`);

    // Créer les questions et réponses
    const questionsData = [
      {
        text: "Comment dit-on 'Bonjour' en arabe ?",
        answers: [
          { text: 'مرحبا', isCorrect: true },
          { text: 'شكرا', isCorrect: false },
          { text: 'مع السلامة', isCorrect: false },
          { text: 'أهلا وسهلا', isCorrect: false },
        ],
      },
      {
        text: "Quelle est la traduction de 'Merci' ?",
        answers: [
          { text: 'مرحبا', isCorrect: false },
          { text: 'شكرا', isCorrect: true },
          { text: 'عفوا', isCorrect: false },
          { text: 'أهلا وسهلا', isCorrect: false },
        ],
      },
      {
        text: "Comment dit-on 'Au revoir' ?",
        answers: [
          { text: 'مرحبا', isCorrect: false },
          { text: 'شكرا', isCorrect: false },
          { text: 'مع السلامة', isCorrect: true },
          { text: 'أهلا وسهلا', isCorrect: false },
        ],
      },
      {
        text: "Comment dit-on 'Excusez-moi' ?",
        answers: [
          { text: 'مرحبا', isCorrect: false },
          { text: 'شكرا', isCorrect: false },
          { text: 'عفوا', isCorrect: true },
          { text: 'أهلا وسهلا', isCorrect: false },
        ],
      },
      {
        text: "Comment dit-on 'Bienvenue' ?",
        answers: [
          { text: 'مرحبا', isCorrect: false },
          { text: 'شكرا', isCorrect: false },
          { text: 'مع السلامة', isCorrect: false },
          { text: 'أهلا وسهلا', isCorrect: true },
        ],
      },
    ];

    for (const questionData of questionsData) {
      // Créer la question
      const question = await this.questionRepository.save({
        text: questionData.text,
        quizId: quiz.id,
      });

      console.log(`✅ Created question: ${question.text}`);

      // Créer les réponses
      for (const answerData of questionData.answers) {
        await this.answerRepository.save({
          text: answerData.text,
          isCorrect: answerData.isCorrect,
          questionId: question.id,
        });
      }

      console.log(
        `✅ Created ${questionData.answers.length} answers for question`,
      );
    }

    console.log('🎯 Quiz creation completed!');
  }
}
