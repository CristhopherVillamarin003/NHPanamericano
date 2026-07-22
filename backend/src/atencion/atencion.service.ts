import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AtencionService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Atención ─────────────────────────────────────────────────────────────

  private readonly fullInclude = {
    categoriaPaciente: { include: { paciente: true } },
    consentimientos:   { include: { plantilla: true }, orderBy: { createdAt: 'asc' as const } },
    historiaClinica:   { include: { plantilla: true } },
    protocolo:         { include: { plantilla: true } },
    cuidado:           { include: { plantilla: true } },
    epicrisis:         { include: { plantilla: true } },
    receta:            { include: { plantilla: true } },
    certificado:       { include: { plantilla: true } },
    liquidacion:       { include: { plantilla: true } },
    enfermeria:        { include: { plantilla: true } },
  };

  async findOrCreate(categoriaPacienteId: number) {
    const catPac = await this.prisma.categoriaPaciente.findUnique({
      where: { id: categoriaPacienteId },
    });
    if (!catPac) throw new NotFoundException('Relación categoría-paciente no encontrada');

    try {
      return await this.prisma.atencion.upsert({
        where: { categoriaPacienteId },
        create: { categoriaPacienteId },
        update: {},
        include: this.fullInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const existing = await this.prisma.atencion.findUnique({
          where: { categoriaPacienteId },
          include: this.fullInclude,
        });
        if (existing) return existing;
      }
      throw error;
    }
  }

  async findByCategoriaPaciente(categoriaPacienteId: number) {
    const atencion = await this.prisma.atencion.findUnique({
      where: { categoriaPacienteId },
      include: this.fullInclude,
    });
    if (!atencion) throw new NotFoundException('Atención no encontrada');
    return atencion;
  }

  private async getAtencion(atencionId: number) {
    const atencion = await this.prisma.atencion.findUnique({ where: { id: atencionId } });
    if (!atencion) throw new NotFoundException('Atención no encontrada');
    return atencion;
  }

  // ─── Consentimientos ──────────────────────────────────────────────────────

  async createConsentimiento(atencionId: number, plantillaId: number, datos: object = {}) {
    await this.getAtencion(atencionId);
    return this.prisma.consentimiento.create({
      data: { atencionId, plantillaId, datos },
      include: { plantilla: true },
    });
  }

  async updateConsentimiento(id: number, datos: object, estado?: string) {
    const record = await this.prisma.consentimiento.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Consentimiento no encontrado');
    return this.prisma.consentimiento.update({
      where: { id },
      data: { datos, ...(estado ? { estado } : {}) },
      include: { plantilla: true },
    });
  }

  async deleteConsentimiento(id: number) {
    const record = await this.prisma.consentimiento.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Consentimiento no encontrado');
    return this.prisma.consentimiento.delete({ where: { id } });
  }

  // ─── Secciones únicas (historia_clinica, protocolo, cuidado, epicrisis, receta) ──

  async upsertHistoriaClinica(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.historiaClinica.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertProtocolo(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.protocolo.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async deleteProtocolo(atencionId: number) {
    const record = await this.prisma.protocolo.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Protocolo no encontrado');
    return this.prisma.protocolo.delete({ where: { atencionId } });
  }

  async deleteCuidado(atencionId: number) {
    const record = await this.prisma.cuidado.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Cuidado no encontrado');
    return this.prisma.cuidado.delete({ where: { atencionId } });
  }

  async upsertCuidado(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.cuidado.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertEpicrisis(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.epicrisis.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertReceta(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.receta.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertCertificado(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.certificado.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertLiquidacion(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.liquidacion.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async upsertEnfermeria(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.enfermeria.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async deleteEnfermeria(atencionId: number) {
    const record = await this.prisma.enfermeria.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Enfermería no encontrada');
    return this.prisma.enfermeria.delete({ where: { atencionId } });
  }
}
