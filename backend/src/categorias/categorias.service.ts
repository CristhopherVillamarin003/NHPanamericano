import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: number, input: { nombre: string; descripcion?: string }) {
    return this.prisma.categoria.create({
      data: {
        nombre: input.nombre,
        descripcion: input.descripcion,
        usuarioId: userId,
      },
    });
  }

  async listAll() {
    return this.prisma.categoria.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoria(categoriaId: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  async delete(categoriaId: number) {
    await this.getCategoria(categoriaId);
    return this.prisma.categoria.delete({ where: { id: categoriaId } });
  }
}
