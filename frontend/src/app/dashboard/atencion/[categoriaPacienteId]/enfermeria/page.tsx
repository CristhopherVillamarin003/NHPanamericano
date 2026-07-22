'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';
import EnfermeriaForm, { EnfermeriaFormRef, EnfermeriaData, DEFAULT_ENFERMERIA_DATA } from '@/components/atencion/EnfermeriaForm';

const PLANTILLA_ENFERMERIA_ID = 50; // Ajusta al ID real de la plantilla en base de datos

export default function EnfermeriaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [initialData, setInitialData] = useState<Partial<EnfermeriaData>>(DEFAULT_ENFERMERIA_DATA);
  const formRef = useRef<EnfermeriaFormRef>(null);

  const pacienteNombre = useMemo(() => {
    if (!paciente) return 'Cargando paciente...';
    return `PACIENTE: ${(paciente.primerNombre ?? '').trim()} ${(paciente.primerApellido ?? '').trim()}`.trim();
  }, [paciente]);

  useEffect(() => {
    async function load() {
      const email = localStorage.getItem('user_email');
      setIsReadOnly(email !== 'enfermeria@hospitalpanamericano.com.ec');
      
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        setAtencionId(atencionData.id);

        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.pacienteId) {
          const p = { ...catPac.paciente };
          if (catPac.tipoPaciente) {
            p.tipoPaciente = catPac.tipoPaciente;
          }
          setPaciente(p);
        }

        const datosGuardados = (atencionData as any)?.enfermeria?.datos;
        if (datosGuardados) {
          setInitialData(datosGuardados);
        }
      } catch (err) {
        console.error('Error al cargar la atención:', err);
      } finally {
        setLoading(false);
      }
    }

    if (categoriaPacienteId) load();
  }, [categoriaPacienteId]);

  const handleGuardar = async () => {
    if (!atencionId || !formRef.current) return;
    try {
      setGuardando(true);
      const formData = formRef.current.getData();
      await upsertSeccion(atencionId, 'enfermeria', PLANTILLA_ENFERMERIA_ID, formData);
      formRef.current.clearAutosave();
      alert('Registro de enfermería guardado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar Registro de Enfermería. Asegúrese de que la plantilla (ID) exista en la base de datos.');
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarExcel = async () => {
    if (!atencionId || !formRef.current) return;
    try {
      setExportando(true);
      const formData = formRef.current.getData();
      await upsertSeccion(atencionId, 'enfermeria', PLANTILLA_ENFERMERIA_ID, formData);
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_ENFERMERIA_ID, 'enfermeria', formData, 'xlsx', nombrePaciente);
      formRef.current.clearAutosave();
    } catch (err) {
      console.error(err);
      alert('Error al descargar Excel.');
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">Cargando...</div>
    );
  }

  const handleBack = () => {
    if (formRef.current?.isDirty) {
      if (!confirm('Hay cambios sin guardar. ¿Seguro que quieres salir?')) {
        return;
      }
    }
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      {/* Header */}
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
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Enfermería</h1>
            <p className="text-xs text-gray-500 font-medium">{pacienteNombre}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-semibold rounded-md hover:bg-[#15304d] disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          )}
          <button
              type="button"
              onClick={handleDescargarExcel}
              disabled={exportando}
              className="px-4 py-2 bg-[#1e6b2e] text-white text-sm font-semibold rounded-md hover:bg-[#185a26] disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportando ? 'Descargando...' : 'Descargar Excel'}
            </button>
        </div>
      </div>

      {/* Formulario extraído a su componente independiente */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-[1100px] mx-auto">
          <EnfermeriaForm
            ref={formRef}
            paciente={paciente}
            initialData={initialData}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}
