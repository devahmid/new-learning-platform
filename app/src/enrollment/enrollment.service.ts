import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  create(enrollmentData: Partial<Enrollment>): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create(enrollmentData);
    return this.enrollmentRepository.save(enrollment);
  }

  findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ relations: ['student', 'course', 'quizResults'] });
  }

  findOne(id: number): Promise<Enrollment> {
    return this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'course', 'quizResults'],
    });
  }

  async update(id: number, updateData: Partial<Enrollment>): Promise<Enrollment> {
    await this.enrollmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.enrollmentRepository.delete(id);
  }

  async getProgress(enrollmentId: number): Promise<number> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'course.lessons', 'lessonProgress', 'quizResults', 'course.quizzes'],
    });
  
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.lessonProgress.filter(lp => lp.completed).length;
  
    const totalQuizzes = enrollment.course.quizzes.length;
    const passedQuizzes = enrollment.quizResults.filter(qr => qr.validated).length;
  
    const totalSteps = totalLessons + totalQuizzes;
    const doneSteps = completedLessons + passedQuizzes;
  
    return totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  }
  
  async enroll(userId: number, courseId: number): Promise<Enrollment> {
    console.log('********', userId)
    console.log('********', courseId)
    const existing = await this.enrollmentRepository.findOne({ where: { student: { id: userId }, course: { id: courseId } } });
  
    if (existing) return existing;
  
    const enrollment = this.enrollmentRepository.create({
      student: { id: userId },
      course: { id: courseId },
      progress: 0,
    });
  
    return this.enrollmentRepository.save(enrollment);
  }
  
  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: userId },
        course: { id: courseId },
      },
      relations: ['student', 'course'],
    });
    
    return !!enrollment;
  }
  async findOneByUserAndCourse(userId: number, courseId: number) {
    return this.enrollmentRepository.findOne({
      where: {
        student: { id: userId },
        course: { id: courseId }
      }
    });
  }
  
}
