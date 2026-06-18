import { IsInt, Min } from 'class-validator';

export class AddPacienteToCategoriaDto {
  @IsInt()
  @Min(1)
  categoriaId!: number;

  @IsInt()
  @Min(1)
  pacienteId!: number;
}
