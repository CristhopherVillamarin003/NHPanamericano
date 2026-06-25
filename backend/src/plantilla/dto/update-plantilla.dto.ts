import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePlantillaDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(['consentimiento', 'historia_clinica', 'cuidado', 'epicrisis', 'protocolo', 'receta'])
  seccion?: string;

  @IsOptional()
  @IsString()
  @IsIn(['xlsx', 'docx'])
  tipoArchivo?: string;

  @IsOptional()
  @IsBoolean()
  esPlantillaFija?: boolean;

  @IsOptional()
  @IsString()
  rutaArchivo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  datos?: Record<string, any>;
}
