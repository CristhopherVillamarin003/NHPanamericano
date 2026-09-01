import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCategoriaPacienteDto {
  @IsOptional()
  @IsString()
  tipoPaciente?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsBoolean()
  syncPacienteInfo?: boolean;
}
