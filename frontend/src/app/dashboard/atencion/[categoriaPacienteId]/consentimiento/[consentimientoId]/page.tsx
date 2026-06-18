'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { findOrCreateAtencion, updateConsentimiento, exportarConsentimiento } from '@/lib/services/atencion';
import { getPacienteById } from '@/lib/services/pacientes';
import type { Consentimiento, Paciente } from '@/types';
import { ArrowLeft } from 'lucide-react';

const ConsentimientoForm = dynamic(
  () => import('@/components/atencion/ConsentimientoForm'),
  { ssr: false }
);

export default function ConsentimientoPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);
  const consentimientoId = Number(params.consentimientoId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const formRef = useRef<any>(null);

  const PLANTILLA_ID = 1;

  useEffect(() => {
    async function load() {
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        const c = atencionData.consentimientos.find((x) => x.id === consentimientoId);
        if (c) setConsentimiento(c);
        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.paciente) {
          const p = await getPacienteById(catPac.pacienteId);
          setPaciente(p);
        }
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    if (categoriaPacienteId && consentimientoId) load();
  }, [categoriaPacienteId, consentimientoId]);

  const handleGuardar = async (datos: { anverso: any; reverso: any }) => {
    if (!consentimiento) return;
    setGuardando(true);
    try {
      await updateConsentimiento(consentimiento.id, {
        ...consentimiento.datos,
        anverso: datos.anverso,
        reverso: datos.reverso,
      });
      formRef.current?.clearAutosave?.();
      alert('Consentimiento guardado exitosamente.');
    } catch {
      /* silently fail */
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarExcel = async (datos: { anverso: any; reverso: any }) => {
    setExportando(true);
    try {
      await exportarConsentimiento(PLANTILLA_ID, { ...datos.anverso, ...datos.reverso });
      formRef.current?.clearAutosave?.();
    } catch {
      /* silently fail */
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="data-table-spinner" />
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {/* Header con nombre del paciente */}
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
              {consentimiento?.datos?.nombre ?? 'Consentimiento'}
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
        <ConsentimientoForm
          ref={formRef}
          consentimientoId={consentimientoId}
          paciente={{
            primer_nombre: paciente?.primerNombre ?? '',
            segundo_nombre: paciente?.segundoNombre ?? '',
            primer_apellido: paciente?.primerApellido ?? '',
            segundo_apellido: paciente?.segundoApellido ?? '',
            cedula: paciente?.cedula ?? '',
            edad: paciente?.edad,
            sexo: paciente?.sexo ?? '',
            tipoPaciente: paciente?.tipoPaciente ?? '',
          }}
          initialData={{
            anverso: consentimiento?.datos?.anverso,
            reverso: consentimiento?.datos?.reverso,
          }}
          onGuardar={handleGuardar}
          onExportarExcel={handleExportarExcel}
          guardando={guardando}
          exportando={exportando}
        />
      </div>
    </div>
  );
}
