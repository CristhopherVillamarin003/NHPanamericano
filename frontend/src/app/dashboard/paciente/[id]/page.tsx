'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Calendar, CreditCard, Heart, Tag } from 'lucide-react';
import type { Paciente } from '@/types';
import { getPacienteById } from '@/lib/services/pacientes';

export default function PacienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = Number(params.id);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getPacienteById(pacienteId);
        setPaciente(data);
      } catch {
        setError('No se pudo cargar el paciente');
      } finally {
        setLoading(false);
      }
    }
    if (pacienteId) fetch();
  }, [pacienteId]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="data-table-spinner" />
        <p>Cargando datos del paciente...</p>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="detail-error">
        <p>{error || 'Paciente no encontrado'}</p>
        <button type="button" onClick={() => router.back()} className="btn-cancel">
          Cerrar
        </button>
      </div>
    );
  }

  const fullName = [
    paciente.primerNombre,
    paciente.segundoNombre,
    paciente.primerApellido,
    paciente.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ');

  const fields = [
    {
      icon: User,
      label: 'Nombre Completo',
      value: fullName,
      fullWidth: true,
    },
    {
      icon: CreditCard,
      label: 'Cédula',
      value: paciente.cedula || '—',
    },
    {
      icon: Tag,
      label: 'Tipo de Paciente',
      value: (paciente as any).tipoPaciente || '—',
    },
    {
      icon: Calendar,
      label: 'Fecha de Nacimiento',
      value: paciente.fechaNacimiento
        ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '—',
    },
    {
      icon: Heart,
      label: 'Edad',
      value: paciente.edad != null ? `${paciente.edad} años` : '—',
    },
    {
      icon: User,
      label: 'Sexo',
      value: paciente.sexo || '—',
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: paciente.telefono || '—',
    },
    {
      icon: MapPin,
      label: 'Dirección',
      value: paciente.direccion || '—',
      fullWidth: true,
    },
  ];

  return (
    <div className="detail-page">
      <div className="detail-card">
        {/* Header */}
        <div className="detail-header">
          <button
            type="button"
            onClick={() => router.back()}
            className="detail-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Cerrar
          </button>
          <h1 className="detail-title">Detalle del Paciente</h1>
        </div>

        {/* Avatar / initials */}
        <div className="detail-avatar">
          <span>
            {paciente.primerNombre?.charAt(0)?.toUpperCase()}
            {paciente.primerApellido?.charAt(0)?.toUpperCase()}
          </span>
        </div>

        <h2 className="detail-name">{fullName}</h2>

        {/* Fields */}
        <div className="detail-fields">
          {fields.map((field) => (
            <div key={field.label} className={`detail-field${field.fullWidth ? ' detail-field-full' : ''}`}>
              <div className="detail-field-icon">
                <field.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="detail-field-label">{field.label}</p>
                <p className="detail-field-value">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration date */}
        <div className="detail-footer">
          <p className="text-xs text-zinc-400">
            Registrado el{' '}
            {new Date(paciente.createdAt).toLocaleDateString('es-EC', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
