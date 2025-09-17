import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LessonProgressService } from './lesson-progress.service';

@Controller('lesson-progress')
export class LessonProgressController {

    constructor(private readonly lessonProgressService: LessonProgressService) { }

    @Post('complete')
    markLessonDone(@Body() data: { enrollmentId: number; lessonId: number }) {
        return this.lessonProgressService.markLessonAsDone(data.enrollmentId, data.lessonId);
    }

    @Get('completed/:enrollmentId')
    async getCompletedLessons(@Param('enrollmentId') enrollmentId: number) {
        const completed = await this.lessonProgressService.getCompletedLessons(enrollmentId);
        return completed.map(lp => lp.lesson.id); // on renvoie juste un tableau d'IDs de leçons
    }

}
