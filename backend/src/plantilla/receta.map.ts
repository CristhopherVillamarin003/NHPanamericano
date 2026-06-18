// ============================================================
//  MAPEO: plantilla-receta-modificada.docx  ← usar esta versión
//  Estrategia: párrafo por índice (sin tablas)
//
//  La plantilla usa COLUMNAS DE WORD (w:cols num="2"), no tablas.
//  Los párrafos fluyen en una sola lista lineal:
//    • P[0]–P[38]   → Columna IZQUIERDA  (RP)
//    • P[39]–P[76]  → Columna DERECHA    (Indicaciones)
//
//  CAMBIO RESPECTO A LA VERSIÓN ANTERIOR:
//  La plantilla original solo tenía 2 párrafos vacíos en Indicaciones
//  (P[49] y P[50]). Se agregaron 26 párrafos vacíos adicionales
//  clonando el formato del párrafo existente, quedando balanceada
//  con la sección RP que tiene 28 líneas (P[11]–P[38]).
//
//  Para inyectar texto en python-docx:
//    doc.paragraphs[idx].runs[0].text = valor
//    # Si el párrafo no tiene runs, agregar uno:
//    doc.paragraphs[idx].add_run(valor)
//
//  IMPORTANTE: Los párrafos con label (NOMBRE:, EDAD:, etc.)
//  contienen el texto del label en run[0]. El valor del paciente
//  se añade como run adicional o se concatena después del label.
//  Se recomienda agregar un run nuevo en lugar de modificar el label.
// ============================================================

export const ESTRUCTURA = {

    // ════════════════════════════════════════════
    //  COLUMNA IZQUIERDA — datos del paciente (lado RP)
    // ════════════════════════════════════════════

    col_izq: {

        // Párrafos label+valor en la misma línea.
        // El label ya está en run[0]; inyectar el valor como run[1] (nuevo run).
        nombre:      { parrafo: 1,  label: 'NOMBRE: ' },
        cedula:      { parrafo: 2,  label: 'CEDULA DE IDENTIDAD: ' },
        edad:        { parrafo: 3,  label: 'EDAD: ' },
        alergias:    { parrafo: 4,  label: 'ALERGIAS: ' },
        diagnostico: { parrafo: 5,  label: 'DIAGNOSTICO: ' },
        fecha:       { parrafo: 6,  label: 'FECHA: ' },

        // Sección RP — párrafos vacíos donde se escribe la prescripción.
        // P[10] = label "RP:" (no modificar).
        // P[11]–P[38] = 28 líneas vacías disponibles para el contenido de la receta.
        rp_label: { parrafo: 10, tipo: 'LABEL', texto_fijo: 'RP:' },
        rp_contenido: {
            rango_inicio: 11,
            rango_fin: 37,
            descripcion: 'Líneas para escribir la prescripción (RP). 27 líneas disponibles.',
        },
    },

    // ════════════════════════════════════════════
    //  COLUMNA DERECHA — datos del paciente (lado Indicaciones)
    // ════════════════════════════════════════════

    col_der: {

        // Misma estructura que la columna izquierda; datos del mismo paciente
        // (la plantilla duplica los campos para que el médico firme ambas mitades).
        nombre:      { parrafo: 38, label: 'NOMBRE: ' },
        cedula:      { parrafo: 39, label: 'CEDULA DE IDENTIDAD: ' },
        edad:        { parrafo: 40, label: 'EDAD: ' },
        alergias:    { parrafo: 41, label: 'ALERGIAS: ' },
        diagnostico: { parrafo: 42, label: 'DIAGNOSTICO: ' },
        fecha:       { parrafo: 43, label: 'FECHA: ' },

        // Sección Indicaciones — párrafos vacíos donde se escriben las indicaciones.
        // P[47] = label "INDICACIONES" (no modificar).
        // P[48]–P[75] = 28 líneas vacías disponibles.
        indicaciones_label: { parrafo: 47, tipo: 'LABEL', texto_fijo: 'INDICACIONES' },
        indicaciones_contenido: {
            rango_inicio: 48,
            rango_fin: 75,
            descripcion: 'Líneas para escribir las indicaciones médicas. 28 líneas disponibles.',
        },
    },

} as const;

// ============================================================
//  REFERENCIA RÁPIDA — todos los índices de párrafo
// ============================================================
//
//  P[00]  vacío (separador)
//  P[01]  🏷  NOMBRE:                    ← col izq, label
//  P[02]  🏷  CEDULA DE IDENTIDAD:       ← col izq, label
//  P[03]  🏷  EDAD:                      ← col izq, label
//  P[04]  🏷  ALERGIAS:                  ← col izq, label
//  P[05]  🏷  DIAGNOSTICO:               ← col izq, label
//  P[06]  🏷  FECHA:                     ← col izq, label
//  P[07]  vacío
//  P[08]  vacío
//  P[09]  vacío
//  P[10]  🏷  RP:                        ← label fijo, no modificar
//  P[11]  📝  LLENAR (RP línea 1)
//  P[12]  📝  LLENAR (RP línea 2)
//  P[13]  📝  LLENAR (RP línea 3)
//  P[14]  📝  LLENAR (RP línea 4)
//  P[15]  📝  LLENAR (RP línea 5)
//  P[16]  📝  LLENAR (RP línea 6)
//  P[17]  📝  LLENAR (RP línea 7)
//  P[18]  📝  LLENAR (RP línea 8)
//  P[19]  📝  LLENAR (RP línea 9)
//  P[20]  📝  LLENAR (RP línea 10)
//  P[21]  📝  LLENAR (RP línea 11)
//  P[22]  📝  LLENAR (RP línea 12)
//  P[23]  📝  LLENAR (RP línea 13)
//  P[24]  📝  LLENAR (RP línea 14)
//  P[25]  📝  LLENAR (RP línea 15)
//  P[26]  📝  LLENAR (RP línea 16)
//  P[27]  📝  LLENAR (RP línea 17)
//  P[28]  📝  LLENAR (RP línea 18)
//  P[29]  📝  LLENAR (RP línea 19)
//  P[30]  📝  LLENAR (RP línea 20)
//  P[31]  📝  LLENAR (RP línea 21)
//  P[32]  📝  LLENAR (RP línea 22)
//  P[33]  📝  LLENAR (RP línea 23)
//  P[34]  📝  LLENAR (RP línea 24)
//  P[35]  📝  LLENAR (RP línea 25)
//  P[36]  📝  LLENAR (RP línea 26)
//  P[37]  📝  LLENAR (RP línea 27)
//  P[38]  📝  LLENAR (RP línea 28)
//  ── COLUMNA DERECHA ──────────────────────────────────────
//  P[39]  🏷  NOMBRE:                    ← col der, label
//  P[40]  🏷  CEDULA DE IDENTIDAD:       ← col der, label
//  P[41]  🏷  EDAD:                      ← col der, label
//  P[42]  🏷  ALERGIAS:                  ← col der, label
//  P[43]  🏷  DIAGNOSTICO:               ← col der, label
//  P[44]  🏷  FECHA:                     ← col der, label
//  P[45]  vacío
//  P[46]  vacío
//  P[47]  vacío
//  P[48]  🏷  INDICACIONES               ← label fijo, no modificar
//  P[49]  📝  LLENAR (Indicaciones línea 1)
//  P[50]  📝  LLENAR (Indicaciones línea 2)
//  P[51]  📝  LLENAR (Indicaciones línea 3)
//  P[52]  📝  LLENAR (Indicaciones línea 4)
//  P[53]  📝  LLENAR (Indicaciones línea 5)
//  P[54]  📝  LLENAR (Indicaciones línea 6)
//  P[55]  📝  LLENAR (Indicaciones línea 7)
//  P[56]  📝  LLENAR (Indicaciones línea 8)
//  P[57]  📝  LLENAR (Indicaciones línea 9)
//  P[58]  📝  LLENAR (Indicaciones línea 10)
//  P[59]  📝  LLENAR (Indicaciones línea 11)
//  P[60]  📝  LLENAR (Indicaciones línea 12)
//  P[61]  📝  LLENAR (Indicaciones línea 13)
//  P[62]  📝  LLENAR (Indicaciones línea 14)
//  P[63]  📝  LLENAR (Indicaciones línea 15)
//  P[64]  📝  LLENAR (Indicaciones línea 16)
//  P[65]  📝  LLENAR (Indicaciones línea 17)
//  P[66]  📝  LLENAR (Indicaciones línea 18)
//  P[67]  📝  LLENAR (Indicaciones línea 19)
//  P[68]  📝  LLENAR (Indicaciones línea 20)
//  P[69]  📝  LLENAR (Indicaciones línea 21)
//  P[70]  📝  LLENAR (Indicaciones línea 22)
//  P[71]  📝  LLENAR (Indicaciones línea 23)
//  P[72]  📝  LLENAR (Indicaciones línea 24)
//  P[73]  📝  LLENAR (Indicaciones línea 25)
//  P[74]  📝  LLENAR (Indicaciones línea 26)
//  P[75]  📝  LLENAR (Indicaciones línea 27)
//  P[76]  📝  LLENAR (Indicaciones línea 28)
//
// ============================================================
//  LEYENDA:
//  🏷  LABEL  = texto fijo de la plantilla (NO modificar el run existente)
//  📝 LLENAR  = párrafo vacío donde se inyecta el valor
// ============================================================