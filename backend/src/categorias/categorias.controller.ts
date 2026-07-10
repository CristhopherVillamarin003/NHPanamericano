import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { AuthGuard, type RequestUser } from '../auth/auth.guard';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
@UseGuards(AuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  list() {
    return this.categoriasService.listAll();
  }

  @Post()
  create(@Req() req: { user: RequestUser }, @Body() dto: CreateCategoriaDto) {
    return this.categoriasService.createForUser(req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.delete(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, dto);
  }
}
