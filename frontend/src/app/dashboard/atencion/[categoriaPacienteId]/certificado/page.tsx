'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';

const CertificadoMedicoForm: any = dynamic(
  () => import('@/components/atencion/CertificadoMedicoForm'),
  { ssr: false },
);

// IMPORTANTE: Asegúrate de que este ID corresponda al ID de tu plantilla "certificado" en la base de datos.
const PLANTILLA_CERTIFICADO_ID = 10; 

export default function CertificadoPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any> | null>(null);
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

        if (atencionData.certificado) {
          setInitialData((atencionData.certificado.datos ?? {}) as any);
        } else {
          setInitialData({});
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
      await upsertSeccion(atencionId, 'certificado', PLANTILLA_CERTIFICADO_ID, datosPlano);
      formRef.current?.clearAutosave?.();
      alert('Certificado guardado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el certificado.');
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarDocx = async (datosPlano: Record<string, any>) => {
    if (!atencionId) return;
    try {
      setExportando(true);
      await upsertSeccion(atencionId, 'certificado', PLANTILLA_CERTIFICADO_ID, datosPlano);
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_CERTIFICADO_ID, 'certificado', datosPlano, 'docx', nombrePaciente);
      formRef.current?.clearAutosave?.();
    } catch (err) {
      console.error(err);
      alert('Error al exportar a Word.');
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
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
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
              Certificado Médico
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {paciente
                ? `PACIENTE: ${paciente.primerNombre ?? ''} ${paciente.primerApellido ?? ''}`.trim()
                : 'Cargando paciente...'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#f1f5f9]">
        <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
          {initialData === null ? (
            <div className="p-8 text-center text-sm text-gray-500">Cargando formulario...</div>
          ) : (
            <CertificadoMedicoForm
              isReadOnly={isReadOnly}
              ref={formRef}
              atencionId={atencionId ?? undefined}
              paciente={paciente ?? undefined}
              initialData={initialData}
              onGuardar={handleGuardar}
              onExportarDocx={handleExportarDocx}
              guardando={guardando}
              exportando={exportando}
            />
          )}
        </div>
      </div>
    </div>
  );
}
