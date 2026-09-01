'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { getSessionCookie } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import { getPlantillas } from '@/lib/services/plantillas';
import type { Paciente } from '@/types';
import { Modal } from '@/components/ui/modal';
import EscalaMacdemForm, { EscalaMacdemFormRef } from '@/components/atencion/EscalaMacdemForm';
import EscalaMorseForm, { EscalaMorseFormRef } from '@/components/atencion/EscalaMorseForm';

export default function EscalaRiesgoPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [initialData, setInitialData] = useState<any>(null);
  const [tipoEscala, setTipoEscala] = useState<'MACDEMS' | 'MORSE' | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [macdemId, setMacdemId] = useState<number | null>(null);
  const [morseId, setMorseId] = useState<number | null>(null);

  const formMacdemRef = useRef<EscalaMacdemFormRef>(null);
  const formMorseRef = useRef<EscalaMorseFormRef>(null);

  const pacienteNombre = useMemo(() => {
    if (!paciente) return 'Cargando paciente...';
    return `PACIENTE: ${(paciente.primerNombre ?? '').trim()} ${(paciente.primerApellido ?? '').trim()}`.trim();
  }, [paciente]);

  useEffect(() => {
    async function load() {
      const email = getSessionCookie('user_email');
      setIsReadOnly(email !== 'enfermeria.nhpanamericano@gmail.com');
      
      try {
        const [atencionData, pMacdem, pMorse] = await Promise.all([
          findOrCreateAtencion(categoriaPacienteId),
          getPlantillas('escala-macdem'),
          getPlantillas('escala-morse'),
        ]);

        setAtencionId(atencionData.id);
        
        if (pMacdem?.length > 0) setMacdemId(pMacdem[0].id);
        if (pMorse?.length > 0) setMorseId(pMorse[0].id);
        // Fallback IDs en caso de que la búsqueda falle
        if (!pMacdem?.length) setMacdemId(51);
        if (!pMorse?.length) setMorseId(52);

        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.pacienteId) {
          const p = { ...catPac.paciente };
          if (catPac.tipoPaciente) {
            p.tipoPaciente = catPac.tipoPaciente;
          }
          setPaciente(p);
        }

        const datosGuardados = (atencionData as any)?.escalaRiesgo?.datos;
        if (datosGuardados && Object.keys(datosGuardados).length > 0) {
          setInitialData(datosGuardados);
          setTipoEscala(datosGuardados.tipo_escala || 'MACDEMS');
        } else {
          // Si no hay datos, mostrar modal de selección
          setShowModal(true);
        }
      } catch (err) {
        console.error('Error al cargar la atención:', err);
      } finally {
        setLoading(false);
      }
    }

    if (categoriaPacienteId) load();
  }, [categoriaPacienteId]);

  const handleSelectEscala = (tipo: 'MACDEMS' | 'MORSE') => {
    setTipoEscala(tipo);
    setInitialData({ tipo_escala: tipo });
    setShowModal(false);
  };

  const handleGuardar = async () => {
    if (!atencionId) return;
    const formRef = tipoEscala === 'MACDEMS' ? formMacdemRef : formMorseRef;
    if (!formRef.current) return;
    
    const plantillaId = tipoEscala === 'MACDEMS' ? macdemId : morseId;
    if (!plantillaId) {
      alert('Error: Plantilla no encontrada en la base de datos.');
      return;
    }

    try {
      setGuardando(true);
      const formData = formRef.current.getData();
      await upsertSeccion(atencionId, 'escala_riesgo', plantillaId, formData);
      formRef.current.clearAutosave();
      alert('Escala de Riesgo guardada exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la Escala de Riesgo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarDocx = async () => {
    if (!atencionId) return;
    const formRef = tipoEscala === 'MACDEMS' ? formMacdemRef : formMorseRef;
    if (!formRef.current) return;

    const plantillaId = tipoEscala === 'MACDEMS' ? macdemId : morseId;
    if (!plantillaId) {
      alert('Error: Plantilla no encontrada en la base de datos.');
      return;
    }

    try {
      setExportando(true);
      const formData = formRef.current.getData();
      await upsertSeccion(atencionId, 'escala_riesgo', plantillaId, formData);
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(plantillaId, 'escala_riesgo', formData, 'docx', nombrePaciente);
      formRef.current.clearAutosave();
    } catch (err) {
      console.error(err);
      alert('Error al descargar DOCX.');
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
    const formRef = tipoEscala === 'MACDEMS' ? formMacdemRef : formMorseRef;
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
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Escala de Riesgo</h1>
            <p className="text-xs text-gray-500 font-medium">{pacienteNombre}</p>
          </div>
        </div>

        {!showModal && tipoEscala && (
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
              onClick={handleDescargarDocx}
              disabled={exportando}
              className="px-4 py-2 bg-[#084298] text-white text-sm font-semibold rounded-md hover:bg-[#06337a] disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportando ? 'Descargando...' : 'Descargar DOCX'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          {!showModal && tipoEscala === 'MACDEMS' && (
            <EscalaMacdemForm
              ref={formMacdemRef}
              paciente={paciente as any}
              initialData={initialData}
              isReadOnly={isReadOnly}
            />
          )}
          {!showModal && tipoEscala === 'MORSE' && (
            <EscalaMorseForm
              ref={formMorseRef}
              paciente={paciente as any}
              initialData={initialData}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      </div>

      {/* Modal de Selección Inicial */}
      <Modal
        open={showModal}
        onClose={() => {
          if (!tipoEscala) {
            router.back();
          } else {
            setShowModal(false);
          }
        }}
        title="Seleccione la Escala de Riesgo"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center mb-2">
            Por favor, seleccione el tipo de escala de riesgo que desea aplicar a este paciente:
          </p>
          <button
            onClick={() => handleSelectEscala('MACDEMS')}
            className="w-full py-4 px-6 border-2 border-[#1a3a5c] text-[#1a3a5c] rounded-lg font-bold hover:bg-[#1a3a5c] hover:text-white transition-colors"
          >
            ESCALA DE RIESGO DE CAÍDA MACDEMS
          </button>
          <button
            onClick={() => handleSelectEscala('MORSE')}
            className="w-full py-4 px-6 border-2 border-[#1a3a5c] text-[#1a3a5c] rounded-lg font-bold hover:bg-[#1a3a5c] hover:text-white transition-colors"
          >
            ESCALA DE RIESGO DE CAÍDA DE MORSE
          </button>
        </div>
      </Modal>
    </div>
  );
}
