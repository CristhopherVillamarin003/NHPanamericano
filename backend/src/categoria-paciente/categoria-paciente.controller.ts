import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CategoriaPacienteService } from './categoria-paciente.service';
import { AddPacienteToCategoriaDto } from './dto/add-paciente-to-categoria.dto';
import { AuthGuard, type RequestUser } from '../auth/auth.guard';

@Controller('categoria-paciente')
@UseGuards(AuthGuard)
export class CategoriaPacienteController {
  constructor(private readonly categoriaPacienteService: CategoriaPacienteService) {}

  @Post()
  add(@Body() dto: AddPacienteToCategoriaDto) {
    return this.categoriaPacienteService.addPacienteToCategoria(dto);
  }

  @Get()
  list(@Query('categoriaId') categoriaId: string) {
    return this.categoriaPacienteService.listPacientesByCategoria(
      Number(categoriaId),
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaPacienteService.removePacienteFromCategoria(id);
  }
}
