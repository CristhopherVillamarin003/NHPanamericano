import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Cie10Service } from './cie10.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cie10')
@UseGuards(AuthGuard)
export class Cie10Controller {
  constructor(private readonly cie10Service: Cie10Service) {}

  /**
   * GET /cie10/buscar?q=K40
   * Busca por código (prefijo) o por descripción (ILIKE).
   * Devuelve máximo 20 resultados.
   */
  @Get('buscar')
  buscar(@Query('q') q: string) {
    return this.cie10Service.buscar(q ?? '');
  }
}
