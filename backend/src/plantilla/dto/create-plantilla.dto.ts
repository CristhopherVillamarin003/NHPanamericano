import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePlantillaDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsString()
  nombre!: string;

  @IsString()
  @IsIn(['consentimiento', 'historia_clinica', 'cuidado', 'epicrisis', 'protocolo', 'receta'])
  seccion!: string;

  @IsString()
  @IsIn(['xlsx', 'docx'])
  tipoArchivo!: string;

  @IsOptional()
  @IsBoolean()
  esPlantillaFija?: boolean;

  @IsOptional()
  @IsString()
  rutaArchivo?: string;
}
