import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { PlantillaService } from './plantilla.service';
import { UploadService } from './upload.service';
import { ExportService } from './export.service';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';
import { AuthGuard } from '../auth/auth.guard';

/**
 * GET    /plantillas                        → listar todas (activas), filtrar por ?seccion=
 * GET    /plantillas/:id                    → obtener una
 * POST   /plantillas                        → crear registro (sin archivo)
 * POST   /plantillas/upload                 → subir archivo + crear registro
 * PUT    /plantillas/:id                    → actualizar metadatos
 * DELETE /plantillas/:id                    → soft delete
 * POST   /plantillas/:id/exportar           → generar Excel con datos y descargar
 */
@Controller('plantillas')
@UseGuards(AuthGuard)
export class PlantillaController {
  constructor(
    private readonly plantillaService: PlantillaService,
    private readonly uploadService: UploadService,
    private readonly exportService: ExportService,
  ) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query('seccion') seccion?: string) {
    return this.plantillaService.findAll(seccion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantillaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlantillaDto) {
    return this.plantillaService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlantillaDto) {
    return this.plantillaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantillaService.remove(id);
  }

  // ─── UPLOAD ───────────────────────────────────────────────────────────────

  /**
   * POST /plantillas/upload
   * Sube el archivo .xlsx/.docx y crea el registro en la BD.
   * Body (multipart/form-data):
   *   - file: archivo
   *   - nombre, seccion, tipoArchivo, codigo? (campos del DTO)
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'plantillas'),
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePlantillaDto,
  ) {
    const nombreArchivo = this.uploadService.procesarArchivo(file);
    return this.plantillaService.create({
      ...body,
      esPlantillaFija: true,
      rutaArchivo: nombreArchivo,
    });
  }

  // ─── EXPORTAR ─────────────────────────────────────────────────────────────

  /**
   * POST /plantillas/:id/exportar
   * Body JSON: { datos: { campo: valor, ... } }
   * Devuelve el archivo Excel relleno como descarga.
   */
  @Post(':id/exportar')
  async exportar(
    @Param('id', ParseIntPipe) id: number,
    @Body('datos') datos: Record<string, any>,
    @Res() res: Response,
  ) {
    const plantilla = await this.plantillaService.findOne(id);

    // DOCX
    if (plantilla.tipoArchivo === 'docx' || plantilla.seccion === 'epicrisis' || plantilla.seccion === 'receta') {
      let buffer: Buffer;
      if (plantilla.seccion === 'epicrisis') {
        buffer = await this.exportService.generarDocxPorCeldas(
          plantilla.rutaArchivo!,
          plantilla.seccion,
          datos ?? {},
        );
      } else if (plantilla.seccion === 'receta') {
        buffer = await this.exportService.generarDocxReceta(
          plantilla.rutaArchivo!,
          plantilla.seccion,
          datos ?? {},
        );
      } else if (plantilla.seccion === 'certificado') {
        buffer = await this.exportService.generarDocxCertificado(
          plantilla.rutaArchivo!,
          plantilla.seccion,
          datos ?? {},
        );
      } else {
        buffer = await this.exportService.generarDocx(datos ?? {});
      }

      const filename = `${plantilla.seccion}-${Date.now()}.docx`;
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
      return;
    }

    // XLSX (default)
    const buffer = await this.exportService.generarExcel(
      plantilla.rutaArchivo!,
      plantilla.seccion,
      datos ?? {},
    );

    const filename = `${plantilla.seccion}-${Date.now()}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
