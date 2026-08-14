import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriaPacienteService } from './categoria-paciente.service';
import { CategoriaPacienteController } from './categoria-paciente.controller';
import { AtencionModule } from '../atencion/atencion.module';

@Module({
  imports: [PrismaModule, AuthModule, AtencionModule],
  providers: [CategoriaPacienteService],
  controllers: [CategoriaPacienteController],
})
export class CategoriaPacienteModule {}
