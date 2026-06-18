import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class SeccionDto {
  @IsInt()
  @Min(1)
  plantillaId!: number;

  @IsOptional()
  @IsObject()
  datos?: Record<string, any>;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class UpdateSeccionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  plantillaId?: number;

  @IsOptional()
  @IsObject()
  datos?: Record<string, any>;

  @IsOptional()
  @IsString()
  estado?: string;
}
