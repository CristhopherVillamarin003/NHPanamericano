'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';
import { useFormAutosaveAndWarn } from '@/hooks/useFormAutosaveAndWarn';

// TipTap usa APIs del navegador, se carga solo en cliente
const RichTextEditor = dynamic(() => import('@/components/atencion/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-sm text-gray-400">
      Cargando editor...
    </div>
  ),
});

const PLANTILLA_CUIDADO_ID = 7;

// ─── Plantilla de contenido por defecto para Cuidados ────────────────────────
const CUIDADOS_TEMPLATE_HTML = `<p style="text-align: center"><span style="font-family: Arial; font-size: 18pt; color: #1a3a5c"><strong>NUEVO HOSPITAL PANAMERICANO</strong></span></p><p style="text-align: center"><span style="font-family: Arial; font-size: 13pt; color: #2c5282"><strong>CENTRO MÉDICO DE ESPECIALIDADES</strong></span></p><p style="text-align: center"><span style="font-family: Arial; font-size: 9pt; color: #555555">DIRECCIÓN: Juan de Arguello Oe2-157 y Pedro de Alfaro (esq.) Junto al Retén de Policía Villa Flora</span></p><p style="text-align: center"><span style="font-family: Arial; font-size: 9pt; color: #555555">Telfs. 2615-687 / 2664-130 | Fax: 2663-661 | nhpanamericanovlc@gmail.com | Quito - Ecuador</span></p><p><br></p><p style="text-align: center"><span style="font-family: Arial; font-size: 13pt; color: #1a3a5c"><strong>INSTRUCCIONES DE CUIDADOS POST-OPERATORIOS</strong></span></p><p><br></p><p><span style="font-family: Arial; font-size: 15pt"><strong>Cuidados de la Herida</strong></span></p><ul><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Limpieza:</strong> Mantener la zona seca las primeras 24-48 horas. Después, lavar la herida suavemente con agua y jabón neutro, secando a toques sin tallar.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Signos de alerta:</strong> Vigila si hay enrojecimiento excesivo, calor, salida de pus o si la herida se abre.</span></p></li></ul><p><span style="font-family: Arial; font-size: 15pt"><strong>Actividad Física y Reposo</strong></span></p><ul><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Movilidad temprana:</strong> Caminar distancias cortas dentro de casa desde el primer día para evitar coágulos y mejorar la digestión.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Restricción de peso:</strong> No levantar objetos pesados (más de 5 kg) ni realizar esfuerzos abdominales intensos (como abdominales o cargar niños) por al menos 4 a 6 semanas.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Protección al toser:</strong> Sujeta una almohada firmemente contra el abdomen si necesitas toser, estornudar o reír para reducir la presión en la sutura.</span></p></li></ul><p><span style="font-family: Arial; font-size: 15pt"><strong>Alimentación y Medicación</strong></span></p><ul><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Dieta:</strong> Consume alimentos ricos en fibra (frutas, verduras, cereales integrales) y bebe mucha agua para evitar el estreñimiento, ya que el esfuerzo al evacuar puede lastimar la reparación.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt"><strong>Medicamentos:</strong> Tomar los medicamentos según el horario indicado por el médico, incluso si el dolor es leve al principio.</span></p></li></ul><p><span style="font-family: Arial; font-size: 15pt"><strong>¿Cuándo contactar al médico de inmediato?</strong></span></p><ul><li><p><span style="font-family: Arial; font-size: 12pt">Fiebre mayor a 38°C.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt">Dolor abdominal intenso que no cede con la medicación.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt">Vómitos persistentes o incapacidad para canalizar gases.</span></p></li><li><p><span style="font-family: Arial; font-size: 12pt">Hinchazón o un bulto nuevo en la zona de la cirugía.</span></p></li></ul>`;

export default function CuidadosPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [html, setHtml] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const pacienteNombre = useMemo(() => {
    if (!paciente) return 'Cargando paciente...';
    return `PACIENTE: ${(paciente.primerNombre ?? '').trim()} ${(paciente.primerApellido ?? '').trim()}`.trim();
  }, [paciente]);

  useEffect(() => {
    async function load() {
      setIsReadOnly(localStorage.getItem('user_email') === 'administracion@hospitalpanamericano.com.ec');
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

        const htmlGuardado = (atencionData as any)?.cuidado?.datos?.html;
        if (typeof htmlGuardado === 'string') {
          setHtml(htmlGuardado);
        } else {
          setHtml(CUIDADOS_TEMPLATE_HTML);
        }
      } catch (err) {
        console.error('Error al cargar la atención:', err);
      } finally {
        setLoading(false);
      }
    }

    if (categoriaPacienteId) load();
  }, [categoriaPacienteId]);

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `cuidados_${paciente?.cedula || 'new'}`,
    initialData: { html: CUIDADOS_TEMPLATE_HTML }, // just a fallback, usually loaded above
    currentData: { html },
    onRestore: (saved) => {
      if (saved.html) setHtml(saved.html);
    },
  });

  const handleGuardar = async () => {
    if (!atencionId) return;
    try {
      setGuardando(true);
      await upsertSeccion(atencionId, 'cuidado', PLANTILLA_CUIDADO_ID, { html });
      clearAutosave();
      alert('Cuidados guardado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar Cuidados.');
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarWord = async () => {
    if (!atencionId) return;
    try {
      setExportando(true);
      await upsertSeccion(atencionId, 'cuidado', PLANTILLA_CUIDADO_ID, { html });
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_CUIDADO_ID, 'cuidado', { html }, 'docx', nombrePaciente);
      clearAutosave();
    } catch (err) {
      console.error(err);
      alert('Error al descargar Word.');
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
    if (isDirty) {
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
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Cuidados</h1>
            <p className="text-xs text-gray-500 font-medium">{pacienteNombre}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-semibold rounded-md hover:bg-[#15304d] disabled:opacity-60 transition-colors"
            >
              {guardando ? 'Guardando...' : '💾 Guardar'}
            </button>
          )}
          <button
              type="button"
              onClick={handleDescargarWord}
              disabled={exportando}
              className="px-4 py-2 bg-[#1e6b2e] text-white text-sm font-semibold rounded-md hover:bg-[#185a26] disabled:opacity-60 transition-colors"
            >
              {exportando ? 'Descargando...' : '📄 Descargar Word'}
            </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className={`max-w-[1100px] mx-auto ${isReadOnly ? 'read-only-mode' : ''}`} inert={isReadOnly ? true : undefined}>
          <RichTextEditor
            content={html}
            onChange={setHtml}
            minHeight="70vh"
          />
        </div>
      </div>
    </div>
  );
}
