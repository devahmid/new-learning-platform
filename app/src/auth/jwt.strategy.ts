import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // En production, utilisez une variable d'environnement
    });
  }

  async validate(payload: any) {
    // Pour les tests, on simule un utilisateur admin
    return {
      userId: payload.sub,
      username: payload.username,
      roles: ['admin'], // Simuler un rôle admin
    };
  }
}
