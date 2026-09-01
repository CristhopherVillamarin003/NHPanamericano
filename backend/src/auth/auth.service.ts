import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { UsuariosService } from "../usuarios/usuarios.service";
import { PrismaService } from "../prisma/prisma.service";
import { randomBytes, randomInt } from "crypto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000;

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private refreshExpiresInMs() {
    const val = this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d";
    const amount = parseInt(val, 10);
    const unit = val.replace(/[0-9]/g, "");
    switch (unit) {
      case "m": return amount * 60 * 1000;
      case "h": return amount * 60 * 60 * 1000;
      case "d": return amount * 24 * 60 * 60 * 1000;
      default: throw new BadRequestException("Duracion invalida");
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
    const secret = this.config.get<string>("JWT_ACCESS_SECRET") ?? "dev_access_secret";
    return this.jwt.signAsync(payload, { secret, expiresIn: "1h" });
  }

  async register(input: any, userAgent = "unknown") {
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

  async login(
    input: { email: string; password: string },
    userAgent = "unknown",
  ) {
    const usuario = await this.usuariosService.findByEmail(input.email);

    if (!usuario) throw new UnauthorizedException("Credenciales invalidas");
    if (!usuario.activo) throw new UnauthorizedException("Usuario inactivo");

    if (
      usuario.bloqueadoHasta &&
      usuario.bloqueadoHasta.getTime() > Date.now()
    ) {
      const minutos = Math.ceil(
        (usuario.bloqueadoHasta.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Cuenta bloqueada por multiples intentos fallidos. Intente de nuevo en ${minutos} minutos.`,
      );
    }

    const ok = await this.verifyPassword(input.password, usuario.password);

    if (!ok) {
      const intentos = usuario.intentosFallidos + 1;
      let bloqueadoHasta: Date | null = null;

      if (intentos >= this.MAX_LOGIN_ATTEMPTS) {
        bloqueadoHasta = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
      }

      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          intentosFallidos: intentos,
          bloqueadoHasta,
        },
      });

      if (bloqueadoHasta) {
        throw new UnauthorizedException(
          "Demasiados intentos fallidos. Su cuenta ha sido bloqueada temporalmente.",
        );
      }
      throw new UnauthorizedException("Credenciales invalidas");
    }

    if (usuario.intentosFallidos > 0 || usuario.bloqueadoHasta) {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: 0, bloqueadoHasta: null },
      });
    }

    const mfaToken = randomBytes(32).toString("hex");
    const mfaCodigo = randomInt(100000, 999999).toString();
    const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await this.prisma.mfaToken.create({
      data: {
        usuarioId: usuario.id,
        token: mfaToken,
        codigo: mfaCodigo,
        expiracion,
      },
    });

    this.mailService.enviarCodigoMFA(usuario.email, mfaCodigo);

    return {
      requires2FA: true,
      mfaToken,
    };
  }

  async verifyMfa(
    input: { token: string; code: string; role?: string },
    userAgent = "unknown",
  ) {
    const record = await this.prisma.mfaToken.findUnique({
      where: { token: input.token },
      include: { usuario: true },
    });

    if (!record)
      throw new UnauthorizedException("Token MFA invalido o expirado");

    if (record.expiracion.getTime() < Date.now()) {
      await this.prisma.mfaToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException("El codigo MFA ha expirado");
    }

    const cleanInputCode = input.code.replace(/\D/g, '');
    if (record.codigo !== cleanInputCode) {
      throw new UnauthorizedException("El codigo MFA es incorrecto");
    }

    await this.prisma.mfaToken.delete({ where: { id: record.id } });

    const usuario = record.usuario;
    
    let effectiveEmail = usuario.email;
    let effectiveId = usuario.id;
    if (usuario.email === "laboratorio.nhp@gmail.com" && input.role) {
      if (input.role === "consultaexterna") {
        effectiveEmail = "laboratorioce@hospitalpanamericano.com.ec";
      } else if (input.role === "hospitalizacion") {
        effectiveEmail = "laboratorio@hospitalpanamericano.com.ec";
      }
      
      let targetUser = await this.prisma.usuario.findUnique({
        where: { email: effectiveEmail }
      });
      
      if (!targetUser) {
        // Create the virtual user if it doesn't exist so it has a valid ID for relations
        const hash = await bcrypt.hash(randomBytes(16).toString("hex"), 10);
        targetUser = await this.prisma.usuario.create({
          data: {
            email: effectiveEmail,
            password: hash,
            nombres: "Virtual",
            apellidos: "Profile",
            activo: true
          }
        });
      }
      
      effectiveId = targetUser.id;
    }

    const accessToken = await this.signAccessToken({
      sub: effectiveId,
      email: effectiveEmail,
      userAgent,
    });

    const refreshToken = await this.createRefreshToken(usuario.id);

    return {
      usuario: {
        id: effectiveId,
        email: effectiveEmail,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
      },
      accessToken,
      refreshToken,
    };
  }

  private async createRefreshToken(usuarioId: number) {
    const token = randomBytes(48).toString("hex");
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

  async refresh(refreshToken: string, userAgent = "unknown") {
    if (!refreshToken)
      throw new UnauthorizedException("Refresh token requerido");
    const record = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { usuario: true },
    });

    if (!record) throw new UnauthorizedException("Refresh token invalido");
    if (record.expiracion.getTime() < Date.now()) {
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException("Refresh token expirado");
    }

    if (!record.usuario.activo) {
      throw new UnauthorizedException("Usuario inactivo");
    }

    const accessToken = await this.signAccessToken({
      sub: record.usuario.id,
      email: record.usuario.email,
      userAgent,
    });

    return { accessToken };
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

    if (!usuario) {
      return { ok: true };
    }

    const token = randomBytes(32).toString("hex");
    const expiracion = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await this.prisma.recuperacionPassword.create({
      data: {
        usuarioId: usuario.id,
        token,
        expiracion,
      },
    });

    this.mailService.enviarCorreoRecuperacion(email, token);

    return { ok: true };
  }

  async resetPassword(input: { token: string; newPassword: string }) {
    const record = await this.prisma.recuperacionPassword.findFirst({
      where: { token: input.token },
      include: { usuario: true },
    });

    if (!record) throw new BadRequestException("Token invalido");
    if (record.usado) throw new BadRequestException("Token ya usado");
    if (record.expiracion.getTime() < Date.now()) {
      throw new BadRequestException("Token expirado");
    }

    const passwordHash = await this.hashPassword(input.newPassword);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: record.usuarioId },
        data: {
          password: passwordHash,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
      }),
      this.prisma.recuperacionPassword.update({
        where: { id: record.id },
        data: { usado: true },
      }),
    ]);

    return { ok: true };
  }
}

