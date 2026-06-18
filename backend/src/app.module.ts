import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { CategoriaPacienteModule } from './categoria-paciente/categoria-paciente.module';
import { AtencionModule } from './atencion/atencion.module';
import { PlantillaModule } from './plantilla/plantilla.module';
import { Cie10Module } from './cie10/cie10.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    PacientesModule,
    CategoriaPacienteModule,
    AtencionModule,
    PlantillaModule,
    Cie10Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
