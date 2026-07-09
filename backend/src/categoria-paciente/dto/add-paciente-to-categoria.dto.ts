import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class AddPacienteToCategoriaDto {
  @IsInt()
  @Min(1)
  categoriaId!: number;

  @IsInt()
  @Min(1)
  pacienteId!: number;

  @IsOptional()
  @IsString()
  tipoPaciente?: string;
}
