'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, FileText, Loader2 } from 'lucide-react';
import { searchPacientesGlobal } from '@/lib/services/pacientes';
import { useRouter } from 'next/navigation';

export default function GlobalPacientesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchPacientes = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await searchPacientesGlobal(q);
      setPacientes(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes(debouncedQuery);
  }, [debouncedQuery, fetchPacientes]);

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 overflow-hidden">
      <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Directorio de Pacientes</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Busca y visualiza todos los pacientes registrados en el sistema.
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-auto">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-md leading-5 bg-white placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-colors"
            placeholder="Buscar por nombres, apellidos o número de cédula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : pacientes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-zinc-200 border-dashed">
            <User className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-2 text-sm font-medium text-zinc-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Intenta buscar con otros términos.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Servicios Vinculados
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {pacientes.map((paciente) => {
                    const fullName = [paciente.primerNombre, paciente.segundoNombre, paciente.primerApellido, paciente.segundoApellido]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <tr key={paciente.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center">
                              <span className="text-zinc-600 font-medium text-sm">
                                {paciente.primerNombre?.[0]}{paciente.primerApellido?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-zinc-900">{fullName}</div>
                              <div className="text-sm text-zinc-500">{paciente.edad ? `${paciente.edad} años` : '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-zinc-900">{paciente.cedula || 'No registrada'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {paciente.categorias && paciente.categorias.length > 0 ? (
                              paciente.categorias.map((catPac: any) => (
                                <button
                                  key={catPac.id}
                                  onClick={() => router.push(`/dashboard/atencion/${catPac.id}`)}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                                  title={`Ir al expediente en ${catPac.categoria?.nombre || 'Desconocido'}`}
                                >
                                  {catPac.categoria?.nombre || 'Desconocido'}
                                </button>
                              ))
                            ) : (
                              <span className="text-sm text-zinc-500 italic">Ninguno</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* If we had a generic view, we could link to it here */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
