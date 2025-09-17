import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParentRegistration } from './entities/parent-registration.entity';
import { Repository } from 'typeorm';
import { ParentFormDto } from './dto/parent-form.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(ParentRegistration)
    private parentRepo: Repository<ParentRegistration>,
    private readonly mailService: MailService,
  ) { }

  async create(dto: ParentFormDto): Promise<ParentRegistration> {
    const parent = this.parentRepo.create({
      ...dto,
      children: dto.children.map(child => ({ ...child })),
    });

    const saved = await this.parentRepo.save(parent);

    await this.mailService.sendRegistrationConfirmationEmail({
      email: saved.email,
      fullName: saved.fullName,
      children: saved.children,
      wasRegisteredLastYear: saved.wasRegisteredLastYear,
    });


    return saved;
  }

  async findAll(): Promise<ParentRegistration[]> {
    return this.parentRepo.find({ order: { id: 'DESC' } });
  }


}

