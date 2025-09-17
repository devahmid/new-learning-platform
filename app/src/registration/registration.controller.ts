import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ParentFormDto } from './dto/parent-form.dto';
import { ParentRegistration } from './entities/parent-registration.entity';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly service: RegistrationService) { }

  @Post()
  async create(@Body() dto: ParentFormDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<ParentRegistration[]> {
    return this.service.findAll();
  }

}

