/**
 * Mapeo de posiciones — Plantilla MSP
 * Archivo:  plantilla-certificado.docx
 *
 * ═══════════════════════════════════════════════════════════════════
 * ESTRATEGIA: Reemplazo de RUN específico dentro de cada párrafo
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este documento no usa celdas vacías para datos. Los campos a llenar
 * son espacios en blanco (runs de espacios) o párrafos vacíos dentro
 * de celdas de tabla.
 *
 * CÓMO INYECTAR EN NESTJS (python-docx):
 *
 *   // Párrafos normales — reemplazar run de espacios con el valor:
 *   doc.paragraphs[parrafo].runs[run].text = valor
 *
 *   // Celdas de tabla — agregar run al párrafo vacío de la celda:
 *   celda = doc.tables[tabla].rows[fila].cells[celda_idx]
 *   celda.paragraphs[parrafo_en_celda].add_run(valor)
 *
 * CAMPOS AUTO (desde hospital.paciente / hospital.usuario / atencion):
 *   nombre_paciente     ← paciente.primer_nombre + apellidos
 *   cedula_paciente     ← paciente.cedula
 *   nombre_doctor       ← usuario.nombres + apellidos (con DR./DRA.)
 *   especialidad_doctor ← usuario.especialidad
 *   ci_doctor           ← usuario.cedula
 *   correo_doctor       ← usuario.email
 * ═══════════════════════════════════════════════════════════════════
 */

export interface PosicionRun {
  parrafo: number;
  run: number;
  descripcion: string;
  ejemplo?: string;
  /** Espacio al inicio del valor inyectado (default: false) */
  espacioInicio?: boolean;
  /** Espacio al final del valor inyectado (default: false) */
  espacioFin?: boolean;
  /** Aplicar negrita al valor inyectado (default: false) */
  negrita?: boolean;
  /** Forzar sin negrita aunque el run original la tenga (default: false) */
  sinNegrita?: boolean;
}

export interface PosicionCelda {
  tabla: number;
  fila: number;
  celda: number;
  parrafo_en_celda: number;
  descripcion: string;
  ejemplo?: string;
  /** Aplicar negrita al valor inyectado (default: false) */
  negrita?: boolean;
}

export const MAPEO_CERTIFICADO = {

  // ═══════════════════════════════════════════════════════════════════
  // P[00] — Fecha del certificado
  // run[0] = 'Quito, 24 DE MAYO del 2026' → reemplazar completo
  // ═══════════════════════════════════════════════════════════════════
  fecha_certificado: {
    parrafo: 0,
    run: 0,
    descripcion: "Fecha de emisión del certificado",
    ejemplo: "Quito, 24 DE MAYO del 2026",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[03] — "Certifico que el paciente ___ portador de la cedula ___"
  //
  // runs del párrafo:
  //   run[0] = 'Certifico que el paciente'  ← FIJO
  //   run[1] = '                         '  ← ✅ NOMBRE PACIENTE
  //   run[2] = ' '                          ← FIJO
  //   run[3] = 'portador de la cedula de identidad' ← FIJO
  //   run[4] = '               '            ← ✅ CÉDULA PACIENTE
  //   run[5] = '  '                         ← FIJO
  //   run[6] = ','                          ← FIJO
  //   run[7] = ' '                          ← FIJO
  //   run[8] = 'fue atendido en esta casa de salud:' ← FIJO
  // ═══════════════════════════════════════════════════════════════════
  nombre_paciente: {
    parrafo: 3,
    run: 1,
    espacioInicio: true,
    espacioFin: false,
    negrita: true,
    descripcion: "Nombre completo del paciente (reemplaza los espacios del run)",
    ejemplo: " TAPIA DOMINGUEZ GABRIELA JACQUELINE ",
  } as PosicionRun,

  cedula_paciente: {
    parrafo: 3,
    run: 4,
    espacioInicio: true,
    espacioFin: false,
    negrita: true,
    descripcion: "Cédula de identidad del paciente (reemplaza los espacios del run)",
    ejemplo: "1720358876",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[05] — "PACIENTE REQUIERE REPOSO MEDICO ABSOLUTO DE ___ DIAS"
  //
  // runs del párrafo:
  //   run[0] = 'PACIENTE REQUIERE REPOSO MEDICO ABSOLUTO DE' ← FIJO
  //   run[1] = '        '  ← ✅ DÍAS EN NÚMERO Y LETRAS
  //   run[2] = ' DIAS '    ← FIJO
  //
  // Valor a inyectar: número y letras → "10 (DIEZ)"
  // ═══════════════════════════════════════════════════════════════════
  dias_reposo_letras: {
    parrafo: 5,
    run: 1,
    espacioInicio: true,
    espacioFin: false,
    descripcion: "Días de reposo en número y letras generado automáticamente",
    ejemplo: "10 (DIEZ)",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[06] — "DESDE EL DÍA: ___"
  //
  // runs del párrafo:
  //   run[0] = 'DESDE EL D'  ← FIJO (fragmento por encoding UTF-8)
  //   run[1] = 'Í'           ← FIJO
  //   run[2] = 'A'           ← FIJO
  //   run[3] = ':'           ← FIJO
  //   run[4] = ' '           ← ✅ FECHA INICIO (reemplazar el espacio)
  //
  // Valor: " VEINTE Y CUATRO DE MAYO DEL DOS MIL VEINTE Y SEIS (24/05/2026) "
  // ═══════════════════════════════════════════════════════════════════
  desde_fecha_letras: {
    parrafo: 6,
    run: 4,
    espacioInicio: true,
    espacioFin: false,
    sinNegrita: true,
    descripcion: "Fecha inicio del reposo en letras y formato corto (reemplaza el espacio)",
    ejemplo: " VEINTE Y CUATRO DE MAYO DEL DOS MIL VEINTE Y SEIS (24/05/2026) ",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[07] — "HASTA EL DÍA: ___"
  //
  // runs del párrafo:
  //   run[0] = 'HASTA EL'  ← FIJO
  //   run[1] = ' DÍA: '   ← FIJO
  //   run[2] = ' '         ← ✅ FECHA FIN (reemplazar el espacio)
  // ═══════════════════════════════════════════════════════════════════
  hasta_fecha_letras: {
    parrafo: 7,
    run: 2,
    espacioInicio: true,
    espacioFin: false,
    sinNegrita: true,
    descripcion: "Fecha fin del reposo en letras y formato corto (reemplaza el espacio)",
    ejemplo: " DOS DE JUNIO DEL DOS MIL VEINTE Y SEIS (02/06/2026).",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[16] — Nombre del doctor
  // run[0] = 'DR. JOSE SANTIAGO CAMPUZANO TUBAY' → reemplazar completo
  // ═══════════════════════════════════════════════════════════════════
  nombre_doctor: {
    parrafo: 16,
    run: 0,
    descripcion: "Nombre completo del doctor con título (DR./DRA.)",
    ejemplo: "DR. JOSE SANTIAGO CAMPUZANO TUBAY",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[17] — Especialidad del doctor
  // ═══════════════════════════════════════════════════════════════════
  especialidad_doctor: {
    parrafo: 17,
    run: 0,
    descripcion: "Especialidad médica del doctor",
    ejemplo: "CIRUGIA GENERAL Y LAPAROSCOPICA",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[18] — Cédula del doctor
  // run[0] = 'CI: 1305173237' → reemplazar incluyendo el label
  // ═══════════════════════════════════════════════════════════════════
  ci_doctor: {
    parrafo: 18,
    run: 0,
    descripcion: "Cédula del doctor con label 'CI: ' incluido",
    ejemplo: "CI: 1305173237",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // P[19] — Correo electrónico del doctor
  // run[0] = ' ' (solo un espacio) → reemplazar con el correo
  // Si falla: doc.paragraphs[19].add_run(correo)
  // ═══════════════════════════════════════════════════════════════════
  correo_doctor: {
    parrafo: 19,
    run: 0,
    descripcion: "Correo electrónico institucional del doctor",
    ejemplo: "nhpanamericano.vlc@gmail.com",
  } as PosicionRun,

  // ═══════════════════════════════════════════════════════════════════
  // TABLA [0] — Campos clínicos
  // celda[0] = labels (FIJO) | celda[1] = valores (LLENAR)
  //
  // Para inyectar en celda vacía:
  //   celda = doc.tables[0].rows[fila].cells[1]
  //   celda.paragraphs[parrafo_en_celda].add_run(valor)
  // ═══════════════════════════════════════════════════════════════════

  tabla: {

    // Fila [0] — Casa de salud
    casa_de_salud: {
      tabla: 0, fila: 0, celda: 1, parrafo_en_celda: 0,
      descripcion: "Nombre del establecimiento de salud",
      ejemplo: "NUEVO HOSPITAL PANAMERICANO – VALECAM",
    } as PosicionCelda,

    // Fila [1] — Fechas + historia clínica
    // celda[1] tiene 6 párrafos vacíos alineados con los labels de celda[0]
    fecha_ingreso: {
      tabla: 0, fila: 1, celda: 1, parrafo_en_celda: 0,
      descripcion: "Fecha de ingreso del paciente",
      ejemplo: "VEINTE Y TRES DE MAYO DEL DOS MIL VEINTE Y SEIS (23/05/2026)",
    } as PosicionCelda,

    fecha_procedimiento: {
      tabla: 0, fila: 1, celda: 1, parrafo_en_celda: 1,
      descripcion: "Fecha del procedimiento médico o quirúrgico",
      ejemplo: "VEINTE Y TRES DE MAYO DEL DOS MIL VEINTE Y SEIS (23/05/2026)",
    } as PosicionCelda,

    fecha_alta: {
      tabla: 0, fila: 1, celda: 1, parrafo_en_celda: 2,
      descripcion: "Fecha de alta del paciente",
      ejemplo: "VEINTE Y CUATRO DE MAYO DEL DOS MIL VEINTE Y SEIS (24/05/2026)",
    } as PosicionCelda,

    numero_historia: {
      tabla: 0, fila: 1, celda: 1, parrafo_en_celda: 4,
      negrita: true,
      descripcion: "Número de historia clínica del paciente (auto desde BD)",
      ejemplo: "1720358876",
    } as PosicionCelda,

    // Fila [2] — Servicio
    servicio: {
      tabla: 0, fila: 2, celda: 1, parrafo_en_celda: 0,
      descripcion: "Servicio o área médica de atención",
      ejemplo: "CIRUGIA GENERAL",
    } as PosicionCelda,

    // Fila [3] — Procedimiento (celda[1] tiene 2 párrafos, usar párrafo[0])
    procedimiento: {
      tabla: 0, fila: 3, celda: 1, parrafo_en_celda: 0,
      descripcion: "Nombre del procedimiento médico o quirúrgico realizado",
      ejemplo: "HERNIOPLASTIA UMBILICAL",
    } as PosicionCelda,

    // Fila [4] — Diagnóstico y datos adicionales
    // celda[1] tiene 12 párrafos vacíos alineados con los labels de celda[0]:
    //   p[0]  → DIAGNOSTICO
    //   p[1]  → CODIGO DE DIAGNOSTICO (CIE10)
    //   p[2]  → vacío separador
    //   p[3]  → CUADRO CLINICO
    //   p[4]  → vacío separador
    //   p[5]  → TIPO DE CONTINGENCIA
    //   p[6]  → vacío separador
    //   p[7]  → DIRECCION
    //   p[8]  → vacío separador
    //   p[9]  → TELEFONO DEL PACIENTE
    //   p[10] → vacío separador
    //   p[11] → INSTITUCIÓN/EMPRESA
    diagnostico: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 0,
      negrita: true,
      descripcion: "Diagnóstico principal del paciente",
      ejemplo: "HERNIA UMBILICAL CON OBSTRUCCIÓN, SIN GANGRENA",
    } as PosicionCelda,

    codigo_cie10: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 1,
      negrita: true,
      descripcion: "Código CIE10 del diagnóstico",
      ejemplo: "K420",
    } as PosicionCelda,

    cuadro_clinico: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 3,
      descripcion: "Descripción del cuadro clínico del paciente (texto libre)",
      ejemplo: "PACIENTE CON DOLOR EN REGIÓN UMBILICAL DE 3 DÍAS DE EVOLUCIÓN",
    } as PosicionCelda,

    tipo_contingencia: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 5,
      descripcion: "Tipo de contingencia (ENFERMEDAD / ACCIDENTE / MATERNIDAD)",
      ejemplo: "ENFERMEDAD",
    } as PosicionCelda,

    direccion_paciente: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 7,
      descripcion: "Dirección de domicilio del paciente",
      ejemplo: "Av. Amazonas y Naciones Unidas, Quito",
    } as PosicionCelda,

    telefono_paciente: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 9,
      descripcion: "Número de teléfono del paciente",
      ejemplo: "0999123456",
    } as PosicionCelda,

    institucion_empresa: {
      tabla: 0, fila: 4, celda: 1, parrafo_en_celda: 11,
      descripcion: "Institución o empresa donde trabaja el paciente",
      ejemplo: "MINISTERIO DE EDUCACIÓN",
    } as PosicionCelda,

    // Fila [5] — Ocupación/cargo (celda[1] tiene 2 párrafos, usar párrafo[0])
    ocupacion: {
      tabla: 0, fila: 5, celda: 1, parrafo_en_celda: 0,
      descripcion: "Ocupación o cargo del paciente",
      ejemplo: "ESTUDIANTE",
    } as PosicionCelda,
  },

} as const;

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCIA RÁPIDA — estructura del documento
// ═══════════════════════════════════════════════════════════════════════════
//
//  P[00]  📝 fecha_certificado          run[0] → "Quito, 24 DE MAYO del 2026"
//  P[01]  🔒 CERTIFICADO MÉDICO         (título fijo)
//  P[02]  —  vacío
//  P[03]  📝 nombre_paciente [run 1]    espacios → nombre completo
//         📝 cedula_paciente [run 4]    espacios → cédula
//  P[04]  —  vacío
//  P[05]  📝 dias_reposo     [run 1]    espacios → "10 (DIEZ)"
//  P[06]  📝 desde_fecha     [run 4]    espacio  → fecha inicio en letras
//  P[07]  📝 hasta_fecha     [run 2]    espacio  → fecha fin en letras
//  P[08]  🔒 PARA LOS FINES...          (texto fijo)
//  P[09]  🔒 Atentamente:               (texto fijo)
//  P[10–15] — vacíos (espacio para firma física)
//  P[16]  📝 nombre_doctor              run[0] → nombre con título
//  P[17]  📝 especialidad_doctor        run[0] → especialidad
//  P[18]  📝 ci_doctor                  run[0] → "CI: 1234567890"
//  P[19]  📝 correo_doctor              run[0] → correo electrónico
//
//  TABLA[0] celda[1]:
//  Fila[0] p[0]  → 📝 casa_de_salud
//  Fila[1] p[0]  → 📝 fecha_ingreso
//          p[1]  → 📝 fecha_procedimiento
//          p[2]  → 📝 fecha_alta
//          p[4]  → 📝 numero_historia
//  Fila[2] p[0]  → 📝 servicio
//  Fila[3] p[0]  → 📝 procedimiento
//  Fila[4] p[0]  → 📝 diagnostico
//          p[1]  → 📝 codigo_cie10
//          p[3]  → 📝 cuadro_clinico
//          p[5]  → 📝 tipo_contingencia
//          p[7]  → 📝 direccion_paciente
//          p[9]  → 📝 telefono_paciente
//          p[11] → 📝 institucion_empresa
//  Fila[5] p[0]  → 📝 ocupacion
//
// ═══════════════════════════════════════════════════════════════════════════
// LEYENDA:
//  📝 INYECTAR = reemplazar run.text o add_run() con el valor del campo
//  🔒 FIJO     = texto de la plantilla, NO modificar
//  —  VACÍO    = párrafo separador, NO modificar
// ═══════════════════════════════════════════════════════════════════════════