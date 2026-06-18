import { Module } from '@nestjs/common';
import { PlantillaService } from './plantilla.service';
import { PlantillaController } from './plantilla.controller';
import { UploadService } from './upload.service';
import { ExportService } from './export.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PlantillaService, UploadService, ExportService],
  controllers: [PlantillaController],
  exports: [PlantillaService, ExportService],
})
export class PlantillaModule {}
