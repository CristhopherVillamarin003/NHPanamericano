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
    escalaRiesgo:      { include: { plantilla: true } },
    consulta:          true,
    examenes:          true,
    anestesiologia:    true,
  };

  
  async syncPacienteData(categoriaPacienteId: number) {
    const atencion = await this.prisma.atencion.findUnique({
      where: { categoriaPacienteId },
      include: {
        categoriaPaciente: { include: { paciente: true } },
        historiaClinica: true,
        protocolo: true,
        cuidado: true,
        epicrisis: true,
        receta: true,
        certificado: true,
        liquidacion: true,
        enfermeria: true,
        escalaRiesgo: true,
        consulta: true,
        examenes: true,
        anestesiologia: true,
      }
    });

    if (!atencion || !atencion.categoriaPaciente?.paciente) return;

    const paciente = atencion.categoriaPaciente.paciente;
    const nombres_completos = [
      paciente.primerNombre,
      paciente.segundoNombre,
      paciente.primerApellido,
      paciente.segundoApellido
    ].filter(Boolean).join(" ").toUpperCase();
    const dni = paciente.cedula || '';
    const is_sppat = (atencion.categoriaPaciente.tipoPaciente || paciente.tipoPaciente) === 'SPPAT';

    const updateForm = async (model: any, form: any) => {
      if (!form) return;
      const datos = typeof form.datos === 'string' ? JSON.parse(form.datos) : form.datos;
      if (!datos) return;
      
      let modified = false;
      if (datos.nombres_completos !== undefined && datos.nombres_completos !== nombres_completos) {
        datos.nombres_completos = nombres_completos;
        modified = true;
      }
      if (datos.dni !== undefined && datos.dni !== dni) {
        datos.dni = dni;
        modified = true;
      }
      if (is_sppat && !datos.is_sppat) {
        datos.is_sppat = true;
        modified = true;
      }

      if (modified) {
        await model.update({
          where: { id: form.id },
          data: { datos }
        });
      }
    };

    if (atencion.historiaClinica) await updateForm(this.prisma.historiaClinica, atencion.historiaClinica);
    if (atencion.protocolo) await updateForm(this.prisma.protocolo, atencion.protocolo);
    if (atencion.cuidado) await updateForm(this.prisma.cuidado, atencion.cuidado);
    if (atencion.epicrisis) await updateForm(this.prisma.epicrisis, atencion.epicrisis);
    if (atencion.receta) await updateForm(this.prisma.receta, atencion.receta);
    if (atencion.certificado) await updateForm(this.prisma.certificado, atencion.certificado);
    if (atencion.liquidacion) await updateForm(this.prisma.liquidacion, atencion.liquidacion);
    if (atencion.enfermeria) await updateForm(this.prisma.enfermeria, atencion.enfermeria);
    if (atencion.escalaRiesgo) await updateForm(this.prisma.escalaRiesgo, atencion.escalaRiesgo);
    if (atencion.consulta) await updateForm(this.prisma.consulta, atencion.consulta);
    if (atencion.examenes) await updateForm(this.prisma.examenes, atencion.examenes);
    if (atencion.anestesiologia) await updateForm(this.prisma.anestesiologia, atencion.anestesiologia);
    
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
      if (!datos || typeof datos !== 'object') return datos;
      // Hacer una copia profunda para evitar mutar el objeto original en memoria
      const result = JSON.parse(JSON.stringify(datos));
      
      const fullName = [
        targetPaciente.primerApellido,
        targetPaciente.segundoApellido,
        targetPaciente.primerNombre,
        targetPaciente.segundoNombre
      ].filter(Boolean).join(' ');

      const newValues: any = {
        primer_nombre: targetPaciente.primerNombre ?? '',
        segundo_nombre: targetPaciente.segundoNombre ?? '',
        primer_apellido: targetPaciente.primerApellido ?? '',
        segundo_apellido: targetPaciente.segundoApellido ?? '',
        cedula: targetPaciente.cedula ?? '',
        numero_historia_clinica: targetPaciente.cedula ?? '',
        edad: targetPaciente.edad ? String(targetPaciente.edad) : '',
        sexo: targetPaciente.sexo ? (targetPaciente.sexo.toUpperCase().startsWith('F') ? 'F' : 'M') : '',
        institucion: targetPaciente.tipoPaciente ?? 'PARTICULAR',
        // Alias usados en Receta, Certificado y otros forms
        nombre_paciente: fullName,
        cedula_paciente: targetPaciente.cedula ?? '',
        edad_paciente: targetPaciente.edad ? String(targetPaciente.edad) : '',
        // Alias específicos del Reverso de Consentimientos
        nombre_paciente_firma: fullName,
        cedula_paciente_firma: targetPaciente.cedula ?? '',
        nombre_paciente_negativa: fullName,
        cedula_paciente_negativa: targetPaciente.cedula ?? '',
        nombre_paciente_rev: fullName,
        cedula_paciente_rev: targetPaciente.cedula ?? '',
        // Alias específicos de Enfermería
        nombres_completos: fullName,
        dni: targetPaciente.cedula ?? '',
      };

      // Proteger el campo "nombre" en secciones donde se usa para el TÍTULO del documento (Consentimientos y Protocolos)
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
          } else if (typeof value === 'object') {
            traverse(value);
          }
        }
      };

      traverse(result);
      return result;
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

    await cloneSection(source.protocolo, this.upsertProtocolo, 'protocolo');
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

    return await this.findByCategoriaPaciente(targetCategoriaPacienteId);
  }
}
