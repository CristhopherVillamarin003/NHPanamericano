import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAtencionDto {
  @IsInt()
  @Min(1)
  categoriaPacienteId!: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
