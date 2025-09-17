import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { LevelModule } from './level/level.module';
import { LessonModule } from './lesson/lesson.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { QuizModule } from './quiz/quiz.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';
import { QuizResultModule } from './quiz-result/quiz-result.module';
import { GameModule } from './game/game.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { ChatGateway } from './chat/chat.gateway';
import { PaymentModule } from './payment/payment.module';
import { WebhookController } from './webhook/webhook.controller';
import { ClasseModule } from './classe/classe.module';
import { ScheduleModule } from './schedule/schedule.module';
import { LessonProgressModule } from './lesson-progress/lesson-progress.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceGateway } from './presence/presence.gateway';
import { VideoGateway } from './video/video.gateway';
import { NotificationsModule } from './notifications/notifications.module';
import { RegistrationModule } from './registration/registration.module';
import { AdminModule } from './admin/admin.module';
import { ExerciseModule } from './exercise/exercise.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get<number>('DB_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        // ssl: {
        //   rejectUnauthorized: false, // indispensable avec Render
        // },
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    MailModule,
    UserModule,
    CourseModule,
    AuthModule,
    CategoryModule,
    LevelModule,
    LessonModule,
    EnrollmentModule,
    QuizModule,
    QuestionModule,
    AnswerModule,
    QuizResultModule,
    GameModule,
    UploadModule,
    PaymentModule,
    ClasseModule,
    ScheduleModule,
    LessonProgressModule,
    SubcategoryModule,
    MessagesModule,
    NotificationsModule,
    RegistrationModule,
    AdminModule,
    ExerciseModule,
  ],
  providers: [ChatGateway, PresenceGateway, VideoGateway],
  controllers: [WebhookController],
})
export class AppModule {}
