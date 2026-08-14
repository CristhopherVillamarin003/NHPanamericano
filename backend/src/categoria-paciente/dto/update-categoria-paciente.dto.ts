import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoriaPacienteDto {
  @IsOptional()
  @IsString()
  tipoPaciente?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;
}
