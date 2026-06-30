'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2, FolderOpen, ChevronDown, X, MoreHorizontal } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Atencion, Consentimiento } from '@/types';
import {
  findOrCreateAtencion,
  createConsentimiento,
  updateConsentimiento,
  deleteConsentimiento,
  upsertSeccion,
  deleteSeccion,
} from '@/lib/services/atencion';
import { getPlantillas, createPlantilla, deletePlantilla } from '@/lib/services/plantillas';
import { CUIDADOS_TEMPLATES } from '@/lib/constants/cuidadosTemplates';

const PLANTILLA_CONSENTIMIENTO_ID = 1; // ID del registro en tabla plantilla
const PLANTILLA_PROTOCOLO_ID = 5; // ID para protocolo
const PLANTILLA_CUIDADO_ID = 7; // ID para cuidados

// Dropdown menu for consentimiento row actions
function ConsentimientoActionsMenu({
  onEdit,
  onDelete,
  hideEdit = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  hideEdit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.top - 4, left: Math.max(0, rect.left - 70) });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="action-btn edit"
        title="Acciones"
        onClick={handleToggle}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="row-actions-dropdown"
          style={{ position: 'fixed', top: coords.top, left: coords.left, transform: 'translateX(-100%)', zIndex: 9999 }}
        >
          {!hideEdit && (
            <button type="button" className="row-action-item" title="Editar nombre" onClick={() => { setOpen(false); onEdit(); }}>
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button type="button" className="row-action-item delete" title="Eliminar" onClick={() => { setOpen(false); onDelete(); }}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function AtencionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaPacienteId = Number(params.categoriaPacienteId);
  const pacienteNombre = searchParams.get('nombre') ?? 'Paciente';
  const categoriaId = searchParams.get('categoriaId');

  const [atencion, setAtencion] = useState<Atencion | null>(null);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [customProtocoloTemplates, setCustomProtocoloTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal crear consentimiento
  const [createOpen, setCreateOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('nuevo');
  const [createLoading, setCreateLoading] = useState(false);

  // Modal crear protocolo
  const [protocoloOpen, setProtocoloOpen] = useState(false);
  const [nuevoProtocoloNombre, setNuevoProtocoloNombre] = useState('');
  const [selectedProtocoloTemplate, setSelectedProtocoloTemplate] = useState('vacio');
  const [protocoloLoading, setProtocoloLoading] = useState(false);

  // Modal crear cuidados
  const [cuidadosOpen, setCuidadosOpen] = useState(false);
  const [selectedCuidadosTemplate, setSelectedCuidadosTemplate] = useState('post-operatorios');
  const [cuidadosLoading, setCuidadosLoading] = useState(false);

  // Searchable dropdown — consentimiento
  const [templateSearch, setTemplateSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allConsentimientoTemplates = [
    { id: 'nuevo', label: 'Nuevo Consentimiento', nombre: 'Nuevo Consentimiento', datos: {}, isCustom: false },
    ...customTemplates.filter(t => !t.esPlantillaFija).map(t => ({ id: t.id.toString(), label: t.nombre, nombre: t.nombre, datos: t.datos, isCustom: true }))
  ];

  const filteredTemplates = allConsentimientoTemplates.filter(t =>
    t.label.toLowerCase().includes(templateSearch.toLowerCase())
  );
  const selectedTemplateLabel = allConsentimientoTemplates.find(t => t.id === selectedTemplate)?.label ?? '';

  // Searchable dropdown — protocolo
  const [protocoloSearch, setProtocoloSearch] = useState('');
  const [protocoloDropdownOpen, setProtocoloDropdownOpen] = useState(false);
  const protocoloDropdownRef = useRef<HTMLDivElement>(null);

  const allProtocoloTemplates = [
    { id: 'vacio', label: 'Protocolo Vacío', nombre: 'Protocolo Vacío', datos: {}, isCustom: false },
    ...customProtocoloTemplates.filter(t => !t.esPlantillaFija).map(t => ({ id: t.id.toString(), label: t.nombre, nombre: t.nombre, datos: t.datos, isCustom: true }))
  ];

  const filteredProtocoloTemplates = allProtocoloTemplates.filter(t =>
    t.label.toLowerCase().includes(protocoloSearch.toLowerCase())
  );
  const selectedProtocoloLabel = allProtocoloTemplates.find(t => t.id === selectedProtocoloTemplate)?.label ?? '';

  // Searchable dropdown — cuidados
  const [cuidadosSearch, setCuidadosSearch] = useState('');
  const [cuidadosDropdownOpen, setCuidadosDropdownOpen] = useState(false);
  const cuidadosDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCuidadosTemplates = CUIDADOS_TEMPLATES.filter(t =>
    t.label.toLowerCase().includes(cuidadosSearch.toLowerCase())
  );
  const selectedCuidadosLabel = CUIDADOS_TEMPLATES.find(t => t.id === selectedCuidadosTemplate)?.label ?? '';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (protocoloDropdownRef.current && !protocoloDropdownRef.current.contains(e.target as Node)) {
        setProtocoloDropdownOpen(false);
      }
      if (cuidadosDropdownRef.current && !cuidadosDropdownRef.current.contains(e.target as Node)) {
        setCuidadosDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal editar nombre
  const [editOpen, setEditOpen] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editTarget, setEditTarget] = useState<Consentimiento | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Modal eliminar consentimiento
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Consentimiento | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal eliminar seccion unica
  const [deleteSeccionTarget, setDeleteSeccionTarget] = useState<string | null>(null);
  const [deleteSeccionLoading, setDeleteSeccionLoading] = useState(false);

  // Modal eliminar plantilla (consentimiento / protocolo)
  const [deletePlantillaTarget, setDeletePlantillaTarget] = useState<string | null>(null);
  const [deletePlantillaLoading, setDeletePlantillaLoading] = useState(false);

  const fetchAtencion = useCallback(async () => {
    setLoading(true);
    try {
      const data = await findOrCreateAtencion(categoriaPacienteId);
      setAtencion(data as any);
      
      const plantillas = await getPlantillas('consentimiento');
      setCustomTemplates(plantillas);

      const plantillasProtocolo = await getPlantillas('protocolo');
      setCustomProtocoloTemplates(plantillasProtocolo);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [categoriaPacienteId]);

  useEffect(() => {
    if (categoriaPacienteId) fetchAtencion();
  }, [categoriaPacienteId, fetchAtencion]);

  const handleCrearConsentimiento = async () => {
    if (!atencion) return;

    const template = allConsentimientoTemplates.find(t => t.id === selectedTemplate);
    const isCustom = selectedTemplate === 'nuevo';
    const nombreFinal = isCustom ? nuevoNombre.trim() : (template?.nombre ?? '');

    setCreateLoading(true);
    try {
      if (isCustom) {
        const nuevaPlantilla = await createPlantilla({
          nombre: nombreFinal,
          seccion: 'consentimiento',
          tipoArchivo: 'xlsx',
          esPlantillaFija: false,
          datos: {}
        });
        setNuevoNombre('');
        setSelectedTemplate('nuevo');
        setCreateOpen(false);
        router.push(`/dashboard/atencion/${categoriaPacienteId}/plantilla/${nuevaPlantilla.id}`);
        return;
      }

      const nuevoCons = await createConsentimiento(atencion.id, PLANTILLA_CONSENTIMIENTO_ID, {
        nombre: nombreFinal,
        ...(template?.datos || {})
      });
      
      // Clear old drafts if any
      const cedula = atencion?.categoriaPaciente?.paciente?.cedula || 'new';
      if (nuevoCons && nuevoCons.id) {
          localStorage.removeItem(`draft_consentimiento_${nuevoCons.id}_${cedula}`);
      }

      setNuevoNombre('');
      setSelectedTemplate('nuevo');
      setCreateOpen(false);
      await fetchAtencion();
    } catch {
      /* silently fail */
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEliminarPlantilla = (plantillaIdStr: string) => {
    setDeletePlantillaTarget(plantillaIdStr);
  };

  const confirmEliminarPlantilla = async () => {
    if (!deletePlantillaTarget) return;
    setDeletePlantillaLoading(true);
    try {
      await deletePlantilla(Number(deletePlantillaTarget));
      if (selectedTemplate === deletePlantillaTarget) {
        setSelectedTemplate('nuevo');
      }
      if (selectedProtocoloTemplate === deletePlantillaTarget) {
        setSelectedProtocoloTemplate('vacio');
      }
      setDeletePlantillaTarget(null);
      await fetchAtencion();
    } catch {
      /* silently fail */
    } finally {
      setDeletePlantillaLoading(false);
    }
  };

  const handleEditarPlantilla = (plantillaIdStr: string) => {
    setCreateOpen(false);
    router.push(`/dashboard/atencion/${categoriaPacienteId}/plantilla/${plantillaIdStr}`);
  };

  const handleCrearProtocolo = async () => {
    if (!atencion) return;

    const template = allProtocoloTemplates.find(t => t.id === selectedProtocoloTemplate);
    const isCustom = selectedProtocoloTemplate === 'vacio';
    const nombreFinal = isCustom ? nuevoProtocoloNombre.trim() : (template?.nombre ?? '');

    setProtocoloLoading(true);
    try {
      if (isCustom) {
        const nuevaPlantilla = await createPlantilla({
          nombre: nombreFinal,
          seccion: 'protocolo',
          tipoArchivo: 'xlsx',
          esPlantillaFija: false,
          datos: {}
        });
        setNuevoProtocoloNombre('');
        setSelectedProtocoloTemplate('vacio');
        setProtocoloOpen(false);
        router.push(`/dashboard/atencion/${categoriaPacienteId}/plantilla/${nuevaPlantilla.id}`);
        return;
      }

      const datosProtocolo: Record<string, any> = {};
      datosProtocolo.nombre = nombreFinal;
      if (template?.datos) {
        Object.entries(template.datos).forEach(([key, val]) => {
            if (key.startsWith('prot_') || key === 'graficos') {
                datosProtocolo[key] = val;
            } else if (key === 'profesionales') {
                (val as any[]).forEach((prof, i) => {
                    datosProtocolo[`prot_prof_nombre_apellidos_${i + 1}`] = prof.nombre_apellidos;
                    datosProtocolo[`prot_prof_especialidad_${i + 1}`] = prof.especialidad;
                    datosProtocolo[`prot_prof_sello_documento_${i + 1}`] = prof.sello_documento;
                });
            } else if (key === 'proced_quirurgico' || key === 'procedimiento_quirurgico_cont' || key === 'dieresis' || key === 'hallazgos_quirurgicos') {
                (val as string[]).forEach((line, i) => {
                    datosProtocolo[`prot_${key}_${i + 1}`] = line;
                });
            } else {
                datosProtocolo[`prot_${key}`] = val;
            }
        });
      }

      await upsertSeccion(atencion.id, 'protocolo', PLANTILLA_PROTOCOLO_ID, datosProtocolo, 'ACTIVO');
      
      // Clear old draft from LocalStorage to ensure new template data isn't overridden
      const cedula = atencion?.categoriaPaciente?.paciente?.cedula || 'new';
      localStorage.removeItem(`draft_protocolo_${atencion.id}_${cedula}`);

      setNuevoProtocoloNombre('');
      setSelectedProtocoloTemplate('vacio');
      setProtocoloOpen(false);
      await fetchAtencion();
      router.push(`/dashboard/atencion/${categoriaPacienteId}/protocolo`);
    } catch {
      /* silently fail */
    } finally {
      setProtocoloLoading(false);
    }
  };

  const handleCrearCuidado = async () => {
    if (!atencion) return;

    const template = CUIDADOS_TEMPLATES.find(t => t.id === selectedCuidadosTemplate);
    
    setCuidadosLoading(true);
    try {
      const html = template?.html || '';
      await upsertSeccion(atencion.id, 'cuidado', PLANTILLA_CUIDADO_ID, { html }, 'ACTIVO');
      
      const cedula = atencion?.categoriaPaciente?.paciente?.cedula || 'new';
      localStorage.removeItem(`draft_cuidados_${cedula}`);

      setCuidadosOpen(false);
      router.push(`/dashboard/atencion/${categoriaPacienteId}/cuidados`);
    } catch {
      /* silently fail */
    } finally {
      setCuidadosLoading(false);
    }
  };

  const handleEditarNombre = async () => {
    if (!editTarget || !editNombre.trim()) return;
    setEditLoading(true);
    try {
      await updateConsentimiento(editTarget.id, {
        ...editTarget.datos,
        nombre: editNombre.trim(),
      });
      setEditOpen(false);
      setEditTarget(null);
      await fetchAtencion();
    } catch {
      /* silently fail */
    } finally {
      setEditLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteConsentimiento(deleteTarget.id);
      
      const cedula = atencion?.categoriaPaciente?.paciente?.cedula || 'new';
      localStorage.removeItem(`draft_consentimiento_${deleteTarget.id}_${cedula}`);

      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchAtencion();
    } catch {
      /* silently fail */
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEliminarSeccion = async () => {
    if (!deleteSeccionTarget || !atencion) return;
    setDeleteSeccionLoading(true);
    try {
      await deleteSeccion(atencion.id, deleteSeccionTarget as any);
      
      const cedula = atencion?.categoriaPaciente?.paciente?.cedula || 'new';
      
      // Eliminamos el draft de la sección si existe
      if (deleteSeccionTarget === 'historia-clinica') {
        localStorage.removeItem(`draft_hc_emergencia_${atencion.id}_${cedula}`);
        localStorage.removeItem(`draft_hc_anamnesis_${atencion.id}_${cedula}`);
        localStorage.removeItem(`draft_hc_evolucion_${atencion.id}_${cedula}`);
        localStorage.removeItem(`draft_hc_laboratorio_${atencion.id}_${cedula}`);
        localStorage.removeItem(`draft_hc_imagenologia_${atencion.id}_${cedula}`);
        localStorage.removeItem(`draft_hc_interconsulta_${atencion.id}_${cedula}`);
      } else {
        localStorage.removeItem(`draft_${deleteSeccionTarget}_${atencion.id}_${cedula}`);
      }

      setDeleteSeccionTarget(null);
      await fetchAtencion();
    } catch {
      /* silently fail */
    } finally {
      setDeleteSeccionLoading(false);
    }
  };

  const handleAbrirFormulario = (consentimiento: Consentimiento) => {
    const url = `/dashboard/atencion/${categoriaPacienteId}/consentimiento/${consentimiento.id}`;
    router.push(url);
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="data-table-spinner" />
        <p>Cargando expediente...</p>
      </div>
    );
  }

  return (
    <div className="atencion-page">
      {/* Header */}
      <div className="atencion-header">
        <div>
          <h1 className="atencion-title">Expediente</h1>
          <p className="atencion-subtitle">{pacienteNombre}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (categoriaId) {
              router.push(`/dashboard/categoria/${categoriaId}`);
            } else {
              router.back();
            }
          }}
          className="detail-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Secciones */}
      <div className="atencion-secciones">

        {/* ── Consentimientos ─────────────────────────────────────── */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Consentimientos</span>
              <span className="seccion-badge">{atencion?.consentimientos?.length ?? 0}</span>
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => { setNuevoNombre(''); setSelectedTemplate('nuevo'); setTemplateSearch(''); setDropdownOpen(false); setCreateOpen(true); }}
            >
              <Plus className="w-4 h-4" />
              Añadir Consentimiento
            </button>
          </div>

          <div className="seccion-items">
            {(!atencion?.consentimientos || atencion.consentimientos.length === 0) && (
              <p className="seccion-empty">No hay consentimientos registrados.</p>
            )}
            {atencion?.consentimientos?.map((c) => (
              <div key={c.id} className="seccion-item">
                <button
                  type="button"
                  className="seccion-item-name"
                  onClick={() => handleAbrirFormulario(c)}
                  title="Abrir formulario"
                >
                  {c.datos?.nombre ?? `Consentimiento #${c.id}`}
                </button>
                <div className="table-actions">
                  <ConsentimientoActionsMenu
                    onEdit={() => {
                      setEditTarget(c);
                      setEditNombre(c.datos?.nombre ?? '');
                      setEditOpen(true);
                    }}
                    onDelete={() => { setDeleteTarget(c); setDeleteOpen(true); }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Otras secciones (próximamente) ──────────────────────── */}
        {/* Historia Clínica — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Historia Clínica</span>
              {atencion?.historiaClinica && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => router.push(`/dashboard/atencion/${categoriaPacienteId}/historia-clinica`)}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.historiaClinica && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  Historia Clínica
                </span>
                <div className="seccion-item-estado">
                  {atencion.historiaClinica.estado !== 'borrador' && (
                    <span className={`estado-badge estado-${atencion.historiaClinica.estado}`}>
                      {atencion.historiaClinica.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Protocolo — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Protocolo</span>
              {atencion?.protocolo && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => {
                if (atencion?.protocolo) {
                  router.push(`/dashboard/atencion/${categoriaPacienteId}/protocolo`);
                } else {
                  setSelectedProtocoloTemplate('vacio');
                  setProtocoloSearch('');
                  setProtocoloDropdownOpen(false);
                  setProtocoloOpen(true);
                }
              }}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.protocolo && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  {atencion.protocolo.datos?.nombre || 'Protocolo'}
                </span>
                <div className="table-actions">
                  <ConsentimientoActionsMenu
                    onEdit={() => {}}
                    onDelete={() => setDeleteSeccionTarget('protocolo')}
                    hideEdit
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cuidados — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Cuidados</span>
              {atencion?.cuidado && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => {
                if (atencion?.cuidado) {
                  router.push(`/dashboard/atencion/${categoriaPacienteId}/cuidados`);
                } else {
                  setSelectedCuidadosTemplate('post-operatorios');
                  setCuidadosSearch('');
                  setCuidadosDropdownOpen(false);
                  setCuidadosOpen(true);
                }
              }}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.cuidado && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  Documento de Cuidados
                </span>
                <div className="table-actions">
                  <ConsentimientoActionsMenu
                    onEdit={() => {}}
                    onDelete={() => setDeleteSeccionTarget('cuidado')}
                    hideEdit
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Epicrisis — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Epicrisis</span>
              {atencion?.epicrisis && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => router.push(`/dashboard/atencion/${categoriaPacienteId}/epicrisis`)}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.epicrisis && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  Epicrisis
                </span>
                <div className="seccion-item-estado">
                  {atencion.epicrisis.estado !== 'borrador' && (
                    <span className={`estado-badge estado-${atencion.epicrisis.estado}`}>
                      {atencion.epicrisis.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Receta — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Receta</span>
              {atencion?.receta && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => router.push(`/dashboard/atencion/${categoriaPacienteId}/receta`)}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.receta && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  Receta Médica
                </span>
                <div className="seccion-item-estado">
                  {atencion.receta.estado !== 'borrador' && (
                    <span className={`estado-badge estado-${atencion.receta.estado}`}>
                      {atencion.receta.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Certificado — habilitada */}
        <div className="seccion-card">
          <div className="seccion-card-header">
            <div className="seccion-card-title">
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Certificado</span>
              {atencion?.certificado && (
                <span className="seccion-badge">1</span>
              )}
            </div>
            <button
              type="button"
              className="btn-create"
              onClick={() => router.push(`/dashboard/atencion/${categoriaPacienteId}/certificado`)}
            >
              <ArrowRight className="w-4 h-4" />
              Ingresar
            </button>
          </div>
          {atencion?.certificado && (
            <div className="seccion-items">
              <div className="seccion-item">
                <span className="seccion-item-name" style={{ cursor: 'default', textDecoration: 'none', color: '#18181b' }}>
                  Certificado Médico
                </span>
                <div className="seccion-item-estado">
                  {atencion.certificado.estado !== 'borrador' && (
                    <span className={`estado-badge estado-${atencion.certificado.estado}`}>
                      {atencion.certificado.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resto de secciones — próximamente */}
        {([] as const).map((seccion) => (
          <div key={seccion} className="seccion-card seccion-card--disabled">
            <div className="seccion-card-header">
              <div className="seccion-card-title">
                <FolderOpen className="w-4 h-4 text-zinc-400" />
                <span>{seccion}</span>
              </div>
              <span className="seccion-proximamente">Próximamente</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear consentimiento */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo Consentimiento"
        className="modal-content--consentimiento"
      >
        <div className="flex flex-col gap-4">
          <div className="form-field">
            <label className="form-label">Tipo de Consentimiento <span className="text-red-500">*</span></label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Search / display input */}
              <div
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0 10px',
                  gap: 6,
                  userSelect: 'none',
                }}
                onClick={() => {
                  setDropdownOpen(prev => !prev);
                  if (!dropdownOpen) setTemplateSearch('');
                }}
              >
                {dropdownOpen ? (
                  <input
                    autoFocus
                    type="text"
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Buscar consentimiento..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      color: 'inherit',
                      padding: '8px 0',
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, padding: '8px 0', fontSize: 'inherit', color: selectedTemplate ? 'inherit' : '#9ca3af' }}>
                    {selectedTemplateLabel || 'Seleccionar tipo...'}
                  </span>
                )}
                {dropdownOpen && templateSearch ? (
                  <X
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); setTemplateSearch(''); }}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <ChevronDown
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                )}
              </div>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {filteredTemplates.length === 0 ? (
                    <div style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 14 }}>
                      Sin resultados
                    </div>
                  ) : (
                    filteredTemplates.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplate(t.id);
                          setTemplateSearch('');
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '9px 14px',
                          cursor: 'pointer',
                          fontSize: 14,
                          background: selectedTemplate === t.id ? '#f0f9ff' : 'transparent',
                          color: selectedTemplate === t.id ? '#0369a1' : '#18181b',
                          fontWeight: selectedTemplate === t.id ? 600 : 400,
                          borderBottom: '1px solid #f4f4f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => { if (selectedTemplate !== t.id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selectedTemplate === t.id ? '#f0f9ff' : 'transparent'; }}
                      >
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.label}
                        </span>
                        {(t as any).isCustom && (
                          <div style={{ display: 'flex' }} onClick={e => e.stopPropagation()}>
                            <ConsentimientoActionsMenu 
                              onEdit={() => handleEditarPlantilla(t.id)}
                              onDelete={() => handleEliminarPlantilla(t.id)}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedTemplate === 'nuevo' && (
            <div className="form-field">
              <label className="form-label">Nombre del consentimiento <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Consentimiento para apendicectomía"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCrearConsentimiento()}
                autoFocus
              />
            </div>
          )}

          <div className="paciente-form-actions">
            <button type="button" className="btn-cancel" onClick={() => setCreateOpen(false)} disabled={createLoading}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleCrearConsentimiento}
              disabled={createLoading || (selectedTemplate === 'nuevo' && !nuevoNombre.trim())}
            >
              {createLoading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal editar nombre */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar nombre">
        <div className="flex flex-col gap-4">
          <div className="form-field">
            <label className="form-label">Nombre del consentimiento</label>
            <input
              type="text"
              className="form-input"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditarNombre()}
              autoFocus
            />
          </div>
          <div className="paciente-form-actions">
            <button type="button" className="btn-cancel" onClick={() => setEditOpen(false)} disabled={editLoading}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleEditarNombre}
              disabled={editLoading || !editNombre.trim()}
            >
              {editLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleEliminar}
        message="¿Está seguro que desea eliminar este consentimiento? Esta acción no se puede deshacer."
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={!!deleteSeccionTarget}
        onClose={() => setDeleteSeccionTarget(null)}
        onConfirm={handleEliminarSeccion}
        message={`¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.`}
        loading={deleteSeccionLoading}
      />

      <ConfirmDialog
        open={!!deletePlantillaTarget}
        onClose={() => setDeletePlantillaTarget(null)}
        onConfirm={confirmEliminarPlantilla}
        message="¿Está seguro que desea eliminar esta plantilla? Esta acción no se puede deshacer."
        loading={deletePlantillaLoading}
      />

      {/* Modal crear protocolo */}
      <Modal
        open={protocoloOpen}
        onClose={() => setProtocoloOpen(false)}
        title="Nuevo Protocolo"
        className="modal-content--consentimiento"
      >
        <div className="flex flex-col gap-4">
          <div className="form-field">
            <label className="form-label">Tipo de Protocolo <span className="text-red-500">*</span></label>
            <div ref={protocoloDropdownRef} style={{ position: 'relative' }}>
              <div
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0 10px',
                  gap: 6,
                  userSelect: 'none',
                }}
                onClick={() => {
                  setProtocoloDropdownOpen(prev => !prev);
                  if (!protocoloDropdownOpen) setProtocoloSearch('');
                }}
              >
                {protocoloDropdownOpen ? (
                  <input
                    autoFocus
                    type="text"
                    value={protocoloSearch}
                    onChange={e => setProtocoloSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Buscar protocolo..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      color: 'inherit',
                      padding: '8px 0',
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, padding: '8px 0', fontSize: 'inherit', color: selectedProtocoloTemplate ? 'inherit' : '#9ca3af' }}>
                    {selectedProtocoloLabel || 'Seleccionar tipo...'}
                  </span>
                )}
                {protocoloDropdownOpen && protocoloSearch ? (
                  <X
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); setProtocoloSearch(''); }}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <ChevronDown
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    style={{ transform: protocoloDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                )}
              </div>

              {protocoloDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {filteredProtocoloTemplates.length === 0 ? (
                    <div style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 14 }}>
                      Sin resultados
                    </div>
                  ) : (
                    filteredProtocoloTemplates.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedProtocoloTemplate(t.id);
                          setProtocoloSearch('');
                          setProtocoloDropdownOpen(false);
                        }}
                        style={{
                          padding: '9px 14px',
                          cursor: 'pointer',
                          fontSize: 14,
                          background: selectedProtocoloTemplate === t.id ? '#f0f9ff' : 'transparent',
                          color: selectedProtocoloTemplate === t.id ? '#0369a1' : '#18181b',
                          fontWeight: selectedProtocoloTemplate === t.id ? 600 : 400,
                          borderBottom: '1px solid #f4f4f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => { if (selectedProtocoloTemplate !== t.id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selectedProtocoloTemplate === t.id ? '#f0f9ff' : 'transparent'; }}
                      >
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.label}
                        </span>
                        {(t as any).isCustom && (
                          <div style={{ display: 'flex' }} onClick={e => e.stopPropagation()}>
                            <ConsentimientoActionsMenu 
                              onEdit={() => handleEditarPlantilla(t.id)}
                              onDelete={() => handleEliminarPlantilla(t.id)}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedProtocoloTemplate === 'vacio' && (
            <div className="form-field">
              <label className="form-label">Nombre del protocolo <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input"
                value={nuevoProtocoloNombre}
                onChange={e => setNuevoProtocoloNombre(e.target.value)}
                placeholder="Ej. Protocolo Colelap"
                autoFocus
              />
            </div>
          )}

          <div className="paciente-form-actions">
            <button type="button" className="btn-cancel" onClick={() => setProtocoloOpen(false)} disabled={protocoloLoading}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleCrearProtocolo}
              disabled={protocoloLoading}
            >
              {protocoloLoading ? 'Creando...' : 'Crear e Ingresar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal crear cuidados */}
      <Modal
        open={cuidadosOpen}
        onClose={() => setCuidadosOpen(false)}
        title="Nuevos Cuidados"
        className="modal-content--consentimiento"
      >
        <div className="flex flex-col gap-4">
          <div className="form-field">
            <label className="form-label">Tipo de Cuidado <span className="text-red-500">*</span></label>
            <div ref={cuidadosDropdownRef} style={{ position: 'relative' }}>
              <div
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0 10px',
                  gap: 6,
                  userSelect: 'none',
                }}
                onClick={() => {
                  setCuidadosDropdownOpen(prev => !prev);
                  if (!cuidadosDropdownOpen) setCuidadosSearch('');
                }}
              >
                {cuidadosDropdownOpen ? (
                  <input
                    autoFocus
                    type="text"
                    value={cuidadosSearch}
                    onChange={e => setCuidadosSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Buscar cuidados..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      color: 'inherit',
                      padding: '8px 0',
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, padding: '8px 0', fontSize: 'inherit', color: selectedCuidadosTemplate ? 'inherit' : '#9ca3af' }}>
                    {selectedCuidadosLabel || 'Seleccionar tipo...'}
                  </span>
                )}
                {cuidadosDropdownOpen && cuidadosSearch ? (
                  <X
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    onClick={e => { e.stopPropagation(); setCuidadosSearch(''); }}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <ChevronDown
                    className="w-4 h-4 text-zinc-400 flex-shrink-0"
                    style={{ transform: cuidadosDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                )}
              </div>

              {cuidadosDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {filteredCuidadosTemplates.length === 0 ? (
                    <div style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 14 }}>
                      Sin resultados
                    </div>
                  ) : (
                    filteredCuidadosTemplates.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedCuidadosTemplate(t.id);
                          setCuidadosSearch('');
                          setCuidadosDropdownOpen(false);
                        }}
                        style={{
                          padding: '9px 14px',
                          cursor: 'pointer',
                          fontSize: 14,
                          background: selectedCuidadosTemplate === t.id ? '#f0f9ff' : 'transparent',
                          color: selectedCuidadosTemplate === t.id ? '#0369a1' : '#18181b',
                          fontWeight: selectedCuidadosTemplate === t.id ? 600 : 400,
                          borderBottom: '1px solid #f4f4f5',
                        }}
                        onMouseEnter={e => { if (selectedCuidadosTemplate !== t.id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selectedCuidadosTemplate === t.id ? '#f0f9ff' : 'transparent'; }}
                      >
                        {t.label}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="paciente-form-actions">
            <button type="button" className="btn-cancel" onClick={() => setCuidadosOpen(false)} disabled={cuidadosLoading}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleCrearCuidado}
              disabled={cuidadosLoading}
            >
              {cuidadosLoading ? 'Creando...' : 'Crear e Ingresar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
