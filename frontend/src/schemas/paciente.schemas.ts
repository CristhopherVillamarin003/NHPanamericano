import { z } from 'zod';

export const validarCedulaEcuatoriana = (cedula: string): boolean => {
  if (!/^\d{10}$/.test(cedula)) return false;

  const digitoRegion = Number(cedula.substring(0, 2));
  if (digitoRegion < 1 || digitoRegion > 24) return false;

  const tercerDigito = Number(cedula.substring(2, 3));
  if (tercerDigito >= 6) return false; // Solo personas naturales

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < coeficientes.length; i++) {
    let valor = Number(cedula.charAt(i)) * coeficientes[i];
    if (valor > 9) valor -= 9;
    total += valor;
  }

  const digitoVerificador = Number(cedula.charAt(9));
  const decenaSuperior = Math.ceil(total / 10) * 10;
  let resultado = decenaSuperior - total;
  if (resultado === 10) resultado = 0;

  return resultado === digitoVerificador;
};

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const soloNumeros = /^\d+$/;

export const pacienteSchema = z.object({
  primerNombre: z.string().min(1, 'Requerido').regex(soloLetras, 'Solo se permiten letras'),
  segundoNombre: z.string().regex(soloLetras, 'Solo se permiten letras').optional().or(z.literal('')),
  primerApellido: z.string().min(1, 'Requerido').regex(soloLetras, 'Solo se permiten letras'),
  segundoApellido: z.string().regex(soloLetras, 'Solo se permiten letras').optional().or(z.literal('')),
  tipoPaciente: z.string().optional().or(z.literal('')),
  cedula: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || validarCedulaEcuatoriana(val), {
      message: 'Cédula ecuatoriana inválida',
    }),
  fechaNacimiento: z.string().optional().or(z.literal('')),
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
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
