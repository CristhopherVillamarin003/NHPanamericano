import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuariosService: UsuariosService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessExpiresIn() {
    return this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? undefined;
  }

  private refreshExpiresInMs() {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    return this.parseDurationToMs(raw);
  }

  private parseDurationToMs(value: string): number {
    const trimmed = value.trim();
    const match = /^([0-9]+)\s*(ms|s|m|h|d)?$/i.exec(trimmed);
    if (!match) throw new BadRequestException('Duración inválida');

    const amount = Number(match[1]);
    const unit = (match[2] ?? 'ms').toLowerCase();

    switch (unit) {
      case 'ms':
        return amount;
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new BadRequestException('Duración inválida');
    }
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }

  private async signAccessToken(payload: any) {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret';
    // 1 hora de token por defecto (suficiente para trabajo)
    return this.jwt.signAsync(payload, { secret, expiresIn: '1h' });
  }

  async register(input: any, userAgent = 'unknown') {
    // Hashear password y crear
    const passwordHash = await this.hashPassword(input.password);

    const usuario = await this.usuariosService.createUsuario({
      email: input.email,
      password: passwordHash,
      nombres: input.nombres,
      apellidos: input.apellidos,
    });

    const accessToken = await this.signAccessToken({
      sub: usuario.id,
      email: usuario.email,
      userAgent,
    });

    const refreshToken = await this.createRefreshToken(usuario.id);

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: { email: string; password: string }, userAgent = 'unknown') {
    const usuario = await this.usuariosService.findByEmail(input.email);

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    if (!usuario.activo) throw new UnauthorizedException('Usuario inactivo');

    const ok = await this.verifyPassword(input.password, usuario.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = await this.signAccessToken({
      sub: usuario.id,
      email: usuario.email,
      userAgent,
    });

    const refreshToken = await this.createRefreshToken(usuario.id);

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
      },
      accessToken,
      refreshToken,
    };
  }

  private async createRefreshToken(usuarioId: number) {
    const token = randomBytes(48).toString('hex');
    const expiracion = new Date(Date.now() + this.refreshExpiresInMs());

    await this.prisma.refreshToken.create({
      data: {
        usuarioId,
        token,
        expiracion,
      },
    });

    return token;
  }

  async refresh(refreshToken: string, userAgent = 'unknown') {
    if (!refreshToken) throw new UnauthorizedException('Refresh token requerido');
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
      },
      include: {
        usuario: true,
      },
    });

    if (!record) throw new UnauthorizedException('Refresh token inválido');
    if (record.expiracion.getTime() < Date.now()) {
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('Refresh token expirado');
    }

    if (!record.usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const accessToken = await this.signAccessToken({
      sub: record.usuario.id,
      email: record.usuario.email,
      userAgent,
    });

    return {
      accessToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { ok: true };
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { ok: true };
  }

  async forgotPassword(email: string) {
    const usuario = await this.usuariosService.findByEmail(email);

    // Evita enumeración de usuarios
    if (!usuario) {
      return { ok: true };
    }

    const token = randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await this.prisma.recuperacionPassword.create({
      data: {
        usuarioId: usuario.id,
        token,
        expiracion,
      },
    });

    // Aquí normalmente enviarías un email. Por ahora devolvemos el token para pruebas.
    return { ok: true, token };
  }

  async resetPassword(input: { token: string; newPassword: string }) {
    const record = await this.prisma.recuperacionPassword.findFirst({
      where: {
        token: input.token,
      },
      include: {
        usuario: true,
      },
    });

    if (!record) throw new BadRequestException('Token inválido');
    if (record.usado) throw new BadRequestException('Token ya usado');
    if (record.expiracion.getTime() < Date.now()) {
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await this.hashPassword(input.newPassword);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: record.usuarioId },
        data: { password: passwordHash },
      }),
      this.prisma.recuperacionPassword.update({
        where: { id: record.id },
        data: { usado: true },
      }),
    ]);

    return { ok: true };
  }
}
