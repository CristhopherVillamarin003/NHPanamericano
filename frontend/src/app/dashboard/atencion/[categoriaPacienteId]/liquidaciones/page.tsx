'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';

const LiquidacionForm: any = dynamic(
  () => import('@/components/atencion/LiquidacionForm'),
  { ssr: false },
);

// NOTA: Asegúrate de que el ID coincida con el id asignado en la BD al insertar la plantilla.
// Si en la base de datos es otro número, deberás actualizar esta constante.
const PLANTILLA_LIQUIDACIONES_ID = 47;

export default function LiquidacionesPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const formRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      // El administrador sí puede editar liquidaciones
      setIsReadOnly(false);
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        setAtencionId(atencionData.id);

        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.paciente) {
          const p = { ...catPac.paciente };
          if (catPac.tipoPaciente) {
            p.tipoPaciente = catPac.tipoPaciente;
          }
          setPaciente(p);
        }

        let liquidacionDatos = (atencionData.liquidacion?.datos ?? {}) as any;

        // Auto-fill dates from Historia Clinica (Evolución) if not already set
        const hcDatos = (atencionData.historiaClinica?.datos ?? {}) as any;
        const evolucionBloques = hcDatos.evolucion?.bloques;

        if (Array.isArray(evolucionBloques) && evolucionBloques.length > 0) {
          // Ingreso = first evolution note
          const ingreso = evolucionBloques[0];
          if (!liquidacionDatos.fecha_ingreso && ingreso.fecha) {
            liquidacionDatos.fecha_ingreso = ingreso.fecha;
          }
          if (!liquidacionDatos.hora_ingreso && ingreso.hora) {
            liquidacionDatos.hora_ingreso = ingreso.hora;
          }

          // Salida = NOTA DE ALTA
          const notaAlta = evolucionBloques.find((b: any) => 
            typeof b.notas_evolucion === 'string' && 
            b.notas_evolucion.toUpperCase().includes('NOTA DE ALTA')
          );
          if (notaAlta) {
            if (!liquidacionDatos.fecha_salida && notaAlta.fecha) {
              liquidacionDatos.fecha_salida = notaAlta.fecha;
            }
            if (!liquidacionDatos.hora_salida && notaAlta.hora) {
              liquidacionDatos.hora_salida = notaAlta.hora;
            }
          }
        }

        setInitialData(liquidacionDatos);

      } catch (err) {
        console.error('Error al cargar la atención:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoriaPacienteId]);

  const handleGuardar = async (datosPlano: Record<string, any>) => {
    if (!atencionId) return;
    try {
      setGuardando(true);
      await upsertSeccion(atencionId, 'liquidacion', PLANTILLA_LIQUIDACIONES_ID, datosPlano);
      formRef.current?.clearAutosave?.();
      alert('Liquidación guardada exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la liquidación.');
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarExcel = async (datosPlano: Record<string, any>) => {
    if (!atencionId) return;
    try {
      setExportando(true);
      await upsertSeccion(atencionId, 'liquidacion', PLANTILLA_LIQUIDACIONES_ID, datosPlano);
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      // Usamos el tipo_archivo 'xlsx'
      await exportarSeccion(PLANTILLA_LIQUIDACIONES_ID, 'liquidaciones', datosPlano, 'xlsx', nombrePaciente);
      formRef.current?.clearAutosave?.();
    } catch (err) {
      console.error(err);
      alert('Error al exportar a Excel.');
    } finally {
      setExportando(false);
    }
  };

  const handleBack = () => {
    if (formRef.current?.isDirty?.()) {
      if (!confirm('Hay cambios sin guardar. ¿Seguro que quieres salir?')) {
        return;
      }
    }
    router.back();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Cargando formulario...
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {/* Header global */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">
              Liquidaciones
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {paciente
                ? `PACIENTE: ${paciente.primerNombre ?? ''} ${paciente.primerApellido ?? ''}`.trim()
                : 'Cargando paciente...'}
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <LiquidacionForm
          isReadOnly={isReadOnly}
          ref={formRef}
          atencionId={atencionId ?? undefined}
          paciente={paciente ?? undefined}
          initialData={initialData}
          onGuardar={handleGuardar}
          onExportarExcel={handleExportarExcel}
          guardando={guardando}
          exportando={exportando}
        />
      </div>
    </div>
  );
}
