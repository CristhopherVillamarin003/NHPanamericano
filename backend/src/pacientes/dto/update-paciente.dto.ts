import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePacienteDto {
  @IsOptional()
  @IsString()
  primerNombre?: string;

  @IsOptional()
  @IsString()
  segundoNombre?: string;

  @IsOptional()
  @IsString()
  primerApellido?: string;

  @IsOptional()
  @IsString()
  segundoApellido?: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad?: number;

  @IsOptional()
  @IsString()
  tipoPaciente?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
