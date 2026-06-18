/**
 * Mapa de celdas para la plantilla de Consentimiento Informado (MSP)
 * Cada clave es el nombre del campo en el JSONB de datos.
 * El valor indica { hoja, celda } donde se escribe en el .xlsx.
 */
export const CONSENTIMIENTO_MAP: Record<string, { sheet: string; cell: string }> = {
  // ── HOJA ANVERSO ──────────────────────────────────────────────────────────
  // A. Datos del establecimiento
  institucion:                    { sheet: 'ANVERSO', cell: 'A4'  },
  establecimiento:                { sheet: 'ANVERSO', cell: 'P4'  },
  numero_historia_clinica:        { sheet: 'ANVERSO', cell: 'AK4' },
  numero_archivo:                 { sheet: 'ANVERSO', cell: 'BC4' },

  // Datos del paciente (fila 7)
  primer_apellido:                { sheet: 'ANVERSO', cell: 'A7'  },
  segundo_apellido:               { sheet: 'ANVERSO', cell: 'R7'  },
  primer_nombre:                  { sheet: 'ANVERSO', cell: 'AF7' },
  segundo_nombre:                 { sheet: 'ANVERSO', cell: 'AP7' },
  sexo:                           { sheet: 'ANVERSO', cell: 'BA7' },
  edad:                           { sheet: 'ANVERSO', cell: 'BD7' },
  condicion_edad_horas:           { sheet: 'ANVERSO', cell: 'BH7' },
  condicion_edad_dias:            { sheet: 'ANVERSO', cell: 'BJ7' },
  condicion_edad_meses:           { sheet: 'ANVERSO', cell: 'BL7' },
  condicion_edad_anios:           { sheet: 'ANVERSO', cell: 'BN7' },

  // B. Consentimiento informado
  consentimiento_para:            { sheet: 'ANVERSO', cell: 'S10' },
  servicio:                       { sheet: 'ANVERSO', cell: 'G11' },
  tipo_atencion_ambulatorio:      { sheet: 'ANVERSO', cell: 'AZ11' },
  tipo_atencion_hospitalizacion:  { sheet: 'ANVERSO', cell: 'BM11' },
  diagnostico:                    { sheet: 'ANVERSO', cell: 'I12' },
  cie10:                          { sheet: 'ANVERSO', cell: 'BE12' },
  nombre_procedimiento:           { sheet: 'ANVERSO', cell: 'X13' },
  en_que_consiste:                { sheet: 'ANVERSO', cell: 'L14' },
  en_que_consiste_cont:           { sheet: 'ANVERSO', cell: 'A15' },
  como_se_realiza:                { sheet: 'ANVERSO', cell: 'L16' },
  como_se_realiza_cont:           { sheet: 'ANVERSO', cell: 'A17' },
  duracion_estimada:              { sheet: 'ANVERSO', cell: 'V35' },
  beneficios:                     { sheet: 'ANVERSO', cell: 'V36' },
  riesgos_frecuentes:             { sheet: 'ANVERSO', cell: 'V37' },
  riesgos_graves:                 { sheet: 'ANVERSO', cell: 'V38' },
  riesgos_especificos:            { sheet: 'ANVERSO', cell: 'A40' },
  riesgos_especificos_cont:       { sheet: 'ANVERSO', cell: 'A41' },
  alternativas:                   { sheet: 'ANVERSO', cell: 'V42' },
  manejo_posterior:               { sheet: 'ANVERSO', cell: 'V43' },
  consecuencias_si_no:            { sheet: 'ANVERSO', cell: 'V44' },

  // ── HOJA REVERSO ──────────────────────────────────────────────────────────
  // C. Declaración de consentimiento
  texto_legal_c:                  { sheet: 'REVERSO', cell: 'A3'  },
  fecha_consentimiento:           { sheet: 'REVERSO', cell: 'L2'  },
  hora_consentimiento:            { sheet: 'REVERSO', cell: 'AY2' },
  nombre_paciente_firma:          { sheet: 'REVERSO', cell: 'A11' },
  cedula_paciente_firma:          { sheet: 'REVERSO', cell: 'AG11' },
  firma_paciente:                 { sheet: 'REVERSO', cell: 'AX11' },
  nombre_profesional:             { sheet: 'REVERSO', cell: 'A14' },
  firma_profesional:              { sheet: 'REVERSO', cell: 'AF14' },
  nombre_representante_c:         { sheet: 'REVERSO', cell: 'A20' },
  cedula_representante_c:         { sheet: 'REVERSO', cell: 'AG20' },
  firma_representante_c:          { sheet: 'REVERSO', cell: 'AX20' },
  parentesco_c:                   { sheet: 'REVERSO', cell: 'A23' },

  // D. Negativa del consentimiento
  texto_legal_d:                  { sheet: 'REVERSO', cell: 'A29' },
  fecha_negativa:                 { sheet: 'REVERSO', cell: 'L28' },
  nombre_paciente_negativa:       { sheet: 'REVERSO', cell: 'A33' },
  cedula_paciente_negativa:       { sheet: 'REVERSO', cell: 'AG33' },
  firma_paciente_negativa:        { sheet: 'REVERSO', cell: 'AX33' },
  nombre_profesional_neg:         { sheet: 'REVERSO', cell: 'A36' },
  firma_profesional_neg:          { sheet: 'REVERSO', cell: 'AF36' },
  nombre_representante_d:         { sheet: 'REVERSO', cell: 'A42' },
  cedula_representante_d:         { sheet: 'REVERSO', cell: 'AG42' },
  firma_representante_d:          { sheet: 'REVERSO', cell: 'AX42' },
  parentesco_d:                   { sheet: 'REVERSO', cell: 'A45' },

  // Testigo
  nombre_testigo:                 { sheet: 'REVERSO', cell: 'A50' },
  cedula_testigo:                 { sheet: 'REVERSO', cell: 'AG50' },
  firma_testigo:                  { sheet: 'REVERSO', cell: 'AX50' },

  // E. Revocatoria del consentimiento
  texto_legal_e:                  { sheet: 'REVERSO', cell: 'A55' },
  nombre_paciente_rev:            { sheet: 'REVERSO', cell: 'A59' },
  cedula_paciente_rev:            { sheet: 'REVERSO', cell: 'AG59' },
  firma_paciente_rev:             { sheet: 'REVERSO', cell: 'AX59' },
  nombre_profesional_rev:         { sheet: 'REVERSO', cell: 'A62' },
  firma_profesional_rev:          { sheet: 'REVERSO', cell: 'AF62' },
  nombre_representante_e:         { sheet: 'REVERSO', cell: 'A68' },
  cedula_representante_e:         { sheet: 'REVERSO', cell: 'AG68' },
  firma_representante_e:          { sheet: 'REVERSO', cell: 'AX68' },
  parentesco_e:                   { sheet: 'REVERSO', cell: 'A71' },
};
