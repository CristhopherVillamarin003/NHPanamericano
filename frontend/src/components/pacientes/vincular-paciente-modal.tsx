'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { SearchBar } from '@/components/ui/search-bar';
import { DataTable } from '@/components/ui/data-table';
import { getPacientes } from '@/lib/services/pacientes';
import { Link2 } from 'lucide-react';
import type { Paciente } from '@/types';

interface VincularPacienteModalProps {
  open: boolean;
  onClose: () => void;
  onLink: (pacienteId: number, tipoPaciente: string) => Promise<void>;
}

export function VincularPacienteModal({
  open,
  onClose,
  onLink,
}: VincularPacienteModalProps) {
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [linkingId, setLinkingId] = React.useState<number | null>(null);
  const [tipoPaciente, setTipoPaciente] = React.useState<string>('SPPAT');

  React.useEffect(() => {
    if (open) {
      setLoading(true);
      getPacientes()
        .then((data) => {
          setPacientes(data);
        })
        .catch(() => {
          /* silently fail */
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const filteredPacientes = pacientes.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      row.primerNombre?.toLowerCase().includes(query) ||
      row.segundoNombre?.toLowerCase().includes(query) ||
      row.primerApellido?.toLowerCase().includes(query) ||
      row.segundoApellido?.toLowerCase().includes(query) ||
      row.cedula?.includes(query)
    );
  });

  const handleLink = async (id: number) => {
    setLinkingId(id);
    try {
      await onLink(id, tipoPaciente);
      onClose();
    } catch {
      /* handle error silently or show toast */
    } finally {
      setLinkingId(null);
    }
  };

  const columns = [
    { key: 'cedula', header: 'Cédula', sortable: true },
    { key: 'primerNombre', header: 'Primer Nombre', sortable: true },
    { key: 'primerApellido', header: 'Primer Apellido', sortable: true },
    {
      key: 'acciones',
      header: 'Acción',
      render: (row: Paciente) => (
        <button
          type="button"
          onClick={() => handleLink(row.id)}
          disabled={linkingId === row.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 disabled:opacity-50 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          {linkingId === row.id ? 'Vinculando...' : 'Vincular'}
        </button>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Vincular Paciente Existente" className="max-w-3xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500">
          Busque un paciente registrado en otro servicio y vincúlelo a la categoría actual.
        </p>
        
        <SearchBar
          placeholder="Buscar por cédula, nombre o apellido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-full"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Tipo de Paciente para este servicio
          </label>
          <select
            value={tipoPaciente}
            onChange={(e) => setTipoPaciente(e.target.value)}
            className="form-input w-full max-w-xs"
          >
            <option value="SPPAT">SPPAT</option>
            <option value="Particular">Particular</option>
          </select>
        </div>

        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredPacientes}
            loading={loading}
            emptyMessage="No se encontraron pacientes disponibles para vincular."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
