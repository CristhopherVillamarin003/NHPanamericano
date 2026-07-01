'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import type { Paciente } from '@/types';

const EpicrisisForm: any = dynamic(
  () => import('@/components/atencion/EpicrisisForm'),
  { ssr: false },
);

const PLANTILLA_EPICRISIS_ID = 8;

function cleanExtractedHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    
    while (nodes.length > 0) {
      const node = nodes[0];
      const text = node.textContent?.trim() || '';
      const isBr = node.nodeName === 'BR';
      const isEmptyP = node.nodeName === 'P' && (!text && !(node as Element).querySelector('img, table, iframe'));
      if (text === '' && (node.nodeType === Node.TEXT_NODE || isBr || isEmptyP)) {
        nodes.shift();
      } else {
        break;
      }
    }
    while (nodes.length > 0) {
      const node = nodes[nodes.length - 1];
      const text = node.textContent?.trim() || '';
      const isBr = node.nodeName === 'BR';
      const isEmptyP = node.nodeName === 'P' && (!text && !(node as Element).querySelector('img, table, iframe'));
      if (text === '' && (node.nodeType === Node.TEXT_NODE || isBr || isEmptyP)) {
        nodes.pop();
      } else {
        break;
      }
    }
    
    let resultHtml = '';
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        resultHtml += (node as Element).outerHTML;
      } else if (node.nodeType === Node.TEXT_NODE) {
        resultHtml += node.textContent || '';
      }
    }
    return resultHtml.replace(/[\r\n]+/g, ' ');
  } catch(e) {
    return html.replace(/[\r\n]+/g, ' ');
  }
}

export default function EpicrisisPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const formRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        setAtencionId(atencionData.id);

        const catPac = (atencionData as any).categoriaPaciente;
        const cedulaPaciente = catPac?.paciente?.cedula || 'new';
        if (catPac?.paciente) {
          setPaciente(catPac.paciente);
        }

        let epicrisisDatos = (atencionData.epicrisis?.datos ?? {}) as any;

        // Auto-pull 'notas_evolucion' from 'historiaClinica'
        const hcDatos = atencionData.historiaClinica?.datos as any;
        let evolucionBloques: any[] = [];

        if (hcDatos?.evolucion?.bloques?.length > 0) {
          evolucionBloques = hcDatos.evolucion.bloques;
        }

        // Intentar leer borrador (draft) de localStorage
        try {
          const draftKey = `draft_hc_evolucion_${atencionData.id}_${cedulaPaciente}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.bloques?.length > 0) {
              evolucionBloques = parsed.bloques;
            }
          }
        } catch (e) {}

        // --- LITERAL B: RESUMEN DEL CUADRO CLÍNICO (Solo Bloque 0) ---
        if (evolucionBloques.length > 0 && (!epicrisisDatos.resumen_cuadro_clinico || epicrisisDatos.resumen_cuadro_clinico.trim() === '')) {
          const firstEvo = evolucionBloques[0].notas_evolucion;
          if (firstEvo) {
            let filteredEvolucion = firstEvo;
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(firstEvo, 'text/html');
              let foundSeguro = false;
              let resultHtml = '';
              for (let i = 0; i < doc.body.childNodes.length; i++) {
                const node = doc.body.childNodes[i];
                if (!foundSeguro) {
                  if (node.textContent?.toUpperCase().includes('SEGURO:')) {
                    foundSeguro = true;
                  }
                } else {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    resultHtml += (node as Element).outerHTML;
                  } else if (node.nodeType === Node.TEXT_NODE) {
                    resultHtml += node.textContent || '';
                  }
                }
              }
              if (foundSeguro) {
                filteredEvolucion = cleanExtractedHtml(resultHtml);
              }
            } catch (e) {
              console.error("Error parsing HTML for SEGURO:", e);
            }
            epicrisisDatos.resumen_cuadro_clinico = filteredEvolucion;
          }
        }

        // --- LITERAL C: RESUMEN DE EVOLUCIÓN Y COMPLICACIONES (Bloques 1 al N) ---
        if (evolucionBloques.length > 1 && (!epicrisisDatos.resumen_evolucion || epicrisisDatos.resumen_evolucion.trim() === '')) {
          let aggregatedHtml = '';
          for (let idx = 1; idx < evolucionBloques.length; idx++) {
            const bloque = evolucionBloques[idx];
            if (!bloque.notas_evolucion) continue;

            let formattedDate = bloque.fecha || '';
            if (formattedDate.includes('-')) {
              const [y, m, d] = formattedDate.split('-');
              formattedDate = `${d}/${m}/${y}`;
            }
            const formattedHora = (bloque.hora || '').replace(':', 'H');

            let firstLine = '';
            let secondLine = '';
            let filteredHtml = bloque.notas_evolucion;

            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(bloque.notas_evolucion, 'text/html');

              const pTags = doc.body.querySelectorAll('p');
              if (pTags.length > 0) firstLine = pTags[0].textContent || '';
              if (pTags.length > 1) secondLine = pTags[1].textContent || '';

              let foundSeguro = false;
              let contentHtml = '';
              for (let i = 0; i < doc.body.childNodes.length; i++) {
                const node = doc.body.childNodes[i];
                if (!foundSeguro) {
                  if (node.textContent?.toUpperCase().includes('SEGURO:')) {
                    foundSeguro = true;
                  }
                } else {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    contentHtml += (node as Element).outerHTML;
                  } else if (node.nodeType === Node.TEXT_NODE) {
                    contentHtml += node.textContent || '';
                  }
                }
              }
              if (foundSeguro) {
                filteredHtml = cleanExtractedHtml(contentHtml);
              }
            } catch (e) {
              console.error("Error parsing HTML for EVOLUCION SEGURO:", e);
            }

            const titleText = `${formattedDate} ${firstLine.trim()} ${secondLine.trim()} ${formattedHora}`;
            const headerHtml = `<p><strong>${titleText}</strong></p>`;

            aggregatedHtml += headerHtml + filteredHtml;
            if (idx < evolucionBloques.length - 1) {
              aggregatedHtml += '<p><br></p>';
            }
          }
          epicrisisDatos.resumen_evolucion = aggregatedHtml;
        }
        // --- LITERAL E: RESUMEN DE TRATAMIENTO Y PROCEDIMIENTOS TERAPÉUTICOS ---
        if (evolucionBloques.length > 0 && (!epicrisisDatos.resumen_tratamiento || epicrisisDatos.resumen_tratamiento.trim() === '')) {
          let aggregatedTratamientoHtml = '';
          for (let idx = 0; idx < evolucionBloques.length; idx++) {
            const bloque = evolucionBloques[idx];
            if (!bloque.farmacoterapia) continue;

            let firstLine = '';
            let secondLine = '';
            try {
              if (bloque.notas_evolucion) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(bloque.notas_evolucion, 'text/html');
                const pTags = doc.body.querySelectorAll('p');
                if (pTags.length > 0) firstLine = pTags[0].textContent || '';
                if (pTags.length > 1) secondLine = pTags[1].textContent || '';
              }
            } catch (e) {}

            // Skip if it's "NOTA DE ALTA"
            if (firstLine.toUpperCase().includes('NOTA DE ALTA')) {
              continue;
            }

            let formattedDate = bloque.fecha || '';
            if (formattedDate.includes('-')) {
              const [y, m, d] = formattedDate.split('-');
              formattedDate = `${d}/${m}/${y}`;
            }
            const formattedHora = (bloque.hora || '').replace(':', 'H');

            const titleText = `${formattedDate} ${firstLine.trim()} ${secondLine.trim()} ${formattedHora}`;
            const headerHtml = `<p><strong>${titleText}</strong></p>`;

            let filteredFarmaHtml = bloque.farmacoterapia;
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(bloque.farmacoterapia, 'text/html');

              // Eliminar los datos del médico insertados (Nombre, CI, Especialidad)
              const pTagsFarma = doc.body.querySelectorAll('p');
              for (let i = 0; i < pTagsFarma.length; i++) {
                const p = pTagsFarma[i];
                const text = p.textContent || '';
                if (text.trim().startsWith('CI: ') && /\d/.test(text)) {
                  const prev = p.previousElementSibling;
                  const next = p.nextElementSibling;
                  p.remove();
                  if (prev) prev.remove();
                  if (next) next.remove();
                }
              }

              let foundIndicaciones = false;
              let contentHtml = '';
              for (let i = 0; i < doc.body.childNodes.length; i++) {
                const node = doc.body.childNodes[i];
                if (!foundIndicaciones) {
                  if (node.textContent?.toUpperCase().includes('INDICACIONES')) {
                    foundIndicaciones = true;
                  }
                } else {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    contentHtml += (node as Element).outerHTML;
                  } else if (node.nodeType === Node.TEXT_NODE) {
                    contentHtml += node.textContent || '';
                  }
                }
              }
              
              // Si no se encontró la palabra 'INDICACIONES', usar todo el contenido (ya limpio del médico)
              if (foundIndicaciones) {
                filteredFarmaHtml = cleanExtractedHtml(contentHtml);
              } else {
                filteredFarmaHtml = cleanExtractedHtml(doc.body.innerHTML);
              }
            } catch (e) {
              console.error("Error parsing HTML for FARMACOTERAPIA INDICACIONES:", e);
            }

            aggregatedTratamientoHtml += headerHtml + filteredFarmaHtml;
            if (idx < evolucionBloques.length - 1) {
              aggregatedTratamientoHtml += '<p><br></p>';
            }
          }
          epicrisisDatos.resumen_tratamiento = aggregatedTratamientoHtml;
        }

        // --- LITERAL F: INDICACIONES DE ALTA / EGRESO ---
        if (evolucionBloques.length > 0 && (!epicrisisDatos.indicaciones_alta || epicrisisDatos.indicaciones_alta.trim() === '')) {
          let aggregatedIndicacionesHtml = '';
          for (let idx = 0; idx < evolucionBloques.length; idx++) {
            const bloque = evolucionBloques[idx];
            if (!bloque.farmacoterapia) continue;

            let firstLine = '';
            let secondLine = '';
            try {
              if (bloque.notas_evolucion) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(bloque.notas_evolucion, 'text/html');
                const pTags = doc.body.querySelectorAll('p');
                if (pTags.length > 0) firstLine = pTags[0].textContent || '';
                if (pTags.length > 1) secondLine = pTags[1].textContent || '';
              }
            } catch (e) {}

            // SOLO procesar si es "NOTA DE ALTA"
            if (!firstLine.toUpperCase().includes('NOTA DE ALTA')) {
              continue;
            }

            let formattedDate = bloque.fecha || '';
            if (formattedDate.includes('-')) {
              const [y, m, d] = formattedDate.split('-');
              formattedDate = `${d}/${m}/${y}`;
            }
            const formattedHora = (bloque.hora || '').replace(':', 'H');

            const titleText = `${formattedDate} ${firstLine.trim()} ${secondLine.trim()} ${formattedHora}`;
            const headerHtml = `<p><strong>${titleText}</strong></p>`;

            let filteredFarmaHtml = '';
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(bloque.farmacoterapia, 'text/html');

              // Eliminar los datos del médico insertados (Nombre, CI, Especialidad)
              const pTagsFarma = doc.body.querySelectorAll('p');
              for (let i = 0; i < pTagsFarma.length; i++) {
                const p = pTagsFarma[i];
                const text = p.textContent || '';
                if (text.trim().startsWith('CI: ') && /\d/.test(text)) {
                  const prev = p.previousElementSibling;
                  const next = p.nextElementSibling;
                  p.remove();
                  if (prev) prev.remove();
                  if (next) next.remove();
                }
              }

              let foundIndicaciones = false;
              let contentHtml = '';
              for (let i = 0; i < doc.body.childNodes.length; i++) {
                const node = doc.body.childNodes[i];
                if (!foundIndicaciones) {
                  if (node.textContent?.toUpperCase().includes('INDICACIONES')) {
                    foundIndicaciones = true;
                  }
                } else {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    contentHtml += (node as Element).outerHTML;
                  } else if (node.nodeType === Node.TEXT_NODE) {
                    contentHtml += node.textContent || '';
                  }
                }
              }
              
              if (foundIndicaciones) {
                filteredFarmaHtml = cleanExtractedHtml(contentHtml);
              } else {
                filteredFarmaHtml = cleanExtractedHtml(doc.body.innerHTML);
              }
            } catch (e) {
              console.error("Error parsing HTML for INDICACIONES DE ALTA:", e);
            }

            if (aggregatedIndicacionesHtml.length > 0 && filteredFarmaHtml.trim() !== '') {
              aggregatedIndicacionesHtml += '<p><br></p>';
            }
            if (filteredFarmaHtml.trim() !== '') {
              aggregatedIndicacionesHtml += headerHtml + filteredFarmaHtml;
            }
          }
          epicrisisDatos.indicaciones_alta = aggregatedIndicacionesHtml;
        }

        setInitialData(epicrisisDatos);
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
      await upsertSeccion(atencionId, 'epicrisis', PLANTILLA_EPICRISIS_ID, datosPlano);
      formRef.current?.clearAutosave?.();
      alert('Epicrisis guardada exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la epicrisis.');
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarDocx = async (datosPlano: Record<string, any>) => {
    if (!atencionId) return;
    try {
      setExportando(true);
      await upsertSeccion(atencionId, 'epicrisis', PLANTILLA_EPICRISIS_ID, datosPlano);
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_EPICRISIS_ID, 'epicrisis', datosPlano, 'docx', nombrePaciente);
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
              Epicrisis
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
        <EpicrisisForm
          ref={formRef}
          atencionId={atencionId ?? undefined}
          paciente={paciente ?? undefined}
          initialData={initialData}
          onGuardar={handleGuardar}
          onExportarDocx={handleExportarDocx}
          guardando={guardando}
          exportando={exportando}
        />
      </div>
    </div>
  );
}
