import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: { rejectUnauthorized: false },
    } as any);
  }

  async enviarCodigoMFA(email: string, codigo: string) {
    const from = this.configService.get<string>(
      'SMTP_FROM',
      '"NH Panamericano" <noreply@nhpanamericano.com>',
    );

    if (!this.configService.get<string>('SMTP_USER')) {
      this.logger.warn(
        `[DEV MODE] Enviaríamos el código MFA ${codigo} a ${email}`,
      );
      return;
    }

    try {
      const timeStr = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      await this.transporter.sendMail({
        from,
        to: email,
        subject: `Tu código de seguridad (${timeStr}) - NH Panamericano`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Código de Verificación</h2>
            <p style="color: #555; font-size: 16px;">Hola,</p>
            <p style="color: #555; font-size: 16px;">Alguien está intentando iniciar sesión en tu cuenta. Tu código de seguridad de 6 dígitos es:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; color: #fff; background-color: #3498db; border-radius: 5px; letter-spacing: 5px;">${codigo}</span>
            </div>
            <p style="color: #555; font-size: 14px;">Este código expirará en 10 minutos. Si no fuiste tú, puedes ignorar este mensaje.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">Sistema de Historias Clínicas NH Panamericano</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Error enviando correo MFA a ${email}`, error);
    }
  }

  async enviarCorreoRecuperacion(email: string, token: string) {
    const from = this.configService.get<string>(
      'SMTP_FROM',
      '"NH Panamericano" <noreply@nhpanamericano.com>',
    );

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const urlRecuperacion = `${frontendUrl}/auth/reset-password?token=${token}`;

    if (!this.configService.get<string>('SMTP_USER')) {
      this.logger.warn(
        `[DEV MODE] Enlace de recuperación para ${email}: ${urlRecuperacion}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Recuperación de Contraseña - NH Panamericano',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #2c3e50; text-align: center;">Recuperación de Contraseña</h2>
            <p style="color: #555; font-size: 16px;">Hola,</p>
            <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlRecuperacion}" style="display: inline-block; padding: 12px 25px; font-size: 16px; font-weight: bold; color: #fff; background-color: #2ecc71; text-decoration: none; border-radius: 5px;">Restablecer mi contraseña</a>
            </div>
            <p style="color: #555; font-size: 14px;">El enlace expirará en 30 minutos. Si no solicitaste este cambio, simplemente ignora este correo y tu cuenta seguirá segura.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">Sistema de Historias Clínicas NH Panamericano</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Error enviando correo de recuperación a ${email}`,
        error,
      );
    }
  }
}
