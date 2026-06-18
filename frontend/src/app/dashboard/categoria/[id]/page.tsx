'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye, Plus, Link2, FolderOpen, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchBar } from '@/components/ui/search-bar';
import { PacienteForm } from '@/components/pacientes/paciente-form';
import { VincularPacienteModal } from '@/components/pacientes/vincular-paciente-modal';
import type { Paciente, CategoriaPaciente } from '@/types';
import type { PacienteFormData } from '@/schemas/paciente.schemas';
import { getPacientesByCategoria, addPacienteToCategoria, removePacienteFromCategoria } from '@/lib/services/categoria-paciente';
import { createPaciente, updatePaciente } from '@/lib/services/pacientes';

// Dropdown menu for row actions
function RowActionsMenu({
  row,
  onEdit,
  onDelete,
  onViewDetail,
  onExpediente,
}: {
  row: Paciente & { _recordId?: number };
  onEdit: () => void;
  onDelete: () => void;
  onViewDetail: () => void;
  onExpediente: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.right });
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
          style={{ top: coords.top, left: coords.left, transform: 'translateX(-100%)' }}
        >
          <button type="button" className="row-action-item" title="Editar" onClick={() => { setOpen(false); onEdit(); }}>
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" className="row-action-item delete" title="Eliminar" onClick={() => { setOpen(false); onDelete(); }}>
            <Trash2 className="w-4 h-4" />
          </button>
          <button type="button" className="row-action-item" title="Ver Detalle" onClick={() => { setOpen(false); onViewDetail(); }}>
            <Eye className="w-4 h-4" />
          </button>
          <button type="button" className="row-action-item" title="Expediente" onClick={() => { setOpen(false); onExpediente(); }}>
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function CategoriaPage() {
  const params = useParams();
  const router = useRouter();
  const categoriaId = Number(params.id);

  const [records, setRecords] = useState<CategoriaPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [vincularOpen, setVincularOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPacientesByCategoria(categoriaId);
      setRecords(data);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [categoriaId]);

  useEffect(() => {
    if (categoriaId) fetchRecords();
  }, [categoriaId, fetchRecords]);

  // Create patient
  const handleCreate = async (data: PacienteFormData) => {
    setFormLoading(true);
    setFormError(undefined);
    try {
      const paciente = await createPaciente(data);
      await addPacienteToCategoria(categoriaId, paciente.id);
      setCreateOpen(false);
      await fetchRecords();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setFormError('El paciente ya se encuentra registrado en el sistema');
      } else {
        setFormError('Ocurrió un error al crear el paciente.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleLinkExisting = async (pacienteId: number) => {
    await addPacienteToCategoria(categoriaId, pacienteId);
    await fetchRecords();
  };

  // Edit patient
  const handleEdit = async (data: PacienteFormData) => {
    if (!selectedPaciente) return;
    setFormLoading(true);
    try {
      await updatePaciente(selectedPaciente.id, data);
      setEditOpen(false);
      setSelectedPaciente(null);
      await fetchRecords();
    } catch {
      /* silently fail */
    } finally {
      setFormLoading(false);
    }
  };

  // Delete patient
  const handleDelete = async () => {
    if (selectedRecordId === null || !selectedPaciente) return;
    setFormLoading(true);
    try {
      await removePacienteFromCategoria(selectedRecordId);
      setDeleteOpen(false);
      setSelectedPaciente(null);
      setSelectedRecordId(null);
      await fetchRecords();
    } catch {
      /* silently fail */
    } finally {
      setFormLoading(false);
    }
  };

  // View detail
  const handleViewDetail = (id: number) => {
    router.push(`/dashboard/paciente/${id}`);
  };

  const handleAbrirExpediente = (recordId: number, paciente: Paciente) => {
    const nombre = [paciente.primerNombre, paciente.primerApellido].filter(Boolean).join(' ');
    router.push(`/dashboard/atencion/${recordId}?nombre=${encodeURIComponent(nombre)}&categoriaId=${categoriaId}`);
  };

  const columns = [
    {
      key: 'paciente',
      header: 'Paciente',
      render: (row: Paciente) => {
        const updatedAtLabel = (row as any)._vinculadoAt
          ? new Date((row as any)._vinculadoAt).toLocaleDateString('es-EC')
          : '—';
        const tipo = row.tipoPaciente?.trim() ? row.tipoPaciente : '—';
        const nombres = [
          row.primerNombre,
          row.segundoNombre,
          row.primerApellido,
          row.segundoApellido,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div className="flex flex-col">
            <div className="text-xs text-zinc-500">
              {updatedAtLabel} {' '}
              {tipo}
            </div>
            <div className="font-medium text-zinc-900">{nombres}</div>
            <div className="text-sm text-zinc-600">{row.cedula || '—'}</div>
          </div>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row: Paciente & { _recordId?: number }) => (
        <RowActionsMenu
          row={row}
          onEdit={() => { setSelectedPaciente(row); setEditOpen(true); }}
          onDelete={() => { setSelectedPaciente(row); setSelectedRecordId(row._recordId ?? null); setDeleteOpen(true); }}
          onViewDetail={() => handleViewDetail(row.id)}
          onExpediente={() => handleAbrirExpediente(row._recordId ?? 0, row)}
        />
      ),
    },
  ];

  // Map records to flat rows with _recordId for deletion
  const rows = records.map((r) => ({
    ...r.paciente,
    _recordId: r.id,
    _vinculadoAt: r.createdAt,
  }));

  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const fullName = [
      row.primerNombre,
      row.segundoNombre,
      row.primerApellido,
      row.segundoApellido,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const createdAtText = (row as any)._vinculadoAt
      ? new Date((row as any)._vinculadoAt).toLocaleDateString('es-EC').toLowerCase()
      : '';

    return (
      fullName.includes(query) ||
      row.primerNombre?.toLowerCase().includes(query) ||
      row.segundoNombre?.toLowerCase().includes(query) ||
      row.primerApellido?.toLowerCase().includes(query) ||
      row.segundoApellido?.toLowerCase().includes(query) ||
      row.cedula?.includes(query) ||
      row.tipoPaciente?.toLowerCase().includes(query) ||
      row.sexo?.toLowerCase().includes(query) ||
      row.telefono?.includes(query) ||
      row.direccion?.toLowerCase().includes(query) ||
      createdAtText.includes(query)
    );
  });

  return (
    <div className="categoria-page">
      <div className="categoria-header">
        <h1 className="categoria-title">Pacientes del Servicio</h1>
        <div className="flex items-center gap-4">
          <SearchBar 
            placeholder="Buscar paciente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn-create bg-sky-500 hover:bg-sky-600 text-white"
            onClick={() => setVincularOpen(true)}
          >
            <Link2 className="w-4 h-4" />
            Vincular
          </button>
          <button
            type="button"
            className="btn-create"
            onClick={() => {
              setFormError(undefined);
              setCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Crear
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredRows} loading={loading} />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear Paciente">
        <PacienteForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={formLoading}
          errorMessage={formError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelectedPaciente(null); }} title="Editar Paciente">
        {selectedPaciente && (
          <PacienteForm
            defaultValues={selectedPaciente}
            onSubmit={handleEdit}
            onCancel={() => { setEditOpen(false); setSelectedPaciente(null); }}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedPaciente(null); setSelectedRecordId(null); }}
        onConfirm={handleDelete}
        message="¿Está seguro que desea remover a este paciente del servicio actual? El paciente no será eliminado del sistema."
        loading={formLoading}
      />

      {/* Vincular Modal */}
      <VincularPacienteModal
        open={vincularOpen}
        onClose={() => setVincularOpen(false)}
        onLink={handleLinkExisting}
        excludePacienteIds={rows.map((r) => r.id)}
      />
    </div>
  );
}
