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
    protocolos:        { include: { plantilla: true }, orderBy: { createdAt: 'asc' as const } },
    cuidado:           { include: { plantilla: true } },
    epicrisis:         { include: { plantilla: true } },
    receta:            { include: { plantilla: true } },
    certificado:       { include: { plantilla: true } },
    liquidacion:       { include: { plantilla: true } },
    enfermeria:        { include: { plantilla: true } },
    escalaRiesgo:      { include: { plantilla: true } },
    consulta:          true,
    examenes:          true,
    anestesiologia:    true,
    recetaMedica:      true,
  };

  
  /**
   * Reemplaza de forma recursiva los datos personales del paciente en cualquier JSON de formulario
   */
  overwritePersonalData(datos: any, targetPaciente: any, targetTipoInput?: string | null, seccionName?: string) {
    if (!datos || typeof datos !== 'object') return datos;
    const result = JSON.parse(JSON.stringify(datos));
    
    const fullName = [
      targetPaciente.primerApellido,
      targetPaciente.segundoApellido,
      targetPaciente.primerNombre,
      targetPaciente.segundoNombre
    ].filter(Boolean).join(' ').trim().toUpperCase();

    const targetTipo = (targetTipoInput || targetPaciente.tipoPaciente || 'PARTICULAR').toUpperCase();
    const is_sppat = targetTipo === 'SPPAT';

    const newValues: any = {
      primer_nombre: targetPaciente.primerNombre ? String(targetPaciente.primerNombre).toUpperCase() : '',
      segundo_nombre: targetPaciente.segundoNombre ? String(targetPaciente.segundoNombre).toUpperCase() : '',
      primer_apellido: targetPaciente.primerApellido ? String(targetPaciente.primerApellido).toUpperCase() : '',
      segundo_apellido: targetPaciente.segundoApellido ? String(targetPaciente.segundoApellido).toUpperCase() : '',
      cedula: targetPaciente.cedula ?? '',
      numero_historia_clinica: targetPaciente.cedula ?? '',
      edad: targetPaciente.edad !== undefined && targetPaciente.edad !== null ? String(targetPaciente.edad) : '',
      sexo: targetPaciente.sexo ? (targetPaciente.sexo.toUpperCase().startsWith('F') ? 'F' : 'M') : '',
      institucion: targetTipo,
      unicodigo: '62858',
      is_sppat: is_sppat,
      nombre_paciente: fullName,
      cedula_paciente: targetPaciente.cedula ?? '',
      edad_paciente: targetPaciente.edad !== undefined && targetPaciente.edad !== null ? String(targetPaciente.edad) : '',
      nombre_paciente_firma: fullName,
      cedula_paciente_firma: targetPaciente.cedula ?? '',
      nombre_paciente_negativa: fullName,
      cedula_paciente_negativa: targetPaciente.cedula ?? '',
      nombre_paciente_rev: fullName,
      cedula_paciente_rev: targetPaciente.cedula ?? '',
      nombres_completos: fullName,
      paciente: fullName,
      dni: targetPaciente.cedula ?? '',
    };

    if (targetPaciente.telefono) newValues.telefono = targetPaciente.telefono;
    if (targetPaciente.direccion) newValues.direccion = targetPaciente.direccion;

    if (targetPaciente.edad !== undefined && targetPaciente.edad !== null && Number(targetPaciente.edad) >= 1) {
      newValues.condicion_edad = 'A';
    }

    if (seccionName !== 'consentimiento' && seccionName !== 'protocolo') {
      newValues.nombre = fullName;
      newValues.nombres = fullName;
    }

    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        if (newValues.hasOwnProperty(key)) {
          obj[key] = newValues[key as keyof typeof newValues];
        } else if (key === 'unicodigo' || key.endsWith('_unicodigo')) {
          obj[key] = '62858';
        } else if (key === 'notas_evolucion' && typeof value === 'string') {
          obj[key] = value.replace(
            /<strong>SEGURO:<\/strong>\s*(SPPAT|PARTICULAR|IESS)/gi,
            `<strong>SEGURO:</strong> ${targetTipo}`
          );
        } else if (typeof value === 'object') {
          traverse(value);
        }
      }
    };

    traverse(result);
    return result;
  }

  /**
   * Sincroniza todos los formularios de una atención médica con los datos actuales del paciente
   */
  async syncAtencionPersonalData(atencion: any, paciente: any, tipoPaciente?: string | null) {
    if (!atencion || !paciente) return;
    const currentTipo = tipoPaciente || atencion.categoriaPaciente?.tipoPaciente || paciente.tipoPaciente || 'PARTICULAR';

    const updateSingleForm = async (model: any, form: any, seccionName: string) => {
      if (!form || !form.datos) return;
      const rawDatos = typeof form.datos === 'string' ? JSON.parse(form.datos) : form.datos;
      const updatedDatos = this.overwritePersonalData(rawDatos, paciente, currentTipo, seccionName);
      await model.update({
        where: { id: form.id },
        data: { datos: updatedDatos },
      });
    };

    if (atencion.historiaClinica) await updateSingleForm(this.prisma.historiaClinica, atencion.historiaClinica, 'historia-clinica');
    if (atencion.cuidado) await updateSingleForm(this.prisma.cuidado, atencion.cuidado, 'cuidado');
    if (atencion.epicrisis) await updateSingleForm(this.prisma.epicrisis, atencion.epicrisis, 'epicrisis');
    if (atencion.receta) await updateSingleForm(this.prisma.receta, atencion.receta, 'receta');
    if (atencion.recetaMedica) await updateSingleForm(this.prisma.recetaMedica, atencion.recetaMedica, 'receta-medica');
    if (atencion.certificado) await updateSingleForm(this.prisma.certificado, atencion.certificado, 'certificado');
    if (atencion.liquidacion) await updateSingleForm(this.prisma.liquidacion, atencion.liquidacion, 'liquidacion');
    if (atencion.enfermeria) await updateSingleForm(this.prisma.enfermeria, atencion.enfermeria, 'enfermeria');
    if (atencion.escalaRiesgo) await updateSingleForm(this.prisma.escalaRiesgo, atencion.escalaRiesgo, 'escala-riesgo');
    if (atencion.consulta) await updateSingleForm(this.prisma.consulta, atencion.consulta, 'consulta');
    if (atencion.examenes) await updateSingleForm(this.prisma.examenes, atencion.examenes, 'examenes');
    if (atencion.anestesiologia) await updateSingleForm(this.prisma.anestesiologia, atencion.anestesiologia, 'anestesiologia');

    if (Array.isArray(atencion.consentimientos)) {
      for (const consent of atencion.consentimientos) {
        await updateSingleForm(this.prisma.consentimiento, consent, 'consentimiento');
      }
    }

    if (Array.isArray(atencion.protocolos)) {
      for (const prot of atencion.protocolos) {
        await updateSingleForm(this.prisma.protocolo, prot, 'protocolo');
      }
    }
  }

  /**
   * Sincroniza en cascada TODOS los expedientes (atenciones) de un paciente en todas las categorías
   */
  async syncAllExpedientesForPaciente(pacienteId: number) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return;

    const catPacs = await this.prisma.categoriaPaciente.findMany({
      where: { pacienteId },
      include: {
        atencion: {
          include: this.fullInclude,
        },
      },
    });

    for (const cp of catPacs) {
      if (cp.atencion) {
        await this.syncAtencionPersonalData(cp.atencion, paciente, cp.tipoPaciente);
      }
    }
    return { success: true, count: catPacs.length };
  }

  /**
   * Sincroniza los formularios de la atención asociada a una relación categoría-paciente
   */
  async syncPacienteData(categoriaPacienteId: number) {
    const atencion = await this.prisma.atencion.findUnique({
      where: { categoriaPacienteId },
      include: this.fullInclude,
    });

    if (!atencion || !atencion.categoriaPaciente?.paciente) return;
    const paciente = atencion.categoriaPaciente.paciente;
    const currentTipo = (atencion.categoriaPaciente.tipoPaciente || paciente.tipoPaciente || 'PARTICULAR').toUpperCase();
    await this.syncAtencionPersonalData(atencion, paciente, currentTipo);
    return { success: true };
  }

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

  // ✨ Protocolos ✨
  async createProtocolo(atencionId: number, plantillaId: number, datos: object = {}) {
    await this.getAtencion(atencionId);
    return this.prisma.protocolo.create({
      data: { atencionId, plantillaId, datos },
      include: { plantilla: true },
    });
  }

  async updateProtocolo(id: number, datos: object, estado?: string) {
    const record = await this.prisma.protocolo.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Protocolo no encontrado');
    return this.prisma.protocolo.update({
      where: { id },
      data: { datos, ...(estado ? { estado } : {}) },
      include: { plantilla: true },
    });
  }

  async deleteProtocolo(id: number) {
    const record = await this.prisma.protocolo.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Protocolo no encontrado');
    return this.prisma.protocolo.delete({ where: { id } });
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

  async upsertEscalaRiesgo(atencionId: number, plantillaId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.escalaRiesgo.upsert({
      where: { atencionId },
      create: { atencionId, plantillaId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}), plantillaId },
      include: { plantilla: true },
    });
  }

  async deleteEscalaRiesgo(atencionId: number) {
    const record = await this.prisma.escalaRiesgo.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Escala de Riesgo no encontrada');
    return this.prisma.escalaRiesgo.delete({ where: { atencionId } });
  }

  // ─── Consulta (Sin Plantilla) ───────────────────────────────────────────

  async upsertConsulta(atencionId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.consulta.upsert({
      where: { atencionId },
      create: { atencionId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}) },
    });
  }

  async deleteConsulta(atencionId: number) {
    const record = await this.prisma.consulta.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Consulta no encontrada');
    return this.prisma.consulta.delete({ where: { atencionId } });
  }

  // ─── Exámenes (Sin Plantilla) ───────────────────────────────────────────
  async upsertExamenes(atencionId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.examenes.upsert({
      where: { atencionId },
      create: { atencionId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}) },
    });
  }

  async deleteExamenes(atencionId: number) {
    const record = await this.prisma.examenes.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Exámenes no encontrada');
    return this.prisma.examenes.delete({ where: { atencionId } });
  }

  // ─── Anestesiología (Sin Plantilla) ───────────────────────────────────────────
  async upsertAnestesiologia(atencionId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.anestesiologia.upsert({
      where: { atencionId },
      create: { atencionId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}) },
    });
  }

  async deleteAnestesiologia(atencionId: number) {
    const record = await this.prisma.anestesiologia.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Anestesiología no encontrada');
    return this.prisma.anestesiologia.delete({ where: { atencionId } });
  }

  // ─── Receta Médica (Sin Plantilla - Consulta Externa) ───────────────────────
  async upsertRecetaMedica(atencionId: number, datos: object, estado?: string) {
    await this.getAtencion(atencionId);
    return this.prisma.recetaMedica.upsert({
      where: { atencionId },
      create: { atencionId, datos, ...(estado ? { estado } : {}) },
      update: { datos, ...(estado ? { estado } : {}) },
    });
  }

  async deleteRecetaMedica(atencionId: number) {
    const record = await this.prisma.recetaMedica.findUnique({ where: { atencionId } });
    if (!record) throw new NotFoundException('Sección Receta Médica no encontrada');
    return this.prisma.recetaMedica.delete({ where: { atencionId } });
  }

  // ─── Lógica de Clonado ──────────────────────────────────────────────────
  async cloneExpediente(sourceAtencionId: number, targetCategoriaPacienteId: number, targetPaciente: any) {
    const source = await this.prisma.atencion.findUnique({
      where: { id: sourceAtencionId },
      include: this.fullInclude,
    });
    if (!source) throw new NotFoundException('Expediente origen no encontrado');

    // 1. Asegurar que existe la Atención destino
    const targetAtencion = await this.findOrCreate(targetCategoriaPacienteId);
    const targetId = targetAtencion.id;

    // Helper para reemplazar datos personales en JSONs de forma recursiva
    const overwritePersonalData = (datos: any, seccionName?: string) => {
      return this.overwritePersonalData(datos, targetPaciente, targetPaciente.tipoPaciente, seccionName);
    };

    // 2. Clonar Historia Clínica
    if (source.historiaClinica) {
      await this.upsertHistoriaClinica(
        targetId,
        source.historiaClinica.plantillaId,
        overwritePersonalData(source.historiaClinica.datos as object, 'historiaClinica'),
        source.historiaClinica.estado
      );
    }

    // 3. Clonar Consentimientos
    if (source.consentimientos && source.consentimientos.length > 0) {
      // Eliminar los creados por defecto si los hay (opcional, por si el findOrCreate metió algo)
      await this.prisma.consentimiento.deleteMany({ where: { atencionId: targetId } });
      for (const cons of source.consentimientos) {
        await this.createConsentimiento(
          targetId,
          cons.plantillaId,
          overwritePersonalData(cons.datos as object, 'consentimiento')
        );
      }
    }

    // 4. Clonar otras secciones únicas
    const cloneSection = async (sourceSec: any, upsertFn: Function, seccionName: string) => {
      if (sourceSec) {
        await upsertFn.call(this, targetId, sourceSec.plantillaId, overwritePersonalData(sourceSec.datos as object, seccionName), sourceSec.estado);
      }
    };

    // 3. Clonar Protocolos
    if (source.protocolos && source.protocolos.length > 0) {
      await this.prisma.protocolo.deleteMany({ where: { atencionId: targetId } });
      for (const prot of source.protocolos) {
        await this.createProtocolo(
          targetId,
          prot.plantillaId,
          overwritePersonalData(prot.datos as object, 'protocolo')
        );
      }
    }
    await cloneSection(source.cuidado, this.upsertCuidado, 'cuidado');
    await cloneSection(source.epicrisis, this.upsertEpicrisis, 'epicrisis');
    await cloneSection(source.receta, this.upsertReceta, 'receta');
    await cloneSection(source.certificado, this.upsertCertificado, 'certificado');
    await cloneSection(source.liquidacion, this.upsertLiquidacion, 'liquidacion');
    await cloneSection(source.enfermeria, this.upsertEnfermeria, 'enfermeria');
    await cloneSection(source.escalaRiesgo, this.upsertEscalaRiesgo, 'escalaRiesgo');

    // Clonar Consulta sin plantilla
    if (source.consulta) {
      await this.upsertConsulta(targetId, overwritePersonalData(source.consulta.datos as object, 'consulta'), source.consulta.estado);
    }
    
    // Clonar Examenes sin plantilla
    if (source.examenes) {
      await this.upsertExamenes(targetId, overwritePersonalData(source.examenes.datos as object, 'examenes'), source.examenes.estado);
    }

    // Clonar Anestesiologia sin plantilla
    if (source.anestesiologia) {
      await this.upsertAnestesiologia(targetId, overwritePersonalData(source.anestesiologia.datos as object, 'anestesiologia'), source.anestesiologia.estado);
    }

    // Clonar Receta Médica sin plantilla
    if (source.recetaMedica) {
      await this.upsertRecetaMedica(targetId, overwritePersonalData(source.recetaMedica.datos as object, 'receta-medica'), source.recetaMedica.estado);
    }

    return await this.findByCategoriaPaciente(targetCategoriaPacienteId);
  }
}
