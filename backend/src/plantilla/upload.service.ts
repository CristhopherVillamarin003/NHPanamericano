import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

const ALLOWED_EXTENSIONS = ['.xlsx', '.xlsm', '.xls', '.docx'];

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'plantillas');

  constructor() {
    // Crear carpeta si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Valida la extensión del archivo subido y devuelve la ruta relativa
   * que se guarda en la BD (campo ruta_archivo).
   */
  procesarArchivo(file: Express.Multer.File): string {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      // Eliminar el archivo si ya fue guardado por multer
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new BadRequestException(
        `Extensión no permitida: ${ext}. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }
    // Devolver solo el nombre del archivo (relativo a uploads/plantillas/)
    return file.filename;
  }

  eliminarArchivo(nombreArchivo: string): void {
    const filePath = path.join(this.uploadsDir, path.basename(nombreArchivo));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
