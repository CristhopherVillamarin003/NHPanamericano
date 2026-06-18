'use client';

export default function DashboardPage() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <img
          src="/logo.png"
          alt="Nuevo Hospital Panamericano"
          className="welcome-logo"
        />
        <h1 className="welcome-title">
          BIENVENIDO AL SISTEMA DE GESTIÓN DE HISTORIAS CLÍNICAS
        </h1>
        <div className="welcome-divider" />
        <h2 className="welcome-subtitle">NUEVO HOSPITAL PANAMERICANO</h2>
        <p className="welcome-description">
          Seleccione un servicio en el menú lateral para comenzar a gestionar pacientes.
        </p>
      </div>
    </div>
  );
}
