import { Controller, Post, Get } from '@nestjs/common';
import { CourseSeedService } from './course-seed.service';

@Controller('course-seed')
export class CourseSeedController {
  constructor(private readonly courseSeedService: CourseSeedService) {}

  @Post('seed')
  async seedCourses() {
    try {
      const result = await this.courseSeedService.seedCourses();
      return {
        success: true,
        message: 'All lessons updated successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating lessons',
        error: error.message,
      };
    }
  }

  @Get('status')
  async getStatus() {
    return {
      message: 'Course seed service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
