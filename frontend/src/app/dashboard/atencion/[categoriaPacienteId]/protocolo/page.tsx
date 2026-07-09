'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';

const ProtocoloForm: any = dynamic(
  () => import('@/components/atencion/ProtocoloForm'),
  { ssr: false },
);

const PLANTILLA_PROTOCOLO_ID = 5; // ID del registro en tabla plantilla para protocolo

export default function ProtocoloPage() {
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
      setIsReadOnly(localStorage.getItem('user_email') === 'administracion@hospitalpanamericano.com.ec');
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        setAtencionId(atencionData.id);

        if (atencionData.protocolo) {
          setInitialData((atencionData.protocolo.datos ?? {}) as any);
        }

        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.paciente) {
          const p = { ...catPac.paciente };
          if (catPac.tipoPaciente) {
            p.tipoPaciente = catPac.tipoPaciente;
          }
          setPaciente(p);
        }
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
      await upsertSeccion(atencionId, 'protocolo', PLANTILLA_PROTOCOLO_ID, datosPlano);
      formRef.current?.clearAutosave?.();
      alert('Protocolo guardado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el protocolo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarExcel = async (datosPlano: Record<string, any>) => {
    if (!atencionId) return;
    try {
      setExportando(true);
      // Primero guardamos para asegurar que no se pierdan datos
      await upsertSeccion(atencionId, 'protocolo', PLANTILLA_PROTOCOLO_ID, datosPlano);
      formRef.current?.clearAutosave?.();
      // Luego exportamos
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_PROTOCOLO_ID, 'protocolo', datosPlano, 'xlsx', nombrePaciente);
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
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
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
              Protocolo
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
        <ProtocoloForm
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
