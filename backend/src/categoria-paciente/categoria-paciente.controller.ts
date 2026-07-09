import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CategoriaPacienteService } from './categoria-paciente.service';
import { AddPacienteToCategoriaDto } from './dto/add-paciente-to-categoria.dto';
import { UpdateCategoriaPacienteDto } from './dto/update-categoria-paciente.dto';
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

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaPacienteDto) {
    return this.categoriaPacienteService.updateCategoriaPaciente(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaPacienteService.removePacienteFromCategoria(id);
  }
}
