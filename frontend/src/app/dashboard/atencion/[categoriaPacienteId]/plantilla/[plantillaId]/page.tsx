'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { getPlantilla, updatePlantilla } from '@/lib/services/plantillas';

const ConsentimientoForm = dynamic(
  () => import('@/components/atencion/ConsentimientoForm'),
  { ssr: false }
);

export default function PlantillaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);
  const plantillaId = Number(params.plantillaId);

  const [plantilla, setPlantilla] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const formRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const p = await getPlantilla(plantillaId);
        setPlantilla(p);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    if (plantillaId) load();
  }, [plantillaId]);

  const handleGuardar = async (datos: { anverso: any; reverso: any }) => {
    if (!plantilla) return;
    setGuardando(true);
    try {
      await updatePlantilla(plantilla.id, {
        datos: {
          anverso: datos.anverso,
          reverso: datos.reverso,
        }
      });
      formRef.current?.clearAutosave?.();
      alert('Plantilla guardada exitosamente.');
    } catch {
      /* silently fail */
    } finally {
      setGuardando(false);
    }
  };

  const handleBack = () => {
    if (formRef.current?.isDirty?.()) {
      if (!confirm('Hay cambios sin guardar. ¿Seguro que quieres salir?')) {
        return;
      }
    }
    router.push(`/dashboard/atencion/${categoriaPacienteId}`);
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
              Editando Plantilla: {plantilla?.nombre ?? 'Plantilla'}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Los cambios se guardarán como una plantilla global.
            </p>
          </div>
        </div>
      </div>
      <div className="form-page-body">
        <ConsentimientoForm
          ref={formRef}
          isTemplateMode={true}
          initialData={{
            anverso: plantilla?.datos?.anverso,
            reverso: plantilla?.datos?.reverso,
          }}
          onGuardar={handleGuardar}
          guardando={guardando}
        />
      </div>
    </div>
  );
}
