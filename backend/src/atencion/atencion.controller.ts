import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AtencionService } from './atencion.service';
import { SeccionDto, UpdateSeccionDto } from './dto/seccion.dto';
import { AuthGuard } from '../auth/auth.guard';

/**
 * Rutas:
 *
 * GET    /atencion/:categoriaPacienteId          → obtener expediente completo (o 404)
 * POST   /atencion/:categoriaPacienteId          → crear/obtener expediente
 *
 * POST   /atencion/:atencionId/consentimientos          → crear consentimiento
 * PUT    /atencion/consentimientos/:id                  → actualizar consentimiento
 * DELETE /atencion/consentimientos/:id                  → eliminar consentimiento
 *
 * PUT    /atencion/:atencionId/historia-clinica         → upsert historia clínica
 * PUT    /atencion/:atencionId/protocolo                → upsert protocolo
 * PUT    /atencion/:atencionId/cuidado                  → upsert cuidado
 * PUT    /atencion/:atencionId/epicrisis                → upsert epicrisis
 * PUT    /atencion/:atencionId/receta                   → upsert receta
 */
@Controller('atencion')
@UseGuards(AuthGuard)
export class AtencionController {
  constructor(private readonly atencionService: AtencionService) {}

  // ─── Expediente ───────────────────────────────────────────────────────────

  @Get(':categoriaPacienteId')
  findByCategoriaPaciente(
    @Param('categoriaPacienteId', ParseIntPipe) categoriaPacienteId: number,
  ) {
    // findOrCreate garantiza que siempre devuelve el expediente completo
    return this.atencionService.findOrCreate(categoriaPacienteId);
  }

  @Post(':categoriaPacienteId')
  findOrCreate(
    @Param('categoriaPacienteId', ParseIntPipe) categoriaPacienteId: number,
  ) {
    return this.atencionService.findOrCreate(categoriaPacienteId);
  }

  // ─── Consentimientos ──────────────────────────────────────────────────────

  @Post(':atencionId/consentimientos')
  createConsentimiento(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.createConsentimiento(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
    );
  }

  @Put('consentimientos/:id')
  updateConsentimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeccionDto,
  ) {
    return this.atencionService.updateConsentimiento(id, dto.datos ?? {}, dto.estado);
  }

  @Delete('consentimientos/:id')
  deleteConsentimiento(@Param('id', ParseIntPipe) id: number) {
    return this.atencionService.deleteConsentimiento(id);
  }

  // ─── Secciones únicas ─────────────────────────────────────────────────────

  @Put(':atencionId/historia-clinica')
  upsertHistoriaClinica(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertHistoriaClinica(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Put(':atencionId/protocolo')
  upsertProtocolo(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertProtocolo(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Delete(':atencionId/protocolo')
  deleteProtocolo(@Param('atencionId', ParseIntPipe) atencionId: number) {
    return this.atencionService.deleteProtocolo(atencionId);
  }

  @Delete(':atencionId/cuidado')
  deleteCuidado(@Param('atencionId', ParseIntPipe) atencionId: number) {
    return this.atencionService.deleteCuidado(atencionId);
  }

  @Put(':atencionId/cuidado')
  upsertCuidado(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertCuidado(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Put(':atencionId/epicrisis')
  upsertEpicrisis(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertEpicrisis(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Put(':atencionId/receta')
  upsertReceta(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertReceta(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Put(':atencionId/certificado')
  upsertCertificado(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertCertificado(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }

  @Put(':atencionId/liquidacion')
  upsertLiquidacion(
    @Param('atencionId', ParseIntPipe) atencionId: number,
    @Body() dto: SeccionDto,
  ) {
    return this.atencionService.upsertLiquidacion(
      atencionId,
      dto.plantillaId,
      dto.datos ?? {},
      dto.estado,
    );
  }
}
