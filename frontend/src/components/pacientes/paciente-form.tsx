'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema, type PacienteFormData } from '@/schemas/paciente.schemas';
import type { Paciente } from '@/types';

interface PacienteFormProps {
  defaultValues?: Partial<Paciente>;
  onSubmit: (data: PacienteFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  errorMessage?: string;
}

export function PacienteForm({ defaultValues, onSubmit, onCancel, loading, errorMessage }: PacienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema) as any,
    defaultValues: {
      primerNombre: defaultValues?.primerNombre ?? '',
      segundoNombre: defaultValues?.segundoNombre ?? '',
      primerApellido: defaultValues?.primerApellido ?? '',
      segundoApellido: defaultValues?.segundoApellido ?? '',
      tipoPaciente: (defaultValues as any)?.tipoPaciente ?? '',
      cedula: defaultValues?.cedula ?? '',
      fechaNacimiento: defaultValues?.fechaNacimiento
        ? defaultValues.fechaNacimiento.substring(0, 10)
        : '',
      edad: defaultValues?.edad ?? undefined,
      sexo: defaultValues?.sexo ?? '',
      telefono: defaultValues?.telefono ?? '',
      direccion: defaultValues?.direccion ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="paciente-form">
      {errorMessage && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      <div className="paciente-form-grid">
        {/* Primer Nombre */}
        <div className="form-field">
          <label htmlFor="primerNombre" className="form-label">
            Primer Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="primerNombre"
            type="text"
            className="form-input"
            {...register('primerNombre')}
          />
          {errors.primerNombre && (
            <p className="form-error">{errors.primerNombre.message}</p>
          )}
        </div>

        {/* Segundo Nombre */}
        <div className="form-field">
          <label htmlFor="segundoNombre" className="form-label">
            Segundo Nombre
          </label>
          <input
            id="segundoNombre"
            type="text"
            className="form-input"
            {...register('segundoNombre')}
          />
        </div>

        {/* Primer Apellido */}
        <div className="form-field">
          <label htmlFor="primerApellido" className="form-label">
            Primer Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="primerApellido"
            type="text"
            className="form-input"
            {...register('primerApellido')}
          />
          {errors.primerApellido && (
            <p className="form-error">{errors.primerApellido.message}</p>
          )}
        </div>

        {/* Segundo Apellido */}
        <div className="form-field">
          <label htmlFor="segundoApellido" className="form-label">
            Segundo Apellido
          </label>
          <input
            id="segundoApellido"
            type="text"
            className="form-input"
            {...register('segundoApellido')}
          />
        </div>

        {/* Cédula */}
        <div className="form-field">
          <label htmlFor="cedula" className="form-label">
            Cédula
          </label>
          <input
            id="cedula"
            type="text"
            className="form-input"
            {...register('cedula')}
          />
        </div>

        {/* Tipo de Paciente */}
        <div className="form-field">
          <label htmlFor="tipoPaciente" className="form-label">
            Tipo de Paciente
          </label>
          <select id="tipoPaciente" className="form-input" {...register('tipoPaciente')}>
            <option value="">Seleccionar</option>
            <option value="SPPAT">SPPAT</option>
            <option value="Particular">Particular</option>
          </select>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="form-field">
          <label htmlFor="fechaNacimiento" className="form-label">
            Fecha de Nacimiento
          </label>
          <input
            id="fechaNacimiento"
            type="date"
            className="form-input"
            {...register('fechaNacimiento')}
          />
        </div>

        {/* Edad */}
        <div className="form-field">
          <label htmlFor="edad" className="form-label">
            Edad
          </label>
          <input
            id="edad"
            type="number"
            min="0"
            className="form-input"
            {...register('edad', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' || Number.isNaN(v) ? undefined : v),
            })}
          />
        </div>

        {/* Sexo */}
        <div className="form-field">
          <label htmlFor="sexo" className="form-label">
            Sexo
          </label>
          <select id="sexo" className="form-input" {...register('sexo')}>
            <option value="">Seleccionar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Teléfono */}
        <div className="form-field">
          <label htmlFor="telefono" className="form-label">
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            className="form-input"
            {...register('telefono')}
          />
        </div>

        {/* Dirección */}
        <div className="form-field col-span-full">
          <label htmlFor="direccion" className="form-label">
            Dirección
          </label>
          <input
            id="direccion"
            type="text"
            className="form-input"
            {...register('direccion')}
          />
        </div>
      </div>

      <div className="paciente-form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
