import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { tenantContext } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change_me_in_production'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Set tenant context for Prisma middleware scoping
    const store = { tenantId: payload.tenantId, userId: payload.sub };
    tenantContext.enterWith(store);

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      mfaPending: payload.mfaPending,
    };
  }
}
