import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './enrollment.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  // @Post()
  // create(@Body() createEnrollmentDto: Partial<Enrollment>): Promise<Enrollment> {
  //   return this.enrollmentService.create(createEnrollmentDto);
  // }
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { courseId: number }, @Req() req: any) {
    const user = req.user;
    console.log('USER*** ', user)
    return this.enrollmentService.enroll(user.userId, body.courseId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('check/:courseId')
  // async isEnrolled(
  //   @Param('courseId') courseId: number,
  //   @Req() req: any,
  // ): Promise<{ enrolled: boolean }> {
  //   const userId = req.user.userId;
  //   const enrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
  //   return { enrolled };
  // }
  @Get('check/:courseId')
  @UseGuards(JwtAuthGuard)
  async checkEnrollment(@Param('courseId') courseId: number, @Req() req: any) {
    const userId = req.user.userId;
    const enrollment = await this.enrollmentService.findOneByUserAndCourse(userId, courseId);
    return { enrolled: !!enrollment, enrollmentId: enrollment?.id || null };
  }
  

  @Get()
  findAll(): Promise<Enrollment[]> {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Enrollment> {
    return this.enrollmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnrollmentDto: Partial<Enrollment>): Promise<Enrollment> {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.enrollmentService.remove(+id);
  }
}
