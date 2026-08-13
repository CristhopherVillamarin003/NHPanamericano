import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';

const ALLOWED_EXTENSIONS = ['.pdf'];
const UPLOADS_DIR = join(process.cwd(), 'uploads', 'adjuntos');

@Controller('archivos')
export class ArchivosController {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  @Post('upload-pdf')
  @UseInterceptors(
    FilesInterceptor('files', 10, { // Allow up to 10 files at once
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Sólo se permiten archivos PDF.`), false);
        }
      },
    }),
  )
  uploadPdfs(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const adjuntos = files.map(file => ({
      nombre: file.originalname,
      url: `/archivos/pdfs/${file.filename}`
    }));

    return { adjuntos };
  }

  @Get('pdfs/:filename')
  getPdf(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Archivo no encontrado');
    }
    // Añadimos cabeceras para que el navegador sepa que es un PDF y pueda renderizarlo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.sendFile(filePath);
  }

  @Delete('pdfs/:filename')
  deletePdf(@Param('filename') filename: string) {
    const filePath = join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return { success: true, message: 'Archivo eliminado' };
      } catch (error) {
        throw new BadRequestException('No se pudo eliminar el archivo físico');
      }
    }
    return { success: true, message: 'Archivo no existía' };
  }
}
