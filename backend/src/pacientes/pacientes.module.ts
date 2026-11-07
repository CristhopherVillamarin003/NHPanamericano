import { Module, forwardRef } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AtencionModule } from '../atencion/atencion.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AtencionModule)],
  providers: [PacientesService],
  controllers: [PacientesController],
  exports: [PacientesService],
})
export class PacientesModule {}
