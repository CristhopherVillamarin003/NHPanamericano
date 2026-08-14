'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema, type PacienteFormData } from '@/schemas/paciente.schemas';
import type { Paciente } from '@/types';

interface PacienteFormProps {
  defaultValues?: Partial<Paciente>;
  onSubmit: (data: PacienteFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  errorMessage?: string;
  isEdit?: boolean;
}

export function PacienteForm({ defaultValues, onSubmit, onCancel, loading, errorMessage, isEdit }: PacienteFormProps) {
  const [reciclar, setReciclar] = useState(false);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [expSearch, setExpSearch] = useState('');
  const [expDropdownOpen, setExpDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (!isEdit && reciclar) {
      import('@/lib/services/categoria-paciente').then(mod => {
        mod.getAllExpedientes().then(data => setExpedientes(data));
      });
    }
  }, [isEdit, reciclar]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      diagnostico: (defaultValues as any)?.diagnostico ?? '',
      expedienteBaseId: undefined,
    },
  });

  const fechaNacimiento = watch('fechaNacimiento');
  const expedienteBaseId = watch('expedienteBaseId');

  const filteredExpedientes = useMemo(() => {
    if (!expSearch) return expedientes;
    const q = expSearch.toLowerCase();
    return expedientes.filter(exp => {
      const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ').toLowerCase();
      const servicio = exp.categoria?.nombre?.toLowerCase() || '';
      const diag = exp.diagnostico?.toLowerCase() || '';
      return nombres.includes(q) || servicio.includes(q) || diag.includes(q);
    });
  }, [expedientes, expSearch]);

  useEffect(() => {
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento);
      // Validar si la fecha es válida
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setValue('edad', age >= 0 ? age : 0, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [fechaNacimiento, setValue]);

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
            Cédula <span className="text-red-500">*</span>
          </label>
          <input
            id="cedula"
            type="text"
            className="form-input"
            {...register('cedula')}
          />
          {errors.cedula && (
            <p className="form-error">{errors.cedula.message}</p>
          )}
        </div>

        {/* Tipo de Paciente */}
        <div className="form-field">
          <label htmlFor="tipoPaciente" className="form-label">
            Tipo de Paciente <span className="text-red-500">*</span>
          </label>
          <select id="tipoPaciente" className="form-input" {...register('tipoPaciente')}>
            <option value="">Seleccionar</option>
            <option value="SPPAT">SPPAT</option>
            <option value="Particular">Particular</option>
          </select>
          {errors.tipoPaciente && (
            <p className="form-error">{errors.tipoPaciente.message}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="form-field">
          <label htmlFor="fechaNacimiento" className="form-label">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <input
            id="fechaNacimiento"
            type="date"
            className="form-input"
            {...register('fechaNacimiento')}
          />
          {errors.fechaNacimiento && (
            <p className="form-error">{errors.fechaNacimiento.message}</p>
          )}
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

        {/* --- Sección Exclusiva de Creación (Diagnóstico y Reciclar) --- */}
        {!isEdit && (
          <div className="col-span-full mt-4 p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="reciclar" 
                checked={reciclar}
                onChange={(e) => setReciclar(e.target.checked)}
                className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="reciclar" className="font-medium text-sm text-zinc-900">
                ¿Reciclar expediente de otro paciente?
              </label>
            </div>

            {reciclar && (
              <div className="form-field">
                <label htmlFor="expedienteBaseId" className="form-label text-sky-700">
                  Seleccione el expediente a reciclar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div 
                    className="form-input border-sky-300 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 flex items-center cursor-pointer bg-white h-[38px] px-3 py-0"
                    onClick={() => {
                      setExpDropdownOpen(!expDropdownOpen);
                      if (!expDropdownOpen) setExpSearch('');
                    }}
                  >
                    {expDropdownOpen ? (
                      <input
                        autoFocus
                        type="text"
                        value={expSearch}
                        onChange={(e) => setExpSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Buscar por paciente, servicio o diagnóstico..."
                        className="flex-1 bg-transparent outline-none border-none p-0 text-sm focus:ring-0 h-full w-full placeholder:text-gray-400"
                      />
                    ) : (
                      <span className={`flex-1 text-sm truncate ${!expedienteBaseId ? 'text-gray-500' : 'text-gray-900'}`}>
                        {(() => {
                          if (!expedienteBaseId) return "Buscar expediente...";
                          const exp = expedientes.find(e => e.atencion.id === expedienteBaseId);
                          if (!exp) return "Buscar expediente...";
                          const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ');
                          const servicio = exp.categoria?.nombre || 'Desconocido';
                          const diag = exp.diagnostico || 'Sin diagnóstico';
                          return `${nombres} - Servicio: ${servicio} - Dx: ${diag}`;
                        })()}
                      </span>
                    )}
                    {expDropdownOpen && expSearch ? (
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-2" onClick={(e) => { e.stopPropagation(); setExpSearch(''); }} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${expDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  
                  {expDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredExpedientes.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">Sin resultados</div>
                      ) : (
                        filteredExpedientes.map(exp => {
                          const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ');
                          const servicio = exp.categoria?.nombre || 'Desconocido';
                          const diag = exp.diagnostico || 'Sin diagnóstico';
                          const isSelected = expedienteBaseId === exp.atencion.id;
                          
                          return (
                            <div
                              key={exp.atencion.id}
                              onClick={() => {
                                setValue('expedienteBaseId', exp.atencion.id, { shouldValidate: true });
                                setExpSearch('');
                                setExpDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${isSelected ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700'}`}
                            >
                              <div className="font-medium">{nombres}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Servicio: {servicio} <span className="mx-1">•</span> Dx: {diag}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-field col-span-full">
          <label htmlFor="diagnostico" className="form-label text-sky-700">
            Diagnóstico { (!reciclar || isEdit) && <span className="text-red-500">*</span> }
          </label>
          <input
            id="diagnostico"
            type="text"
            placeholder={reciclar && !isEdit ? "El diagnóstico se heredará automáticamente del expediente" : "Ej: Apendicitis aguda"}
            className="form-input border-sky-300 focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={reciclar && !isEdit}
            {...register('diagnostico', { required: (!reciclar || isEdit) })}
          />
          {errors.diagnostico && (
            <p className="form-error">Por favor llena este campo.</p>
          )}
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
