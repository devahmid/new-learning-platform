import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';
import { CreateUserDto } from './CreateUserDto';
import { UpdateUserDto } from './update-user.dto';
import { Level } from 'src/level/level.entity';
import { CreateParentDto } from 'src/profile/dto/create-parent.dto';
import { ChildProfile } from 'src/profile/child-profile.entity';
import { ParentProfile } from 'src/profile/parent-profile.entity';
import { CreateChildDto } from 'src/profile/dto/create-child.dto';
import { UpdateParentDto } from 'src/profile/dto/update-parent.dto';
import { UpdateChildDto } from 'src/profile/dto/update-child.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(ChildProfile)
    private readonly childProfileRepository: Repository<ChildProfile>,
    @InjectRepository(ParentProfile)
    private readonly parentProfileRepository: Repository<ParentProfile>,
  ) {}

  //await this.mailService.sendResetPasswordEmail(User.email, User.resetToken);

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['children.level', 'level', 'classe'],
      order: {
        id: 'DESC',
      },
    });
  }

  findAllParentsWithChildren(): Promise<User[]> {
    return this.userRepository.find({
      where: { type: 'parent' },
      relations: ['children', 'children.level', 'level', 'classe'],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    const user = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
      type: 'parent',
      role: 'user',
    });

    return this.userRepository.save(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });

    if (
      !user ||
      !user.resetTokenExpiration ||
      user.resetTokenExpiration.getTime() < Date.now()
    ) {
      throw new Error('Token invalide ou expiré');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await this.userRepository.save(user);
  }

  // async createChild(dto: CreateChildDto): Promise<User> {
  //   const parent = await this.userRepository.findOne({ where: { id: dto.parentId } });
  //   if (!parent || parent.type !== 'parent') {
  //     throw new BadRequestException('Seul un parent peut créer un enfant');
  //   }

  //   const level = await this.levelRepository.findOne({ where: { id: dto.levelId } });
  //   if (!level) {
  //     throw new BadRequestException('Niveau invalide');
  //   }

  //   const child = this.userRepository.create({
  //     firstName: dto.firstName,
  //     lastName: dto.lastName,
  //     dateOfBirth: new Date(dto.dateOfBirth),
  //     type: 'child',
  //     parent,
  //     email: null,
  //     password: '',
  //     level,
  //   });

  //   return this.userRepository.save(child);
  // }

  async getChildren(parentId: number): Promise<User[]> {
    const parent = await this.userRepository.findOne({
      where: { id: parentId },
      relations: ['children'],
    });
    console.log('********PARENRT*********** ', parent);
    if (!parent) return [];

    return parent.children;
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['classe', 'level'],
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    if ('classe' in data) {
      user.classe = data.classe?.id ? ({ id: data.classe.id } as any) : null;
    }

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email !== undefined) user.email = data.email;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.password !== undefined) user.password = data.password;
    if (data.dateOfBirth) user.dateOfBirth = new Date(data.dateOfBirth);
    if (data.type) user.type = data.type;
    if (data.role) user.role = data.role;
    if (data.level?.id) user.level = { id: data.level.id } as any;
    if (data.classe?.id) user.classe = { id: data.classe.id } as any;
    if (data.resetToken !== undefined) user.resetToken = data.resetToken;
    if (data.resetTokenExpiration)
      user.resetTokenExpiration = new Date(data.resetTokenExpiration);

    return this.userRepository.save(user);
  }

  async deleteChild(id: number): Promise<void> {
    const child = await this.userRepository.findOne({
      where: { id, type: 'child' },
    });

    if (!child) throw new NotFoundException('Enfant introuvable');

    await this.userRepository.remove(child);
  }

  async deleteUser(id: number): Promise<void> {
    const parent = await this.userRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!parent) throw new NotFoundException('Utilisateur introuvable');

    if (parent.children.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un parent avec des enfants.',
      );
    }

    await this.userRepository.remove(parent);
  }

  // async findById(id: number): Promise<User> {
  //   return this.userRepository.findOneOrFail({ where: { id } });
  // }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['level', 'children', 'parentProfile', 'payments'],
    });
  }

  async getParentProfile(id: number): Promise<User> {
    const parent = await this.userRepository.findOne({
      where: { id, type: 'parent' },
      relations: [
        'parentProfile',
        'children',
        'children.level',
        'children.childProfile',
        'payments',
        'classe',
        'level',
        'enrollments',
        'games',
      ],
    });

    if (!parent) throw new NotFoundException('Parent introuvable');

    return parent;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async createParent(dto: CreateParentDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const profile = this.parentProfileRepository.create(dto.parentProfile);

    const parent = this.userRepository.create({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      type: 'parent',
      role: 'user',
      parentProfile: profile,
    });

    return this.userRepository.save(parent);
  }

  async createChild(dto: CreateChildDto): Promise<User> {
    const parent = await this.userRepository.findOne({
      where: { id: dto.parentId, type: 'parent' },
    });
    if (!parent) throw new BadRequestException('Parent introuvable');

    const level = await this.levelRepository.findOne({
      where: { id: dto.levelId },
    });
    if (!level) throw new BadRequestException('Niveau introuvable');

    const child = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: new Date(dto.dateOfBirth),
      type: 'child',
      email: null,
      password: '',
      parent,
      level,
    });

    if (dto.childProfile) {
      const profile = this.childProfileRepository.create(dto.childProfile);
      child.childProfile = profile;
    }

    return this.userRepository.save(child);
  }

  async updateParent(id: number, dto: UpdateParentDto): Promise<User> {
    const parent = await this.userRepository.findOne({
      where: { id, type: 'parent' },
      relations: ['parentProfile'],
    });

    if (!parent) {
      throw new NotFoundException('Parent introuvable');
    }

    if (dto.email !== undefined) parent.email = dto.email;
    if (dto.phoneNumber !== undefined) parent.phoneNumber = dto.phoneNumber;
    if (dto.firstName !== undefined) parent.firstName = dto.firstName;
    if (dto.lastName !== undefined) parent.lastName = dto.lastName;

    if (dto.parentProfile) {
      const profile =
        parent.parentProfile || this.parentProfileRepository.create();

      Object.assign(profile, dto.parentProfile);

      // Save the profile separately if needed
      parent.parentProfile = await this.parentProfileRepository.save(profile);
    }

    return this.userRepository.save(parent);
  }

  async updateChild(id: number, dto: UpdateChildDto): Promise<User> {
    const child = await this.userRepository.findOne({
      where: { id, type: 'child' },
      relations: ['childProfile', 'level'],
    });

    if (!child) throw new NotFoundException('Enfant introuvable');

    if (dto.firstName !== undefined) child.firstName = dto.firstName;
    if (dto.lastName !== undefined) child.lastName = dto.lastName;
    if (dto.dateOfBirth !== undefined)
      child.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender !== undefined)
      child.childProfile =
        child.childProfile || this.childProfileRepository.create();

    // 🔧 Correction de la mise à jour du niveau
    if (dto.levelId !== undefined) {
      const newLevel = await this.levelRepository.findOne({
        where: { id: dto.levelId },
      });
      if (newLevel) {
        child.level = newLevel;
        child.levelId = dto.levelId;
      }
    } else if (dto.level?.id) {
      const newLevel = await this.levelRepository.findOne({
        where: { id: dto.level.id },
      });
      if (newLevel) {
        child.level = newLevel;
        child.levelId = dto.level.id;
      }
    }

    if (dto.childProfile) {
      const profile =
        child.childProfile || this.childProfileRepository.create();
      Object.assign(profile, dto.childProfile);
      child.childProfile = await this.childProfileRepository.save(profile);
    }

    return this.userRepository.save(child);
  }
}
