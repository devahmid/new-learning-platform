import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { Lesson } from './lesson.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { Course } from 'src/course/course.entity';
import { ExerciseService } from '../exercise/exercise.service';

@Controller('lessons')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly exerciseService: ExerciseService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  async createLesson(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<Lesson> {
    const lessonData: Partial<Lesson> = {
      title: body.title,
      content: body.content,
      order: body.order ?? 1,
      fileUrl: file?.filename,
      course: { id: +body.courseId } as Course,
    };

    return this.lessonService.create(lessonData);
  }

  @Post(':id/upload-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  async uploadLessonFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Lesson> {
    return this.lessonService.update(+id, { fileUrl: file.filename });
  }

  @Get()
  findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonService.findOne(+id);
  }

  // Récupérer les exercices d'une leçon
  @Get(':id/exercises')
  async getLessonExercises(@Param('id') id: string) {
    return await this.exerciseService.getExercisesByLesson(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: Partial<Lesson>,
  ): Promise<Lesson> {
    return this.lessonService.update(+id, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.lessonService.remove(+id);
  }
}
