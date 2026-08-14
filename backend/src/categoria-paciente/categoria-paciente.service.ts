import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtencionService } from '../atencion/atencion.service';

@Injectable()
export class CategoriaPacienteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly atencionService: AtencionService,
  ) {}

  async addPacienteToCategoria(input: { categoriaId: number; pacienteId: number; tipoPaciente?: string; diagnostico?: string; expedienteBaseId?: number }) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: input.categoriaId },
    });

    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const paciente = await this.prisma.paciente.findUnique({
      where: { id: input.pacienteId },
    });
    
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    let diagnosticoFinal = input.diagnostico;

    // Si se indicó un expediente base para reciclar y no se mandó diagnóstico, heredar el diagnóstico original
    if (input.expedienteBaseId && !diagnosticoFinal) {
      const sourceAtencion = await this.prisma.atencion.findUnique({
        where: { id: input.expedienteBaseId },
        include: { categoriaPaciente: true }
      });
      if (sourceAtencion?.categoriaPaciente?.diagnostico) {
        diagnosticoFinal = sourceAtencion.categoriaPaciente.diagnostico;
      }
    }

    const categoriaPaciente = await this.prisma.categoriaPaciente.create({
      data: {
        categoriaId: input.categoriaId,
        pacienteId: input.pacienteId,
        tipoPaciente: input.tipoPaciente,
        diagnostico: diagnosticoFinal,
      },
    });

    // Si se indicó un expediente base para reciclar, clonarlo
    if (input.expedienteBaseId) {
      await this.atencionService.cloneExpediente(input.expedienteBaseId, categoriaPaciente.id, paciente);
    }

    return categoriaPaciente;
  }

  async updateCategoriaPaciente(id: number, data: { tipoPaciente?: string, diagnostico?: string }) {
    const record = await this.prisma.categoriaPaciente.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Registro no encontrado');

    return this.prisma.categoriaPaciente.update({
      where: { id },
      data,
    });
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

  async listAllExpedientes() {
    return this.prisma.categoriaPaciente.findMany({
      where: {
        atencion: { isNot: null }
      },
      include: { 
        paciente: true,
        categoria: true,
        atencion: {
          select: { id: true }
        }
      },
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
