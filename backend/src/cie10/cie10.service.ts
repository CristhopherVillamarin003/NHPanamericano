import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Cie10Item {
  codigo: string;
  descripcion: string;
}

@Injectable()
export class Cie10Service {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca en hospital.cie10 por código (prefijo, case-insensitive)
   * o por descripción (ILIKE con % en ambos extremos).
   * Devuelve máximo 20 resultados ordenados: primero los que empiezan
   * con el término, luego el resto.
   */
  async buscar(q: string): Promise<Cie10Item[]> {
    const term = q.trim();
    if (term.length < 1) return [];

    const upper = term.toUpperCase();

    // Usamos $queryRaw para acceder al schema hospital sin necesidad de
    // agregar el modelo a schema.prisma
    const rows = await this.prisma.$queryRaw<Cie10Item[]>`
      SELECT codigo, descripcion
      FROM hospital.cie10
      WHERE
        codigo ILIKE ${upper + '%'}
        OR descripcion ILIKE ${'%' + term + '%'}
      ORDER BY
        CASE WHEN codigo ILIKE ${upper + '%'} THEN 0 ELSE 1 END,
        codigo
      LIMIT 20
    `;

    return rows;
  }
}
