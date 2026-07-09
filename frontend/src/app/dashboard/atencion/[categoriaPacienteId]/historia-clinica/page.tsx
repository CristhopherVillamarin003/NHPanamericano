'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findOrCreateAtencion, upsertSeccion, exportarSeccion } from '@/lib/services/atencion';
import { getPacienteById } from '@/lib/services/pacientes';
import type { Paciente } from '@/types';

const HistoriaClinicaEmergenciaForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaEmergenciaForm'),
  { ssr: false },
);

const HistoriaClinicaAnamnesisForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaAnamnesisForm'),
  { ssr: false },
);

const HistoriaClinicaEvolucionForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaEvolucionForm'),
  { ssr: false },
);

const HistoriaClinicaLaboratorioForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaLaboratorioForm'),
  { ssr: false },
);

const HistoriaClinicaImagenologiaForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaImagenologiaForm'),
  { ssr: false },
);

const HistoriaClinicaInterconsultaForm: any = dynamic(
  () => import('@/components/atencion/HistoriaClinicaInterconsultaForm'),
  { ssr: false },
);

const PLANTILLA_HC_ID = 3; // ID del registro en tabla plantilla para historia_clinica

type Hoja = 'EMERGENCIA' | 'ANAMNESIS' | 'EVOLUCION' | 'LABORATORIO' | 'IMAGENOLOGIA' | 'INTERCONSULTA';

export default function HistoriaClinicaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaPacienteId = Number(params.categoriaPacienteId);

  const [tab, setTab] = useState<'EMERGENCIA' | 'ANAMNESIS' | 'EVOLUCION' | 'LABORATORIO' | 'IMAGENOLOGIA' | 'INTERCONSULTA'>('EMERGENCIA');

  const emergRef = useRef<any>(null);
  const anamRef = useRef<any>(null);
  const evolRef = useRef<any>(null);
  const labRef = useRef<any>(null);
  const imagRef = useRef<any>(null);
  const interRef = useRef<any>(null);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [atencionId, setAtencionId] = useState<number | null>(null);
  const [initialEmergencia, setInitialEmergencia] = useState<Record<string, any> | undefined>(undefined);
  const [initialAnamnesis, setInitialAnamnesis] = useState<Record<string, any> | undefined>(undefined);
  const [initialEvolucion, setInitialEvolucion] = useState<Record<string, any> | undefined>(undefined);
  const [initialLaboratorio, setInitialLaboratorio] = useState<Record<string, any> | undefined>(undefined);
  const [initialImagenologia, setInitialImagenologia] = useState<Record<string, any> | undefined>(undefined);
  const [initialInterconsulta, setInitialInterconsulta] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    async function load() {
      setIsReadOnly(localStorage.getItem('user_email') === 'administracion@hospitalpanamericano.com.ec');
      try {
        const atencionData = await findOrCreateAtencion(categoriaPacienteId);
        setAtencionId(atencionData.id);

        // Cargar datos guardados si ya existe la historia clínica
        if (atencionData.historiaClinica) {
          const saved = (atencionData.historiaClinica.datos ?? {}) as any;
          if (saved?.emergencia || saved?.anamnesis || saved?.evolucion || saved?.laboratorio || saved?.imagenologia || saved?.interconsulta) {
            setInitialEmergencia(saved?.emergencia ?? {});
            setInitialAnamnesis(saved?.anamnesis ?? {});
            setInitialEvolucion(saved?.evolucion ?? {});
            setInitialLaboratorio(saved?.laboratorio ?? {});
            setInitialImagenologia(saved?.imagenologia ?? {});
            setInitialInterconsulta(saved?.interconsulta ?? {});
          } else {
            // Compatibilidad con el guardado antiguo (solo EMERGENCIA)
            setInitialEmergencia(saved);
            setInitialAnamnesis({});
            setInitialEvolucion({});
            setInitialLaboratorio({});
            setInitialImagenologia({});
            setInitialInterconsulta({});
          }
        }

        // Datos del paciente
        const catPac = (atencionData as any).categoriaPaciente;
        if (catPac?.paciente) {
          const p = await getPacienteById(catPac.pacienteId);
          if (catPac.tipoPaciente) {
            p.tipoPaciente = catPac.tipoPaciente;
          }
          setPaciente(p);
        }
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    if (categoriaPacienteId) load();
  }, [categoriaPacienteId]);

  const pacienteProps = {
    primer_nombre: paciente?.primerNombre ?? '',
    segundo_nombre: paciente?.segundoNombre ?? '',
    primer_apellido: paciente?.primerApellido ?? '',
    segundo_apellido: paciente?.segundoApellido ?? '',
    cedula: paciente?.cedula ?? '',
    edad: paciente?.edad,
    sexo: paciente?.sexo ?? '',
    fecha_nacimiento: paciente?.fechaNacimiento ?? '',
    tipoPaciente: paciente?.tipoPaciente ?? '',
  };

  const handleGuardarTodo = async () => {
    if (!atencionId) return;
    setGuardando(true);
    try {
      const emergencia = emergRef.current?.getDatos?.() ?? {};
      const anamnesis = anamRef.current?.getDatos?.() ?? {};
      const evolucion = evolRef.current?.getDatos?.() ?? {};
      const laboratorio = labRef.current?.getDatos?.() ?? {};
      const imagenologia = imagRef.current?.getDatos?.() ?? {};
      const interconsulta = interRef.current?.getDatos?.() ?? {};
      await upsertSeccion(atencionId, 'historia-clinica', PLANTILLA_HC_ID, { emergencia, anamnesis, evolucion, laboratorio, imagenologia, interconsulta });
      
      emergRef.current?.clearAutosave?.();
      anamRef.current?.clearAutosave?.();
      evolRef.current?.clearAutosave?.();
      labRef.current?.clearAutosave?.();
      imagRef.current?.clearAutosave?.();
      interRef.current?.clearAutosave?.();
      alert('Historia clínica guardada exitosamente.');
    } catch {
      /* silently fail */
    } finally {
      setGuardando(false);
    }
  };

  const handleExportarExcelTodo = async () => {
    setExportando(true);
    try {
      const emergencia = emergRef.current?.getDatos?.() ?? {};
      const anamnesis = anamRef.current?.getDatos?.() ?? {};
      const evolucion = evolRef.current?.getDatos?.() ?? {};
      const laboratorio = labRef.current?.getDatos?.() ?? {};
      const imagenologia = imagRef.current?.getDatos?.() ?? {};
      const interconsulta = interRef.current?.getDatos?.() ?? {};
      
      const nombrePaciente = paciente ? `${paciente.primerNombre || ''} ${paciente.primerApellido || ''}`.trim() : undefined;
      await exportarSeccion(PLANTILLA_HC_ID, 'historia-clinica', { emergencia, anamnesis, evolucion, laboratorio, imagenologia, interconsulta }, 'xlsx', nombrePaciente);

      emergRef.current?.clearAutosave?.();
      anamRef.current?.clearAutosave?.();
      evolRef.current?.clearAutosave?.();
      labRef.current?.clearAutosave?.();
      imagRef.current?.clearAutosave?.();
      interRef.current?.clearAutosave?.();
    } catch {
      /* silently fail */
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="data-table-spinner" />
      </div>
    );
  }

  const handleBack = () => {
    const isAnyDirty =
      emergRef.current?.isDirty?.() ||
      anamRef.current?.isDirty?.() ||
      evolRef.current?.isDirty?.() ||
      labRef.current?.isDirty?.() ||
      imagRef.current?.isDirty?.() ||
      interRef.current?.isDirty?.();

    if (isAnyDirty) {
      if (!confirm('Hay cambios sin guardar en la historia clínica. ¿Seguro que quieres salir?')) {
        return;
      }
    }
    router.back();
  };

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
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Historia Clínica</h1>
            <p className="text-xs text-gray-500 font-medium">
              {paciente
                ? `PACIENTE: ${paciente.primerNombre ?? ''} ${paciente.primerApellido ?? ''}`.trim()
                : 'Cargando paciente...'}
            </p>
          </div>
        </div>
      </div>

      {/* Barra superior de acciones */}
      <div className="consentimiento-action-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ccc',
        gap: 8,
        flexShrink: 0,
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a3a5c' }}>
            SNS-MSP/HCU-form.008/2021
          </span>
          <span style={{ fontSize: '10px', color: '#555', marginLeft: 10 }}>
            Historia Clínica / Anamnesis / Evolución / Laboratorio / Imagenología / Interconsulta
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleGuardarTodo}
              disabled={guardando}
              style={{
                background: '#1a3a5c',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {guardando ? 'Guardando...' : '💾 Guardar'}
            </button>
          )}
          <button
              type="button"
              onClick={handleExportarExcelTodo}
              disabled={exportando}
              style={{
                background: '#1e6b2e',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              📊 Descargar Excel
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', borderBottom: '2px solid #000', background: '#e8e8e8', flexShrink: 0 }}>
        {(['EMERGENCIA', 'ANAMNESIS', 'EVOLUCION', 'LABORATORIO', 'IMAGENOLOGIA', 'INTERCONSULTA'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '5px 20px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'Arial, sans-serif',
              border: 'none',
              borderRight: '1px solid #999',
              cursor: 'pointer',
              background: tab === t ? '#fff' : '#d0d0d0',
              borderBottom: tab === t ? '2px solid #fff' : 'none',
              color: '#000',
              marginBottom: tab === t ? -2 : 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Área scrollable con el formulario activo */}
      <div className="form-page-body">
        <div className={isReadOnly ? 'read-only-mode' : ''} inert={isReadOnly ? true : undefined}>
          <div style={{ display: tab === 'EMERGENCIA' ? 'block' : 'none' }}>
          <HistoriaClinicaEmergenciaForm
            ref={emergRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialEmergencia}
            guardando={guardando}
            exportando={exportando}
          />
        </div>
        <div style={{ display: tab === 'ANAMNESIS' ? 'block' : 'none' }}>
          <HistoriaClinicaAnamnesisForm
            ref={anamRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialAnamnesis}
            guardando={guardando}
            exportando={exportando}
          />
        </div>
        <div style={{ display: tab === 'EVOLUCION' ? 'block' : 'none' }}>
          <HistoriaClinicaEvolucionForm
            ref={evolRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialEvolucion}
            guardando={guardando}
            exportando={exportando}
          />
        </div>
        <div style={{ display: tab === 'LABORATORIO' ? 'block' : 'none' }}>
          <HistoriaClinicaLaboratorioForm
            ref={labRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialLaboratorio}
            guardando={guardando}
            exportando={exportando}
          />
        </div>
        <div style={{ display: tab === 'IMAGENOLOGIA' ? 'block' : 'none' }}>
          <HistoriaClinicaImagenologiaForm
            ref={imagRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialImagenologia}
          />
        </div>
        <div style={{ display: tab === 'INTERCONSULTA' ? 'block' : 'none' }}>
          <HistoriaClinicaInterconsultaForm
            ref={interRef}
            atencionId={atencionId ?? undefined}
            paciente={pacienteProps}
            initialData={initialInterconsulta}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
