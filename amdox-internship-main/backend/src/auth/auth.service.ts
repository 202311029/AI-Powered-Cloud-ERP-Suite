import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register new tenant + SuperAdmin ────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const existingTenant = await this.prisma.tenant.findUnique({ where: { domain: dto.domain } });
    if (existingTenant) throw new ConflictException('Domain already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: { name: dto.tenantName, domain: dto.domain },
    });

    // Create SuperAdmin role
    const role = await this.prisma.role.create({
      data: { name: 'SuperAdmin', tenantId: tenant.id },
    });

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    // Link user to tenant
    await this.prisma.tenantUser.create({
      data: { tenantId: tenant.id, userId: user.id, roleId: role.id },
    });

    const tokens = await this.generateTokens(user.id, tenant.id, 'SuperAdmin');
    await this.saveRefreshToken(tokens.refreshToken, user.id, tenant.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tenant: { id: tenant.id, name: tenant.name },
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Get tenant membership
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId: user.id },
      include: { tenant: true, role: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!tenantUser) throw new UnauthorizedException('No tenant access');

    if (user.mfaEnabled) {
      // Return partial — frontend must complete MFA
      const partialToken = this.jwtService.sign(
        { sub: user.id, email: user.email, tenantId: tenantUser.tenantId, mfaPending: true },
        { expiresIn: '5m' },
      );
      return { accessToken: partialToken, requiresMfa: true, user: null, refreshToken: '' };
    }

    const tokens = await this.generateTokens(user.id, tenantUser.tenantId, tenantUser.role.name);
    await this.saveRefreshToken(tokens.refreshToken, user.id, tenantUser.tenantId);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      requiresMfa: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: tenantUser.role.name,
        tenantId: tenantUser.tenantId,
        tenantName: tenantUser.tenant.name,
      },
    };
  }

  // ─── Refresh tokens ───────────────────────────────────────────────────────
  async refreshTokens(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });

    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId: stored.userId, tenantId: stored.tenantId },
      include: { role: true },
    });
    const roleName = tenantUser?.role.name || 'Employee';

    const newTokens = await this.generateTokens(stored.userId, stored.tenantId, roleName);
    await this.saveRefreshToken(newTokens.refreshToken, stored.userId, stored.tenantId);
    return newTokens;
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  // ─── Get current user ─────────────────────────────────────────────────────
  async getMe(userId: string, tenantId: string) {
    return tenantContext.run({ tenantId, userId }, async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, firstName: true, lastName: true, avatarUrl: true, mfaEnabled: true,
          tenants: {
            where: { tenantId },
            include: { tenant: { select: { id: true, name: true, domain: true } }, role: { select: { name: true } } },
            take: 1,
          },
        },
      });
      if (!user) throw new UnauthorizedException();
      const tu = user.tenants[0];
      return { ...user, tenants: undefined, role: tu?.role.name, tenant: tu?.tenant };
    });
  }

  // ─── MFA Setup ────────────────────────────────────────────────────────────
  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'Amdox ERP', secret);
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    // Store secret temporarily (not enabled until verified)
    await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });

    return { secret, qrCode, otpAuthUrl };
  }

  // ─── MFA Verify ───────────────────────────────────────────────────────────
  async verifyAndEnableMfa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaSecret) throw new BadRequestException('MFA not set up');

    const valid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!valid) throw new UnauthorizedException('Invalid MFA token');

    await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    return { message: 'MFA enabled successfully' };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────
  private async generateTokens(userId: string, tenantId: string, role: string) {
    const payload = { sub: userId, email: '', tenantId, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(token: string, userId: string, tenantId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { token, userId, tenantId, expiresAt },
    });
  }
}
