'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { SearchBar } from '@/components/ui/search-bar';
import { DataTable } from '@/components/ui/data-table';
import { getPacientes } from '@/lib/services/pacientes';
import { getAllExpedientes } from '@/lib/services/categoria-paciente';
import { Link2, ArrowLeft, ChevronDown, X } from 'lucide-react';
import type { Paciente } from '@/types';

interface VincularPacienteModalProps {
  open: boolean;
  onClose: () => void;
  onLink: (pacienteId: number, tipoPaciente: string, diagnostico?: string, expedienteBaseId?: number) => Promise<void>;
}

export function VincularPacienteModal({
  open,
  onClose,
  onLink,
}: VincularPacienteModalProps) {
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
  const [allExpedientes, setAllExpedientes] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expSearch, setExpSearch] = React.useState('');
  const [expDropdownOpen, setExpDropdownOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [linking, setLinking] = React.useState(false);
  
  // Form state
  const [selectedPaciente, setSelectedPaciente] = React.useState<Paciente | null>(null);
  const [tipoPaciente, setTipoPaciente] = React.useState<string>('SPPAT');
  const [reciclar, setReciclar] = React.useState(false);
  const [diagnostico, setDiagnostico] = React.useState('');
  const [expedienteBaseId, setExpedienteBaseId] = React.useState<number | ''>('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getPacientes(), getAllExpedientes()])
        .then(([pacientesData, expedientesData]) => {
          setPacientes(pacientesData);
          setAllExpedientes(expedientesData);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // Reset state on close
      setSelectedPaciente(null);
      setSearchQuery('');
      setReciclar(false);
      setDiagnostico('');
      setExpedienteBaseId('');
      setExpSearch('');
      setExpDropdownOpen(false);
      setError('');
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

  const filteredExpedientes = React.useMemo(() => {
    if (!expSearch) return allExpedientes;
    const q = expSearch.toLowerCase();
    return allExpedientes.filter(exp => {
      const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ').toLowerCase();
      const servicio = exp.categoria?.nombre?.toLowerCase() || '';
      const diag = exp.diagnostico?.toLowerCase() || '';
      return nombres.includes(q) || servicio.includes(q) || diag.includes(q);
    });
  }, [allExpedientes, expSearch]);


  const handleConfirm = async () => {
    if (!selectedPaciente) return;
    if (!reciclar && !diagnostico.trim()) {
      setError('Debe ingresar un diagnóstico o seleccionar reciclar un expediente.');
      return;
    }
    if (reciclar && !expedienteBaseId) {
      setError('Debe seleccionar un expediente base para reciclar.');
      return;
    }

    setLinking(true);
    setError('');
    try {
      await onLink(
        selectedPaciente.id, 
        tipoPaciente, 
        reciclar ? undefined : diagnostico,
        reciclar ? Number(expedienteBaseId) : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al vincular el paciente.');
    } finally {
      setLinking(false);
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
          onClick={() => {
            setSelectedPaciente(row);
            setError('');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-500 rounded-md hover:bg-sky-600 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          Seleccionar
        </button>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Vincular Paciente Existente" className="max-w-3xl">
      <div className="flex flex-col gap-4">
        
        {!selectedPaciente ? (
          <>
            <p className="text-sm text-zinc-500">
              Busque un paciente registrado en el sistema y selecciónelo para vincularlo a este servicio.
            </p>
            <SearchBar
              placeholder="Buscar por cédula, nombre o apellido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full"
            />
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredPacientes}
                loading={loading}
                emptyMessage="No se encontraron pacientes."
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            </div>
          </>
        ) : (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-sky-900">Paciente Seleccionado</h4>
                <p className="text-sm text-sky-700">
                  {selectedPaciente.primerNombre} {selectedPaciente.primerApellido} - CI: {selectedPaciente.cedula}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPaciente(null)}
                className="text-xs font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Cambiar
              </button>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Tipo de Paciente para este servicio <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoPaciente}
                onChange={(e) => setTipoPaciente(e.target.value)}
                className="form-input w-full"
              >
                <option value="SPPAT">SPPAT</option>
                <option value="Particular">Particular</option>
              </select>
            </div>

            <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="reciclarModal" 
                  checked={reciclar}
                  onChange={(e) => setReciclar(e.target.checked)}
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="reciclarModal" className="font-medium text-sm text-zinc-900">
                  ¿Reciclar expediente de otro paciente?
                </label>
              </div>

              {reciclar && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-sky-700">
                    Seleccione el expediente a reciclar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div 
                      className="form-input border-sky-300 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 flex items-center cursor-pointer bg-white h-[38px] px-3 py-0"
                      onClick={() => {
                        setExpDropdownOpen(!expDropdownOpen);
                        if (!expDropdownOpen) setExpSearch('');
                      }}
                    >
                      {expDropdownOpen ? (
                        <input
                          autoFocus
                          type="text"
                          value={expSearch}
                          onChange={(e) => setExpSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Buscar por paciente, servicio o diagnóstico..."
                          className="flex-1 bg-transparent outline-none border-none p-0 text-sm focus:ring-0 h-full w-full placeholder:text-gray-400"
                        />
                      ) : (
                        <span className={`flex-1 text-sm truncate ${!expedienteBaseId ? 'text-gray-500' : 'text-gray-900'}`}>
                          {(() => {
                            if (!expedienteBaseId) return "Buscar expediente...";
                            const exp = allExpedientes.find(e => e.atencion.id === expedienteBaseId);
                            if (!exp) return "Buscar expediente...";
                            const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ');
                            const servicio = exp.categoria?.nombre || 'Desconocido';
                            const diag = exp.diagnostico || 'Sin diagnóstico';
                            return `${nombres} - Servicio: ${servicio} - Dx: ${diag}`;
                          })()}
                        </span>
                      )}
                      {expDropdownOpen && expSearch ? (
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-2" onClick={(e) => { e.stopPropagation(); setExpSearch(''); }} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-2 ${expDropdownOpen ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                    
                    {expDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredExpedientes.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">Sin resultados</div>
                        ) : (
                          filteredExpedientes.map(exp => {
                            const nombres = [exp.paciente?.primerNombre, exp.paciente?.primerApellido].filter(Boolean).join(' ');
                            const servicio = exp.categoria?.nombre || 'Desconocido';
                            const diag = exp.diagnostico || 'Sin diagnóstico';
                            const isSelected = expedienteBaseId === exp.atencion.id;
                            
                            return (
                              <div
                                key={exp.atencion.id}
                                onClick={() => {
                                  setExpedienteBaseId(exp.atencion.id);
                                  setExpSearch('');
                                  setExpDropdownOpen(false);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-50 transition-colors ${isSelected ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700'}`}
                              >
                                <div className="font-medium">{nombres}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Servicio: {servicio} <span className="mx-1">•</span> Dx: {diag}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-sky-700">
                  Diagnóstico { !reciclar && <span className="text-red-500">*</span> }
                </label>
                <input
                  type="text"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder={reciclar ? "El diagnóstico se heredará automáticamente del expediente" : "Ej: Trauma de cráneo"}
                  className="form-input border-sky-300 focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={reciclar}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
              <button type="button" onClick={onClose} className="btn-cancel" disabled={linking}>
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleConfirm} 
                className="btn-submit"
                disabled={linking}
              >
                {linking ? 'Vinculando...' : 'Confirmar Vinculación'}
              </button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
