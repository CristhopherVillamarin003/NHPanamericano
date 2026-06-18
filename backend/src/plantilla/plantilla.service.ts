import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';

@Injectable()
export class PlantillaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlantillaDto) {
    return this.prisma.plantilla.create({ data: dto });
  }

  async findAll(seccion?: string) {
    return this.prisma.plantilla.findMany({
      where: {
        activo: true,
        ...(seccion ? { seccion } : {}),
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const plantilla = await this.prisma.plantilla.findUnique({ where: { id } });
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada');
    return plantilla;
  }

  async update(id: number, dto: UpdatePlantillaDto) {
    await this.findOne(id);
    return this.prisma.plantilla.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Soft delete: marcar como inactiva en lugar de eliminar
    return this.prisma.plantilla.update({
      where: { id },
      data: { activo: false },
    });
  }
}
