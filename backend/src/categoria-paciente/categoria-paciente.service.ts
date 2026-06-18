import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriaPacienteService {
  constructor(private readonly prisma: PrismaService) {}

  async addPacienteToCategoria(input: { categoriaId: number; pacienteId: number }) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: input.categoriaId },
    });

    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    try {
      return await this.prisma.categoriaPaciente.create({
        data: {
          categoriaId: input.categoriaId,
          pacienteId: input.pacienteId,
        },
      });
    } catch {
      throw new ConflictException('El paciente ya está en la categoría');
    }
  }

  async listPacientesByCategoria(categoriaId: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    return this.prisma.categoriaPaciente.findMany({
      where: { categoriaId },
      include: { paciente: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removePacienteFromCategoria(id: number) {
    const record = await this.prisma.categoriaPaciente.findUnique({
      where: { id },
    });

    if (!record) throw new NotFoundException('Registro no encontrado');

    return this.prisma.categoriaPaciente.delete({ where: { id } });
  }
}
