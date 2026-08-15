import { z } from 'zod';

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const soloNumeros = /^\d+$/;

export const pacienteSchema = z.object({
  primerNombre: z.string().min(1, 'Por favor llena los campos obligatorios').regex(soloLetras, 'Solo se permiten letras'),
  segundoNombre: z.string().regex(soloLetras, 'Solo se permiten letras').optional().or(z.literal('')),
  primerApellido: z.string().min(1, 'Por favor llena los campos obligatorios').regex(soloLetras, 'Solo se permiten letras'),
  segundoApellido: z.string().regex(soloLetras, 'Solo se permiten letras').optional().or(z.literal('')),
  tipoPaciente: z.string().min(1, 'Por favor llena los campos obligatorios'),
  cedula: z
    .string()
    .min(1, 'Por favor llena los campos obligatorios'),
  fechaNacimiento: z.string().min(1, 'Por favor llena los campos obligatorios'),
  edad: z
    .preprocess((val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? undefined : n;
    }, z.number().min(0).optional()),
  sexo: z.string().optional().or(z.literal('')),
  telefono: z
    .string()
    .regex(soloNumeros, 'Solo se permiten números')
    .optional()
    .or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  diagnostico: z.string().optional().or(z.literal('')),
  expedienteBaseId: z.number().optional(),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
