import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    cedula?: string;
    fechaNacimiento?: string;
    edad?: number;
    tipoPaciente?: string;
    sexo?: string;
    telefono?: string;
    direccion?: string;
  }) {
    try {
      return await this.prisma.paciente.create({
        data: {
          primerNombre: input.primerNombre,
          segundoNombre: input.segundoNombre,
          primerApellido: input.primerApellido,
          segundoApellido: input.segundoApellido,
          cedula: input.cedula,
          fechaNacimiento: input.fechaNacimiento ? new Date(input.fechaNacimiento) : undefined,
          edad: input.edad,
          tipoPaciente: input.tipoPaciente,
          sexo: input.sexo,
          telefono: input.telefono,
          direccion: input.direccion,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este paciente ya se encuentra registrado con esta cédula');
      }
      throw error;
    }
  }

  async list() {
    return this.prisma.paciente.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: number) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  async update(
    id: number,
    input: {
      primerNombre?: string;
      segundoNombre?: string;
      primerApellido?: string;
      segundoApellido?: string;
      cedula?: string;
      fechaNacimiento?: string;
      edad?: number;
      tipoPaciente?: string;
      sexo?: string;
      telefono?: string;
      direccion?: string;
    },
  ) {
    await this.findOne(id);
    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...input,
        fechaNacimiento: input.fechaNacimiento ? new Date(input.fechaNacimiento) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.paciente.delete({ where: { id } });
  }
}
