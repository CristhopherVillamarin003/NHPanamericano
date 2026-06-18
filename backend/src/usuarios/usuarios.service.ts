import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async createUsuario(input: {
    email: string;
    password: string;
    nombres?: string;
    apellidos?: string;
  }) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    return this.prisma.usuario.create({
      data: {
        email: input.email,
        password: input.password,
        nombres: input.nombres,
        apellidos: input.apellidos,
      },
    });
  }

  async requireUsuarioById(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
