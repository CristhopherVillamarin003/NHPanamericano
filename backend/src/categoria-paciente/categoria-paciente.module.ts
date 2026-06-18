import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriaPacienteService } from './categoria-paciente.service';
import { CategoriaPacienteController } from './categoria-paciente.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CategoriaPacienteService],
  controllers: [CategoriaPacienteController],
})
export class CategoriaPacienteModule {}
