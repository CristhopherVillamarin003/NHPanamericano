export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  usuarioId: number;
  createdAt: string;
}

export interface Paciente {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  cedula?: string;
  fechaNacimiento?: string;
  edad?: number;
  tipoPaciente?: string;
  sexo?: string;
  telefono?: string;
  direccion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoriaPaciente {
  id: number;
  categoriaId: number;
  pacienteId: number;
  createdAt: string;
  paciente: Paciente;
}

// ─── Atención / Expediente ────────────────────────────────────────────────────

export interface Atencion {
  id: number;
  categoriaPacienteId: number;
  categoriaPaciente?: CategoriaPaciente;
  estado: string;
  createdAt: string;
  updatedAt: string;
  consentimientos: Consentimiento[];
  historiaClinica: SeccionUnica | null;
  protocolo: SeccionUnica | null;
  cuidado: SeccionUnica | null;
  epicrisis: SeccionUnica | null;
  receta: SeccionUnica | null;
  certificado: SeccionUnica | null;
  liquidacion: SeccionUnica | null;
}

export interface Consentimiento {
  id: number;
  atencionId: number;
  plantillaId: number;
  datos: Record<string, any>;
  estado: string;
  createdAt: string;
  updatedAt: string;
  plantilla?: Plantilla;
}

export interface SeccionUnica {
  id: number;
  atencionId: number;
  plantillaId: number;
  datos: Record<string, any>;
  estado: string;
  createdAt: string;
  updatedAt: string;
  plantilla?: Plantilla;
}

export interface Plantilla {
  id: number;
  codigo?: string;
  nombre: string;
  seccion: string;
  tipoArchivo: string;
  esPlantillaFija: boolean;
  rutaArchivo?: string;
  activo: boolean;
}
