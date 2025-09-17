import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // Ne pas renvoyer le mot de passe
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
      phoneNumber: user.phoneNumber,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    this.logger.debug(`🔑 Demande de changement de mot de passe pour userId: ${userId}`);
    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`❌ Utilisateur non trouvé (id: ${userId})`);
      throw new NotFoundException('Utilisateur introuvable');
    }

    this.logger.debug(`👤 Email: ${user.email}`);
    this.logger.debug(`🔒 Password hash stocké: ${user.password}`);
    this.logger.debug(`🔍 Comparaison avec le mot de passe fourni...`);

    const match = await bcrypt.compare(dto.currentPassword, user.password);

    this.logger.debug(`Résultat de bcrypt.compare: ${match}`);

    if (!match) {
      this.logger.warn(`❌ Mot de passe actuel incorrect pour userId: ${userId}`);
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(dto.newPassword, salt);

    await this.userService.save(user);
    this.logger.log(`✅ Mot de passe mis à jour pour userId: ${userId}`);
  }
  
  
}
