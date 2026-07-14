import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HTMLtoDOCX = require('html-to-docx');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const JSZip = require('jszip');

/**
 * Preprocesa el HTML antes de pasarlo a html-to-docx:
 * 1. Elimina &quot; dentro de atributos style (html-to-docx no decodifica entidades en CSS inline,
 *    lo que causa que font-family: &quot;Times New Roman&quot; se escriba como &quot en el DOCX).
 *    CSS acepta font-family sin comillas: font-family: Times New Roman
 */
function prepareHtmlForDocx(html: string): string {
  return html.replace(/style="([^"]*)"/g, (_match, styleContent: string) => {
    const fixed = styleContent.replace(/&quot;/g, '');
    return `style="${fixed}"`;
  });
}

/**
 * Postprocesa el buffer DOCX para agregar w:szCs donde falta.
 * html-to-docx solo escribe w:sz pero no w:szCs; Word usa w:szCs para determinar
 * el tamaño real en muchos contextos, sin él muestra el tamaño del estilo base.
 */
async function addSzCsToDocx(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);
  const docXml: string = await zip.file('word/document.xml').async('string');

  // Insertar w:szCs con el mismo valor justo después de cada w:sz que no tenga ya w:szCs
  const fixed = docXml.replace(
    /(<w:sz w:val="(\d+)"\/>\s*)(?!<w:szCs)/g,
    (_match: string, szTag: string, val: string) => `${szTag}<w:szCs w:val="${val}"/>`,
  );

  zip.file('word/document.xml', fixed);
  const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return Buffer.from(out);
}
import { CONSENTIMIENTO_MAP } from './consentimiento.map';
import { HISTORIA_CLINICA_MAP } from './historia-clinica.map';
import { MAPEO_006_EPICRISIS } from './epicrisis.map';
import { ESTRUCTURA as RECETA_MAP } from './receta.map';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { HISTORIA_CLINICA_ANAMNESIS_MAP } from './historia-clinica-anamnesis.map';
import { HISTORIA_CLINICA_EVOLUCION_MAP } from './historia-clinica-evolucion.map';
import { HISTORIA_CLINICA_LABORATORIO_MAP } from './historia-clinica-laboratorio.map';
import { HISTORIA_CLINICA_IMAGENOLOGIA_MAP } from './historia-clinica-imagenologia.map';
import { HISTORIA_CLINICA_INTERCONSULTA_MAP } from './historia-clinica-interconsulta.map';
import { PROTOCOLO_MAP } from './protocolo.map';
import { MAPEO_CERTIFICADO } from './certificado.map';
import { LIQUIDACIONES_MAP } from './liquidaciones.map';

// Campos que contienen imágenes en Base64 y su posición en el Excel
// Nota: el nombre de hoja y el rango cambian según la plantilla.
const GRAFICO_RANGES: Record<string, { sheet: string; colStart: number; colEnd: number; rowStart: number; rowEnd: number }> = {
  // Consentimiento: área de gráfico A19:BO34 → col 0-66, row 18-33 (0-indexed)
  consentimiento: { sheet: 'ANVERSO', colStart: 0, colEnd: 66, rowStart: 18, rowEnd: 33 },
  // Protocolo 017: diagrama en REVERSO, empieza en A47 (ver PROTOCOLO_MAP prot_diagrama)
  // Se usa un rango aproximado hasta antes de los datos del profesional (fila 64+ en el Excel).
  protocolo: { sheet: '017 REVERSO', colStart: 0, colEnd: 66, rowStart: 46, rowEnd: 60 },
};

function getGraficoRange(seccion: string) {
  return GRAFICO_RANGES[seccion] ?? null;
}

// Mapa de sección → archivo de mapa de celdas
// historia_clinica_anamnesis usa la misma plantilla .xlsx que historia_clinica
// pero apunta a la hoja ANAMNESIS
const SECTION_MAPS: Record<string, Record<string, { sheet: string; cell: string }>> = {
  consentimiento:              CONSENTIMIENTO_MAP,
  historia_clinica:            HISTORIA_CLINICA_MAP,
  historia_clinica_anamnesis:  HISTORIA_CLINICA_ANAMNESIS_MAP,
  historia_clinica_evolucion:  HISTORIA_CLINICA_EVOLUCION_MAP,
  historia_clinica_laboratorio: HISTORIA_CLINICA_LABORATORIO_MAP,
  historia_clinica_imagenologia: HISTORIA_CLINICA_IMAGENOLOGIA_MAP,
  historia_clinica_interconsulta: HISTORIA_CLINICA_INTERCONSULTA_MAP,
  protocolo:                   PROTOCOLO_MAP,
  liquidaciones:               LIQUIDACIONES_MAP,
};

function htmlToRichText(html: string): any {
  if (!html || !html.includes('<')) {
    return html ? String(html).toUpperCase() : '';
  }

  let parsed = html.replace(/<\/p>\s*<p[^>]*>/gi, '\n');
  parsed = parsed.replace(/<p[^>]*>/gi, '');
  parsed = parsed.replace(/<\/p>/gi, '');
  
  let counter = 1;
  parsed = parsed.replace(/<ol[^>]*>|<\/ol>|<ul[^>]*>|<\/ul>|<li[^>]*>|<\/li>/gi, (match) => {
    const lower = match.toLowerCase();
    if (lower.startsWith('<ol')) {
      counter = 1; return '';
    }
    if (lower.startsWith('</ol') || lower.startsWith('<ul') || lower.startsWith('</ul') || lower.startsWith('</li')) {
      return '';
    }
    if (lower.startsWith('<li')) {
      return `\n${counter++}. `;
    }
    return '';
  });
  
  parsed = parsed.replace(/<br\s*\/?>/gi, '\n');
  
  parsed = parsed.replace(/&nbsp;/gi, ' ');
  parsed = parsed.replace(/&amp;/gi, '&');
  parsed = parsed.replace(/&lt;/gi, '<');
  parsed = parsed.replace(/&gt;/gi, '>');

  const parts = parsed.split(/(<strong[^>]*>|<\/strong>|<b[^>]*>|<\/b>)/i);
  const richText: any[] = [];
  let isBold = false;
  
  for (const part of parts) {
    if (!part) continue;
    
    const lower = part.toLowerCase();
    if (lower.startsWith('<strong') || lower.startsWith('<b')) {
      isBold = true;
    } else if (lower === '</strong>' || lower === '</b>') {
      isBold = false;
    } else {
      richText.push({
        font: isBold ? { bold: true } : undefined,
        text: part.toUpperCase()
      });
    }
  }

  if (richText.length === 1 && !richText[0].font) {
    return richText[0].text;
  }

  return { richText };
}


function injectFields(
  workbook: ExcelJS.Workbook,
  cellMap: Record<string, { sheet: string; cell: string }>,
  datos: Record<string, any>,
) {
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === 'graficos' || campo === 'img_examen_fisico') continue;

    const mapping = cellMap[campo];
    if (!mapping) continue;

    const sheet = workbook.getWorksheet(mapping.sheet);
    if (!sheet) continue;

    const cell = sheet.getCell(mapping.cell);
    if (typeof valor === 'string' && valor.includes('<')) {
      cell.value = htmlToRichText(valor);
    } else {
      cell.value = valor ?? '';
    }

    // Fix para evitar que textos largos se muestren como ########
    if (typeof valor === 'string' || (valor && typeof valor === 'object' && valor.richText)) {
      cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
      if (cell.numFmt === '@' || (typeof valor === 'string' && valor.length > 200)) {
        cell.numFmt = 'General';
      }
    }
  }
}

function normalizeBooleans(datos: Record<string, any>) {
  for (const [k, v] of Object.entries(datos)) {
    if (typeof v === 'boolean') datos[k] = v ? 'X' : '';
  }
  return datos;
}

function preprocessShared(datos: Record<string, any>) {
  datos = { ...datos };

  if (datos['condicion_edad']) {
    const c = datos['condicion_edad'] as string;
    datos = {
      ...datos,
      condicion_edad_horas: c === 'H' ? 'X' : '',
      condicion_edad_dias: c === 'D' ? 'X' : '',
      condicion_edad_meses: c === 'M' ? 'X' : '',
      condicion_edad_anios: c === 'A' ? 'X' : '',
      condicion_edad_h: c === 'H' ? 'X' : '',
      condicion_edad_d: c === 'D' ? 'X' : '',
      condicion_edad_m: c === 'M' ? 'X' : '',
      condicion_edad_a: c === 'A' ? 'X' : '',
    };
  }

  if (datos['tipo_atencion'] !== undefined) {
    const tipo = datos['tipo_atencion'] as string;
    datos = {
      ...datos,
      tipo_atencion_ambulatorio: tipo === 'AMBULATORIO' ? 'X' : '',
      tipo_atencion_hospitalizacion: tipo === 'HOSPITALIZACION' ? 'X' : '',
    };
  }

  return normalizeBooleans(datos);
}



function injectImagenologiaMatematica(workbook: ExcelJS.Workbook, bloques: any[]) {
  const sheet = workbook.getWorksheet('IMAGENOLOGIA');
  if (!sheet) return;

  if (!Array.isArray(bloques)) bloques = [];

  const MAX_BLOQUES = 15;
  const ROW_OFFSET = 44;

  const setCell = (sheet: ExcelJS.Worksheet, cellRef: string, val: any) => {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;
    const col = match[1];
    const row = parseInt(match[2], 10);
    const cell = sheet.getCell(`${col}${row}`);
    
    if (val !== undefined && val !== null && val !== '') {
      if (typeof val === 'string' && val.includes('<')) {
        cell.value = htmlToRichText(val);
      } else {
        cell.value = String(val).toUpperCase();
      }
    } else {
      cell.value = '';
    }
    
    cell.numFmt = '@';
    const prevAlign = cell.alignment || {};
    cell.alignment = { ...prevAlign, wrapText: true, vertical: 'top' };
  };

  const setCellOffset = (cellRef: string, bOffset: number, val: any) => {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;
    const col = match[1];
    const row = parseInt(match[2], 10) + bOffset;
    setCell(sheet, `${col}${row}`, val);
  };

  // 1. Llenar los bloques activos
  for (let i = 0; i < bloques.length && i < MAX_BLOQUES; i++) {
    const b = bloques[i];
    if (!b) continue;
    const bOffset = i * ROW_OFFSET;

    // A. Datos del establecimiento y paciente
    setCellOffset('A3',  bOffset, b.institucion);
    setCellOffset('P3',  bOffset, b.unicodigo);
    setCellOffset('V3',  bOffset, b.establecimiento);
    setCellOffset('AN3', bOffset, b.numero_historia_clinica);
    setCellOffset('BF3', bOffset, b.numero_archivo);

    setCellOffset('A6',  bOffset, b.primer_apellido);
    setCellOffset('P6',  bOffset, b.segundo_apellido);
    setCellOffset('AC6', bOffset, b.primer_nombre);
    setCellOffset('AP6', bOffset, b.segundo_nombre);
    setCellOffset('AZ6', bOffset, b.sexo);
    setCellOffset('BC6', bOffset, b.fecha_nacimiento);
    setCellOffset('BI6', bOffset, b.edad);
    setCellOffset('BL6', bOffset, b.condicion_edad === 'H' ? 'X' : '');
    setCellOffset('BN6', bOffset, b.condicion_edad === 'D' ? 'X' : '');
    setCellOffset('BP6', bOffset, b.condicion_edad === 'M' ? 'X' : '');
    setCellOffset('BR6', bOffset, b.condicion_edad === 'A' ? 'X' : '');

    // B. Servicio y prioridad
    setCellOffset('F10',  bOffset, b.servicio_emergencia ? 'X' : '');
    setCellOffset('O10',  bOffset, b.servicio_consulta ? 'X' : '');
    setCellOffset('X10',  bOffset, b.servicio_hospitalizacion ? 'X' : '');
    setCellOffset('Z10',  bOffset, b.servicio_especialidad);
    setCellOffset('AQ10', bOffset, b.servicio_cama);
    setCellOffset('AW10', bOffset, b.servicio_sala);
    setCellOffset('BG10', bOffset, b.prioridad_urgente ? 'X' : '');
    setCellOffset('BL10', bOffset, b.prioridad_rutina ? 'X' : '');
    setCellOffset('BR10', bOffset, b.prioridad_control ? 'X' : '');

    // C. Estudio de imagenología solicitado
    setCellOffset('G13',  bOffset, b.rx_convencional ? 'X' : '');
    setCellOffset('M13',  bOffset, b.rx_portatil ? 'X' : '');
    setCellOffset('U13',  bOffset, b.tomografia ? 'X' : '');
    setCellOffset('AB13', bOffset, b.resonancia ? 'X' : '');
    setCellOffset('AI13', bOffset, b.ecografia ? 'X' : '');
    setCellOffset('AQ13', bOffset, b.mamografia ? 'X' : '');
    setCellOffset('AZ13', bOffset, b.procedimiento ? 'X' : '');
    setCellOffset('BE13', bOffset, b.otro ? 'X' : '');
    setCellOffset('BN13', bOffset, b.sedacion_si ? 'X' : '');
    setCellOffset('BR13', bOffset, b.sedacion_no ? 'X' : '');
    setCellOffset('I14',  bOffset, b.descripcion_estudio);

    // D. Motivo de la solicitud
    setCellOffset('K19',  bOffset, b.fum);
    setCellOffset('AM19', bOffset, b.paciente_contaminado_si ? 'X' : '');
    setCellOffset('AQ19', bOffset, b.paciente_contaminado_no ? 'X' : '');
    setCellOffset('A20',  bOffset, b.paciente_contaminado_desc);

    // E. Resumen clínico actual
    setCellOffset('A25', bOffset, b.resumen_clinico);

    // F. Diagnóstico
    setCellOffset('B33',  bOffset, b.diagnostico_1);
    setCellOffset('AC33', bOffset, b.diagnostico_1_cie);
    setCellOffset('AG33', bOffset, b.diagnostico_1_pre ? 'X' : '');
    setCellOffset('AI33', bOffset, b.diagnostico_1_def ? 'X' : '');

    setCellOffset('B34',  bOffset, b.diagnostico_2);
    setCellOffset('AC34', bOffset, b.diagnostico_2_cie);
    setCellOffset('AG34', bOffset, b.diagnostico_2_pre ? 'X' : '');
    setCellOffset('AI34', bOffset, b.diagnostico_2_def ? 'X' : '');

    setCellOffset('B35',  bOffset, b.diagnostico_3);
    setCellOffset('AC35', bOffset, b.diagnostico_3_cie);
    setCellOffset('AG35', bOffset, b.diagnostico_3_pre ? 'X' : '');
    setCellOffset('AI35', bOffset, b.diagnostico_3_def ? 'X' : '');

    setCellOffset('AL33', bOffset, b.diagnostico_4);
    setCellOffset('BL33', bOffset, b.diagnostico_4_cie);
    setCellOffset('BP33', bOffset, b.diagnostico_4_pre ? 'X' : '');
    setCellOffset('BR33', bOffset, b.diagnostico_4_def ? 'X' : '');

    setCellOffset('AL34', bOffset, b.diagnostico_5);
    setCellOffset('BL34', bOffset, b.diagnostico_5_cie);
    setCellOffset('BP34', bOffset, b.diagnostico_5_pre ? 'X' : '');
    setCellOffset('BR34', bOffset, b.diagnostico_5_def ? 'X' : '');

    setCellOffset('AL35', bOffset, b.diagnostico_6);
    setCellOffset('BL35', bOffset, b.diagnostico_6_cie);
    setCellOffset('BP35', bOffset, b.diagnostico_6_pre ? 'X' : '');
    setCellOffset('BR35', bOffset, b.diagnostico_6_def ? 'X' : '');

    // G. Datos del profesional responsable
    setCellOffset('A39',  bOffset, b.fecha);
    setCellOffset('I39',  bOffset, b.hora);
    setCellOffset('P39',  bOffset, b.prof_primer_nombre);
    setCellOffset('AK39', bOffset, b.prof_primer_apellido);
    setCellOffset('BD39', bOffset, b.prof_segundo_apellido);
    setCellOffset('A41',  bOffset, b.prof_documento);
  }

  // 2. Ocultar los bloques no utilizados
  for (let i = bloques.length; i < MAX_BLOQUES; i++) {
    const startRow = 1 + (i * ROW_OFFSET);
    const endRow = 44 + (i * ROW_OFFSET);
    for (let r = startRow; r <= endRow; r++) {
      const rowObj = sheet.getRow(r);
      rowObj.hidden = true;
    }
  }
}

function injectEvolucionMatematica(workbook: ExcelJS.Workbook, bloques: any[]) {
  const sheet = workbook.getWorksheet('EVOLUCION');
  if (!sheet) return;

  if (!Array.isArray(bloques)) bloques = [];

  const MAX_BLOQUES = 35;
  const ROW_OFFSET = 66;

  // 1. Llenar los bloques activos
  for (let i = 0; i < bloques.length && i < MAX_BLOQUES; i++) {
    const b = bloques[i];
    if (!b) continue;
    const bOffset = i * ROW_OFFSET;

    const setCell = (cellRef: string, val: any) => {
      const match = cellRef.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const col = match[1];
        const row = parseInt(match[2], 10);
        const cell = sheet.getCell(`${col}${row + bOffset}`);
        
        if (val !== undefined && val !== null && val !== '') {
          if (typeof val === 'string' && val.includes('<')) {
            cell.value = htmlToRichText(val);
          } else {
            cell.value = String(val).toUpperCase();
          }
        } else {
          cell.value = '';
        }
        
        // Fix para "########" y desbordamiento de texto:
        // Forzamos el formato a texto y activamos el salto de línea automático
        cell.numFmt = '@';
        
        // Conservar alineamiento previo si existe, pero forzando wrapText y vertical top
        const prevAlign = cell.alignment || {};
        cell.alignment = {
          ...prevAlign,
          wrapText: true,
          vertical: 'top',
        };
      }
    };

    setCell('A3', b.institucion);
    setCell('N3', b.unicodigo);
    setCell('T3', b.establecimiento);
    setCell('AH3', b.numero_historia_clinica);
    setCell('AZ3', b.numero_archivo);
    setCell('BK3', b.numero_hoja);

    setCell('A6', b.primer_apellido);
    setCell('R6', b.segundo_apellido);
    setCell('AF6', b.primer_nombre);
    setCell('AP6', b.segundo_nombre);
    setCell('BA6', b.sexo);
    setCell('BD6', b.edad);
    setCell('BH6', b.condicion_edad === 'H' ? 'X' : '');
    setCell('BJ6', b.condicion_edad === 'D' ? 'X' : '');
    setCell('BL6', b.condicion_edad === 'M' ? 'X' : '');
    setCell('BN6', b.condicion_edad === 'A' ? 'X' : '');

    setCell('A11', b.fecha);
    setCell('G11', b.hora);
    setCell('J11', b.notas_evolucion);
    setCell('AN11', b.farmacoterapia);
    // Si la plantilla tiene una columna específica para administrar_farmacos (ej. AW11 o BA11),
    // se puede mapear aquí. Por ahora, si 'AN11' está saliendo en blanco, aseguremos que el valor
    // sí llegue:
    if (b.administrar_farmacos !== undefined && b.administrar_farmacos !== '') {
      // Como no estaba explícito en el TXT, lo mapeo de forma conservadora o lo sumo a farmacoterapia
      // si es que comparten columna, pero por defecto lo dejaremos en la celda contigua
      setCell('AW11', b.administrar_farmacos); 
    }
  }

  // 2. Ocultar los bloques no utilizados
  for (let i = bloques.length; i < MAX_BLOQUES; i++) {
    const startRow = 1 + (i * ROW_OFFSET);
    const endRow = 66 + (i * ROW_OFFSET);
    for (let r = startRow; r <= endRow; r++) {
      const rowObj = sheet.getRow(r);
      rowObj.hidden = true;
    }
  }
}

@Injectable()
export class ExportService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'plantillas');

  async generarDocx(datos: Record<string, any>): Promise<Buffer> {
    const html = typeof datos?.html === 'string' ? datos.html : '<p></p>';

    // 1. Limpiar entidades HTML en atributos style (fix para font-family con &quot;)
    const cleanHtml = prepareHtmlForDocx(html);

    // 2. Convertir HTML → DOCX preservando formato
    const raw = await HTMLtoDOCX(cleanHtml, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    });

    // 3. Agregar w:szCs para que Word respete el tamaño de fuente correctamente
    const buffer = await addSzCsToDocx(Buffer.isBuffer(raw) ? raw : Buffer.from(raw));
    return buffer;
  }

  async generarDocxPorCeldas(
    rutaArchivo: string,
    seccion: string,
    datos: Record<string, any>,
  ): Promise<Buffer> {
    const filePath = path.join(this.uploadsDir, path.basename(rutaArchivo));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Archivo de plantilla no encontrado: ${rutaArchivo}`);
    }

    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);

    const docXmlStr = zip.file("word/document.xml")?.asText();
    if (!docXmlStr) {
      throw new InternalServerErrorException("No se pudo leer word/document.xml");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(docXmlStr, "text/xml");

    const tables = doc.getElementsByTagName("w:tbl");

    const map = seccion === 'epicrisis' ? MAPEO_006_EPICRISIS : null;
    if (!map) {
      throw new InternalServerErrorException(`No hay mapa de celdas DOCX para: ${seccion}`);
    }

    for (const [key, pos] of Object.entries(map)) {
      // The frontend uses un-prefixed keys for epicrisis (e.g. 'institucion')
      const valor = datos[key] ?? "";
      if (valor === "" || valor === false) continue; // Skip empty or unselected checkboxes

      const strValor = valor === true ? "X" : String(valor);

      const tabla = tables[pos.tabla];
      if (!tabla) continue;

      const rows = tabla.getElementsByTagName("w:tr");
      const fila = rows[pos.fila];
      if (!fila) continue;

      const cells = fila.getElementsByTagName("w:tc");
      const celda = cells[pos.celda];
      if (!celda) continue;

      let p = celda.getElementsByTagName("w:p")[0];
      if (!p) {
        p = doc.createElement("w:p");
        celda.appendChild(p);
      }

      if (strValor.includes('<') && strValor.includes('>')) {
        let cleanHtml = strValor;
        // Basic list conversion
        cleanHtml = cleanHtml.replace(/<ul>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/ul>/gi, '');
        cleanHtml = cleanHtml.replace(/<ol>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/ol>/gi, '');
        cleanHtml = cleanHtml.replace(/<li[^>]*>/gi, '\n• ');
        cleanHtml = cleanHtml.replace(/<\/li>/gi, '');
        
        // Paragraph conversion
        cleanHtml = cleanHtml.replace(/<\/p>\s*<p[^>]*>/gi, '\n');
        cleanHtml = cleanHtml.replace(/<p[^>]*>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/p>/gi, '');
        cleanHtml = cleanHtml.replace(/<br\s*\/?>/gi, '\n');
        
        // Entities
        cleanHtml = cleanHtml.replace(/&nbsp;/gi, ' ');
        cleanHtml = cleanHtml.replace(/&amp;/gi, '&');
        cleanHtml = cleanHtml.replace(/&lt;/gi, '<');
        cleanHtml = cleanHtml.replace(/&gt;/gi, '>');

        // Extraer formato del párrafo original (pPr) si existe
        const originalPPr = p.getElementsByTagName("w:pPr")[0];

        // Split by newlines first
        const lineas = cleanHtml.split('\n');
        for (let i = 0; i < lineas.length; i++) {
          const linea = lineas[i];
          
          let targetP = p;
          if (i > 0) {
            targetP = doc.createElement("w:p");
            if (originalPPr) {
              targetP.appendChild(originalPPr.cloneNode(true));
            }
            celda.appendChild(targetP);
          }
          
          if (linea.trim() !== '') {
            const tokens = linea.split(/(<strong[^>]*>|<\/strong>|<b[^>]*>|<\/b>|<em[^>]*>|<\/em>|<i[^>]*>|<\/i>|<u[^>]*>|<\/u>)/i);
            
            let isB = false, isI = false, isU = false;
            
            for (const tk of tokens) {
              if (!tk) continue;
              const lower = tk.toLowerCase();
              if (lower.startsWith('<strong') || lower.startsWith('<b')) { isB = true; }
              else if (lower === '</strong>' || lower === '</b>') { isB = false; }
              else if (lower.startsWith('<em') || lower.startsWith('<i')) { isI = true; }
              else if (lower === '</em>' || lower === '</i>') { isI = false; }
              else if (lower.startsWith('<u')) { isU = true; }
              else if (lower === '</u>') { isU = false; }
              else {
                const r = doc.createElement("w:r");
                const rPr = doc.createElement("w:rPr");
                let hasFmt = false;
                if (isB) { rPr.appendChild(doc.createElement("w:b")); hasFmt = true; }
                if (isI) { rPr.appendChild(doc.createElement("w:i")); hasFmt = true; }
                if (isU) { 
                  const u = doc.createElement("w:u");
                  u.setAttribute("w:val", "single");
                  rPr.appendChild(u); 
                  hasFmt = true; 
                }
                
                if (hasFmt) r.appendChild(rPr);
                
                const t = doc.createElement("w:t");
                t.setAttribute("xml:space", "preserve");
                t.appendChild(doc.createTextNode(tk));
                r.appendChild(t);
                targetP.appendChild(r);
              }
            }
          } else {
             // Línea vacía: agregar un espacio en blanco o br para que ocupe espacio
             const rBr = doc.createElement("w:r");
             rBr.appendChild(doc.createElement("w:br"));
             targetP.appendChild(rBr);
          }
        }
      } else {
        const lineas = strValor.split('\n');
        
        // Extraer formato del párrafo original (pPr) si existe
        const originalPPr = p.getElementsByTagName("w:pPr")[0];

        for (let i = 0; i < lineas.length; i++) {
          let targetP = p;
          if (i > 0) {
            targetP = doc.createElement("w:p");
            if (originalPPr) {
              targetP.appendChild(originalPPr.cloneNode(true));
            }
            celda.appendChild(targetP);
          }

          const r = doc.createElement("w:r");
          const t = doc.createElement("w:t");
          t.setAttribute("xml:space", "preserve");
          t.appendChild(doc.createTextNode(lineas[i]));
          r.appendChild(t);
          targetP.appendChild(r);
          
          if (lineas[i].trim() === '') {
             const rBr = doc.createElement("w:r");
             rBr.appendChild(doc.createElement("w:br"));
             targetP.appendChild(rBr);
          }
        }
      }
    }

    const serializer = new XMLSerializer();
    const newDocXmlStr = serializer.serializeToString(doc);

    zip.file("word/document.xml", newDocXmlStr);

    const outBuffer = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
    return outBuffer;
  }

  async generarDocxReceta(
    rutaArchivo: string,
    seccion: string,
    datos: Record<string, any>,
  ): Promise<Buffer> {
    const filePath = path.join(this.uploadsDir, path.basename(rutaArchivo));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Archivo de plantilla no encontrado: ${rutaArchivo}`);
    }

    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);

    const docXmlStr = zip.file("word/document.xml")?.asText();
    if (!docXmlStr) {
      throw new InternalServerErrorException("No se pudo leer word/document.xml");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(docXmlStr, "text/xml");

    const paragraphs = doc.getElementsByTagName("w:p");

    const processLabelMap = (mapEntry: { parrafo: number, label: string }, valor: any) => {
      if (!valor) return;
      const p = paragraphs[mapEntry.parrafo];
      if (!p) return;
      
      const r = doc.createElement("w:r");
      const t = doc.createElement("w:t");
      t.setAttribute("xml:space", "preserve");
      t.appendChild(doc.createTextNode(" " + String(valor).toUpperCase()));
      r.appendChild(t);
      p.appendChild(r);
    };

    const processMultiline = (
      config: { rango_inicio: number, rango_fin: number }, 
      valorText: string
    ) => {
      if (!valorText) return;
      
      let lines: string[] = [];
      let isHtml = valorText.includes('<') && valorText.includes('>');

      if (isHtml) {
        let cleanHtml = valorText;
        cleanHtml = cleanHtml.replace(/<ul>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/ul>/gi, '');
        cleanHtml = cleanHtml.replace(/<ol>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/ol>/gi, '');
        cleanHtml = cleanHtml.replace(/<li[^>]*>/gi, '\n• ');
        cleanHtml = cleanHtml.replace(/<\/li>/gi, '');
        
        cleanHtml = cleanHtml.replace(/<\/p>\s*<p[^>]*>/gi, '\n');
        cleanHtml = cleanHtml.replace(/<p[^>]*>/gi, '');
        cleanHtml = cleanHtml.replace(/<\/p>/gi, '');
        cleanHtml = cleanHtml.replace(/<br\s*\/?>/gi, '\n');
        
        cleanHtml = cleanHtml.replace(/&nbsp;/gi, ' ');
        cleanHtml = cleanHtml.replace(/&amp;/gi, '&');
        cleanHtml = cleanHtml.replace(/&lt;/gi, '<');
        cleanHtml = cleanHtml.replace(/&gt;/gi, '>');

        lines = cleanHtml.split('\n');
      } else {
        lines = valorText.split('\n');
      }
      
      let pIdx = config.rango_inicio;
      for (let i = 0; i < lines.length; i++) {
        if (pIdx > config.rango_fin) break;
        const p = paragraphs[pIdx];
        if (p) {
          const linea = lines[i];

          if (isHtml && linea.trim() !== '') {
            const tokens = linea.split(/(<strong[^>]*>|<\/strong>|<b[^>]*>|<\/b>|<em[^>]*>|<\/em>|<i[^>]*>|<\/i>|<u[^>]*>|<\/u>)/i);
            let isB = false, isI = false, isU = false;
            
            for (const tk of tokens) {
              if (!tk) continue;
              const lower = tk.toLowerCase();
              if (lower.startsWith('<strong') || lower.startsWith('<b')) { isB = true; }
              else if (lower === '</strong>' || lower === '</b>') { isB = false; }
              else if (lower.startsWith('<em') || lower.startsWith('<i')) { isI = true; }
              else if (lower === '</em>' || lower === '</i>') { isI = false; }
              else if (lower.startsWith('<u')) { isU = true; }
              else if (lower === '</u>') { isU = false; }
              else {
                const r = doc.createElement("w:r");
                const rPr = doc.createElement("w:rPr");
                let hasFmt = false;
                if (isB) { rPr.appendChild(doc.createElement("w:b")); hasFmt = true; }
                if (isI) { rPr.appendChild(doc.createElement("w:i")); hasFmt = true; }
                if (isU) { 
                  const u = doc.createElement("w:u");
                  u.setAttribute("w:val", "single");
                  rPr.appendChild(u); 
                  hasFmt = true; 
                }
                if (hasFmt) r.appendChild(rPr);
                
                const t = doc.createElement("w:t");
                t.setAttribute("xml:space", "preserve");
                t.appendChild(doc.createTextNode(tk));
                r.appendChild(t);
                p.appendChild(r);
              }
            }
          } else {
            const r = doc.createElement("w:r");
            const t = doc.createElement("w:t");
            t.setAttribute("xml:space", "preserve");
            t.appendChild(doc.createTextNode(linea));
            r.appendChild(t);
            p.appendChild(r);
          }
        }
        pIdx++;
      }
    };

    // COLUMNA IZQUIERDA
    processLabelMap(RECETA_MAP.col_izq.nombre, datos.nombre);
    processLabelMap(RECETA_MAP.col_izq.cedula, datos.cedula);
    processLabelMap(RECETA_MAP.col_izq.edad, datos.edad);
    processLabelMap(RECETA_MAP.col_izq.alergias, datos.alergias);
    processLabelMap(RECETA_MAP.col_izq.diagnostico, datos.diagnostico);
    processLabelMap(RECETA_MAP.col_izq.fecha, datos.fecha);
    processMultiline(RECETA_MAP.col_izq.rp_contenido, datos.rp_contenido);

    // COLUMNA DERECHA
    processLabelMap(RECETA_MAP.col_der.nombre, datos.nombre);
    processLabelMap(RECETA_MAP.col_der.cedula, datos.cedula);
    processLabelMap(RECETA_MAP.col_der.edad, datos.edad);
    processLabelMap(RECETA_MAP.col_der.alergias, datos.alergias);
    processLabelMap(RECETA_MAP.col_der.diagnostico, datos.diagnostico);
    processLabelMap(RECETA_MAP.col_der.fecha, datos.fecha);
    processMultiline(RECETA_MAP.col_der.indicaciones_contenido, datos.indicaciones_contenido);

    const serializer = new XMLSerializer();
    const newDocXmlStr = serializer.serializeToString(doc);

    zip.file("word/document.xml", newDocXmlStr);

    return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  }

  // ─── helpers DOM ────────────────────────────────────────────────────────────

  private childrenByLocal(parent: any, localName: string): any[] {
    return Array.from(parent.childNodes).filter(
      (n: any) =>
        n.nodeType === 1 &&
        (n.localName === localName || n.tagName === `w:${localName}` || n.tagName === localName)
    );
  }

  private getBody(xmlDoc: any): any {
    const bodies = Array.from(xmlDoc.documentElement.childNodes).filter(
      (n: any) => n.nodeType === 1 && 
        (n.localName === "body" || n.tagName === "w:body")
    );
    return bodies[0] ?? xmlDoc.getElementsByTagName("w:body")[0];
  }

  // ─── generarDocxCertificado ──────────────────────────────────────────────────

  async generarDocxCertificado(
    rutaArchivo: string,
    seccion: string,
    datos: Record<string, any>,
  ): Promise<Buffer> {
    const filePath = path.join(this.uploadsDir, path.basename(rutaArchivo));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Archivo de plantilla no encontrado: ${rutaArchivo}`);
    }

    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);

    const docXmlStr = zip.file("word/document.xml")?.asText();
    if (!docXmlStr) {
      throw new InternalServerErrorException("No se pudo leer word/document.xml");
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXmlStr, "text/xml");

    // w:body — contenedor raíz de párrafos y tablas
    const body = this.getBody(xmlDoc);

    // ✅ Solo párrafos directos del body (NO los de dentro de celdas)
    const rootParagraphs = this.childrenByLocal(body, "p");

    // ✅ Solo tablas directas del body
    const rootTables = this.childrenByLocal(body, "tbl");

    const map = MAPEO_CERTIFICADO;

    // ── processRun: escribe en un run de un párrafo raíz ──────────────────────
    const processRun = (mapEntry: { parrafo: number; run: number; espacioInicio?: boolean; espacioFin?: boolean; negrita?: boolean; sinNegrita?: boolean }, valorText: string) => {
      if (!valorText) return;

      const p = rootParagraphs[mapEntry.parrafo];
      if (!p) {
        console.warn(`processRun: párrafo raíz [${mapEntry.parrafo}] no existe`);
        return;
      }

      // Solo runs directos del párrafo
      const runs = this.childrenByLocal(p, "r");
      const run = runs[mapEntry.run];
      if (!run) {
        console.warn(`processRun: run [${mapEntry.run}] no existe en P[${mapEntry.parrafo}]`);
        return;
      }

      let t = this.childrenByLocal(run, "t")[0];
      if (!t) {
        t = xmlDoc.createElement("w:t");
        run.appendChild(t);
      }
      // xml:space="preserve" es obligatorio para que Word respete los espacios
      t.setAttribute("xml:space", "preserve");
      const valor = String(valorText).toUpperCase();
      const prefijo = mapEntry.espacioInicio ? " " : "";
      const sufijo  = mapEntry.espacioFin   ? " " : "";
      t.textContent = `${prefijo}${valor}${sufijo}`;

      // Aplicar o quitar negrita en el rPr del run
      if (mapEntry.negrita || mapEntry.sinNegrita) {
        let rPr = this.childrenByLocal(run, "rPr")[0];
        if (!rPr) {
          rPr = xmlDoc.createElement("w:rPr");
          run.insertBefore(rPr, run.firstChild);
        }
        // Eliminar w:b y w:bCs existentes para partir de cero
        const existingB   = this.childrenByLocal(rPr, "b");
        const existingBCs = this.childrenByLocal(rPr, "bCs");
        existingB.forEach((n: any)   => rPr.removeChild(n));
        existingBCs.forEach((n: any) => rPr.removeChild(n));

        if (mapEntry.negrita) {
          rPr.appendChild(xmlDoc.createElement("w:b"));
          rPr.appendChild(xmlDoc.createElement("w:bCs"));
        } else if (mapEntry.sinNegrita) {
          // Agregar w:b con w:val="false" para forzar sin negrita
          const bOff = xmlDoc.createElement("w:b");
          bOff.setAttribute("w:val", "false");
          rPr.appendChild(bOff);
          const bCsOff = xmlDoc.createElement("w:bCs");
          bCsOff.setAttribute("w:val", "false");
          rPr.appendChild(bCsOff);
        }
      }
    };

    // ── processCelda: agrega un run en el párrafo correcto de una celda ───────
    const processCelda = (
      mapEntry: { tabla: number; fila: number; celda: number; parrafo_en_celda: number; negrita?: boolean },
      valorText: string,
    ) => {
      if (!valorText) return;

      const tabla = rootTables[mapEntry.tabla];
      if (!tabla) {
        console.warn(`processCelda: tabla [${mapEntry.tabla}] no existe`);
        return;
      }

      // ✅ Solo filas directas de la tabla (w:tr hijas directas de w:tbl)
      const rows = this.childrenByLocal(tabla, "tr");
      const fila = rows[mapEntry.fila];
      if (!fila) {
        console.warn(`processCelda: fila [${mapEntry.fila}] no existe`);
        return;
      }

      // ✅ Solo celdas directas de la fila (w:tc hijas directas de w:tr)
      const cells = this.childrenByLocal(fila, "tc");
      const celda = cells[mapEntry.celda];
      if (!celda) {
        console.warn(`processCelda: celda [${mapEntry.celda}] no existe en fila [${mapEntry.fila}]`);
        return;
      }

      // ✅ Solo párrafos directos de la celda
      const cellParagraphs = this.childrenByLocal(celda, "p");
      const p = cellParagraphs[mapEntry.parrafo_en_celda];
      if (!p) {
        console.warn(`processCelda: párrafo [${mapEntry.parrafo_en_celda}] no existe en celda`);
        return;
      }

      const r = xmlDoc.createElement("w:r");

      // Aplicar fuente Calibri 10pt para que coincida con el resto del documento
      const rPr = xmlDoc.createElement("w:rPr");

      const rFonts = xmlDoc.createElement("w:rFonts");
      rFonts.setAttribute("w:ascii", "Calibri");
      rFonts.setAttribute("w:hAnsi", "Calibri");
      rFonts.setAttribute("w:cs", "Calibri");
      rPr.appendChild(rFonts);

      // Negrita si el campo lo requiere
      if (mapEntry.negrita) {
        rPr.appendChild(xmlDoc.createElement("w:b"));
        rPr.appendChild(xmlDoc.createElement("w:bCs"));
      }

      // Tamaño 10pt → half-points = 20
      const sz = xmlDoc.createElement("w:sz");
      sz.setAttribute("w:val", "20");
      rPr.appendChild(sz);

      const szCs = xmlDoc.createElement("w:szCs");
      szCs.setAttribute("w:val", "20");
      rPr.appendChild(szCs);

      r.appendChild(rPr);

      const t = xmlDoc.createElement("w:t");
      t.setAttribute("xml:space", "preserve");
      t.appendChild(xmlDoc.createTextNode(String(valorText).toUpperCase()));
      r.appendChild(t);
      p.appendChild(r);
    };

    console.log('DATOS RECIBIDOS PARA REPOSO:', {
      dias_reposo: datos.dias_reposo,
      desde_fecha: datos.desde_fecha,
      hasta_fecha: datos.hasta_fecha,
      dias_reposo_num: datos.dias_reposo_num,
      desde_fecha_letras: datos.desde_fecha_letras,
      hasta_fecha_letras: datos.hasta_fecha_letras,
    });

    // ── inyección ─────────────────────────────────────────────────────────────
    for (const key of Object.keys(map)) {
      if (key === "tabla") {
        const tablaMap = (map as any).tabla;
        for (const tKey of Object.keys(tablaMap)) {
          if (datos[tKey] != null) {
            processCelda(tablaMap[tKey], datos[tKey]);
          }
        }
      } else {
        if (datos[key] != null) {
          processRun((map as any)[key], datos[key]);
        }
      }
    }

    // ── post-proceso: eliminar run[5] de P[03] (los 2 espacios fijos tras la cédula)
    // La plantilla tiene run[5]='  ' entre la cédula y la coma, lo vaciamos.
    if (datos['cedula_paciente'] != null) {
      const p03 = rootParagraphs[3];
      if (p03) {
        const runs03 = this.childrenByLocal(p03, "r");
        const run5 = runs03[5];
        if (run5) {
          const t5 = this.childrenByLocal(run5, "t")[0];
          if (t5) t5.textContent = "";
        }
      }
    }

    // ── post-proceso: limpiar P[19] antes de inyectar el correo
    // La plantilla ya tiene el correo escrito como texto fijo; si no lo vaciamos
    // el valor inyectado se suma al existente y aparece duplicado.
    if (datos['correo_doctor'] != null) {
      const p19 = rootParagraphs[19];
      if (p19) {
        const runs19 = this.childrenByLocal(p19, "r");
        runs19.forEach((r: any) => {
          const t = this.childrenByLocal(r, "t")[0];
          if (t) t.textContent = "";
        });
      }
    }

    const serializer = new XMLSerializer();
    zip.file("word/document.xml", serializer.serializeToString(xmlDoc));

    return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  }

  async generarExcel(
    rutaArchivo: string,
    seccion: string,
    datos: Record<string, any>,
  ): Promise<Buffer> {
    const filePath = path.join(this.uploadsDir, path.basename(rutaArchivo));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Archivo de plantilla no encontrado: ${rutaArchivo}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Si es SÓLO Evolución
    if (seccion === 'historia_clinica_evolucion') {
      injectEvolucionMatematica(workbook, datos.bloques || []);
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    // Si es SÓLO Imagenología
    if (seccion === 'historia_clinica_imagenologia') {
      injectImagenologiaMatematica(workbook, datos.bloques || []);
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    const cellMap = SECTION_MAPS[seccion];
    if (!cellMap && seccion !== 'historia_clinica') {
      throw new InternalServerErrorException(
        `No existe mapa de celdas para la sección "${seccion}"`,
      );
    }

    // Exportación completa historia clínica: { emergencia, anamnesis, evolucion, laboratorio, imagenologia, interconsulta }
    // Mantiene compatibilidad con payload plano (solo EMERGENCIA)
    if (seccion === 'historia_clinica' && (datos?.emergencia || datos?.anamnesis || datos?.evolucion || datos?.laboratorio || datos?.imagenologia || datos?.interconsulta)) {
      const emergenciaRaw = (datos?.emergencia && typeof datos.emergencia === 'object') ? datos.emergencia : {};
      const anamnesisRaw = (datos?.anamnesis && typeof datos.anamnesis === 'object') ? datos.anamnesis : {};
      const evolucionRaw = (datos?.evolucion && typeof datos.evolucion === 'object') ? datos.evolucion : {};
      const laboratorioRaw = (datos?.laboratorio && typeof datos.laboratorio === 'object') ? datos.laboratorio : {};
      const imagenologiaRaw = (datos?.imagenologia && typeof datos.imagenologia === 'object') ? datos.imagenologia : {};
      const interconsultaRaw = (datos?.interconsulta && typeof datos.interconsulta === 'object') ? datos.interconsulta : {};

      const emergencia = preprocessShared(emergenciaRaw);

      // ── Campos específicos de Historia Clínica EMERGENCIA ────────────────
      // hc_establecimiento: "SI"|"NO"
      if (emergencia['hc_establecimiento']) {
        const v = emergencia['hc_establecimiento'];
        emergencia.hc_establecimiento_si = v === 'SI' ? 'X' : '';
        emergencia.hc_establecimiento_no = v === 'NO' ? 'X' : '';
      }

      // tipo_doc: "CC/CI"|"PAS"|"CARNE"|"SD"
      if (emergencia['tipo_doc']) {
        const v = emergencia['tipo_doc'];
        emergencia.tipo_doc_cc_ci = v === 'CC/CI' ? 'X' : '';
        emergencia.tipo_doc_pas = v === 'PAS' ? 'X' : '';
        emergencia.tipo_doc_carne = v === 'CARNE' ? 'X' : '';
        emergencia.tipo_doc_sd = v === 'SD' ? 'X' : '';
      }

      // estado_civil: "SOL"|"CAS"|"DIV"|"VIU"|"UN"|"UH"|"NA"
      if (emergencia['estado_civil']) {
        const v = emergencia['estado_civil'];
        emergencia.estado_civil_sol = v === 'SOL' ? 'X' : '';
        emergencia.estado_civil_cas = v === 'CAS' ? 'X' : '';
        emergencia.estado_civil_div = v === 'DIV' ? 'X' : '';
        emergencia.estado_civil_viu = v === 'VIU' ? 'X' : '';
        emergencia.estado_civil_un = v === 'UN' ? 'X' : '';
        emergencia.estado_civil_uh = v === 'UH' ? 'X' : '';
        emergencia.estado_civil_na = v === 'NA' ? 'X' : '';
      }

      // seguro_salud: "IESS_G"|"IESS_C"|"ISSPOL"|"ISSFA"|"PRIV"|"NING"
      if (emergencia['seguro_salud']) {
        const v = emergencia['seguro_salud'];
        emergencia.seguro_iess_g = v === 'IESS_G' ? 'X' : '';
        emergencia.seguro_iess_c = v === 'IESS_C' ? 'X' : '';
        emergencia.seguro_isspol = v === 'ISSPOL' ? 'X' : '';
        emergencia.seguro_issfa = v === 'ISSFA' ? 'X' : '';
        emergencia.seguro_priv = v === 'PRIV' ? 'X' : '';
        emergencia.seguro_ning = v === 'NING' ? 'X' : '';
      }

      // grupo_prioritario: "SI"|"NO"
      if (emergencia['grupo_prioritario']) {
        const v = emergencia['grupo_prioritario'];
        emergencia.grupo_prioritario_si = v === 'SI' ? 'X' : '';
        emergencia.grupo_prioritario_no = v === 'NO' ? 'X' : '';
      }

      // forma_llegada: "AMBULATORIO"|"AMBULANCIA"|"OTRO"
      if (emergencia['forma_llegada']) {
        const v = emergencia['forma_llegada'];
        emergencia.llegada_ambulatorio = v === 'AMBULATORIO' ? 'X' : '';
        emergencia.llegada_ambulancia = v === 'AMBULANCIA' ? 'X' : '';
        emergencia.llegada_otro = v === 'OTRO' ? 'X' : '';
      }

      // condicion_llegada: "ESTABLE"|"INESTABLE"|"FALLECIDO"
      if (emergencia['condicion_llegada']) {
        const v = emergencia['condicion_llegada'];
        emergencia.condicion_estable = v === 'ESTABLE' ? 'X' : '';
        emergencia.condicion_inestable = v === 'INESTABLE' ? 'X' : '';
        emergencia.condicion_fallecido = v === 'FALLECIDO' ? 'X' : '';
      }

      // custodia_policial: "SI"|"NO"
      if (emergencia['custodia_policial']) {
        const v = emergencia['custodia_policial'];
        emergencia.custodia_policial_si = v === 'SI' ? 'X' : '';
        emergencia.custodia_policial_no = v === 'NO' ? 'X' : '';
      }

      // notificacion: "SI"|"NO"
      if (emergencia['notificacion']) {
        const v = emergencia['notificacion'];
        emergencia.notificacion_si = v === 'SI' ? 'X' : '';
        emergencia.notificacion_no = v === 'NO' ? 'X' : '';
      }

      // tipo_accidente: string[]  → accidente_transito, accidente_caida, etc.
      const accMap: Record<string, string> = {
        transito: 'accidente_transito', caida: 'accidente_caida', quemadura: 'accidente_quemadura',
        mordedura: 'accidente_mordedura', ahogamiento: 'accidente_ahogamiento',
        cuerpo_extrano: 'accidente_cuerpo_extrano', aplastamiento: 'accidente_aplastamiento', otro: 'accidente_otro',
      };
      const accArr: string[] = Array.isArray(emergencia['tipo_accidente']) ? emergencia['tipo_accidente'] : [];
      for (const [k, mapKey] of Object.entries(accMap)) emergencia[mapKey] = accArr.includes(k) ? 'X' : '';

      // tipo_violencia: string[]
      const violMap: Record<string, string> = {
        arma_fuego: 'violencia_arma_fuego', arma_punzante: 'violencia_arma_punzante',
        rina: 'violencia_rina', familiar: 'violencia_familiar', fisica: 'violencia_fisica',
        psicologica: 'violencia_psicologica', sexual: 'violencia_sexual',
      };
      const violArr: string[] = Array.isArray(emergencia['tipo_violencia']) ? emergencia['tipo_violencia'] : [];
      for (const [k, mapKey] of Object.entries(violMap)) emergencia[mapKey] = violArr.includes(k) ? 'X' : '';

      // tipo_intoxicacion: string[]
      const intoxMap: Record<string, string> = {
        alcoholica: 'intox_alcoholica', alimentaria: 'intox_alimentaria', drogas: 'intox_drogas',
        gases: 'intox_gases', otra: 'intox_otra', picadura: 'intox_picadura',
        envenenamiento: 'intox_envenenamiento', anafilaxia: 'intox_anafilaxia',
      };
      const intoxArr: string[] = Array.isArray(emergencia['tipo_intoxicacion']) ? emergencia['tipo_intoxicacion'] : [];
      for (const [k, mapKey] of Object.entries(intoxMap)) emergencia[mapKey] = intoxArr.includes(k) ? 'X' : '';

      // aliento_alcoholico: boolean
      emergencia.aliento_alcoholico = emergencia['aliento_alcoholico'] ? 'X' : '';

      // antecedentes: string[]
      const antMap: Record<string, string> = {
        alergicos: 'antecedente_1_alergicos', clinicos: 'antecedente_2_clinicos',
        ginecologicos: 'antecedente_3_ginecologicos', traumatologicos: 'antecedente_4_traumatologicos',
        pediatricos: 'antecedente_5_pediatricos', quirurgicos: 'antecedente_6_quirurgicos',
        farmacologicos: 'antecedente_7_farmacologicos', habitos: 'antecedente_8_habitos',
        familiares: 'antecedente_9_familiares', otros: 'antecedente_10_otros',
      };
      const antArr: string[] = Array.isArray(emergencia['antecedentes']) ? emergencia['antecedentes'] : [];
      for (const [k, mapKey] of Object.entries(antMap)) emergencia[mapKey] = antArr.includes(k) ? 'X' : '';
      emergencia.antecedentes_no_aplica = emergencia['antecedentes_no_aplica'] ? 'X' : '';

      // sin_constantes_vitales: boolean
      emergencia.sin_constantes_vitales = emergencia['sin_constantes_vitales'] ? 'X' : '';

      // examen_items: string[]  → examen_piel_faneras, examen_oidos, etc.
      const exMap: Record<string, string> = {
        piel_faneras: 'examen_piel_faneras', oidos: 'examen_oidos', oro_faringe: 'examen_oro_faringe',
        torax: 'examen_torax', ingle_perine: 'examen_ingle_perine', cabeza: 'examen_cabeza',
        nariz: 'examen_nariz', cuello: 'examen_cuello', abdomen: 'examen_abdomen',
        miembros_sup: 'examen_miembros_sup', ojos: 'examen_ojos', boca: 'examen_boca',
        axilas_mamas: 'examen_axilas_mamas', columna: 'examen_columna', miembros_inf: 'examen_miembros_inf',
      };
      const exArr: string[] = Array.isArray(emergencia['examen_items']) ? emergencia['examen_items'] : [];
      for (const [k, mapKey] of Object.entries(exMap)) emergencia[mapKey] = exArr.includes(k) ? 'X' : '';

      // embarazo_no_aplica: boolean
      emergencia.embarazo_no_aplica = emergencia['embarazo_no_aplica'] ? 'X' : '';

      // examenes: string[]  → exam_biometria, exam_uroanalisis, etc.
      const examCompMap: Record<string, string> = {
        biometria: 'exam_biometria', uroanalisis: 'exam_uroanalisis',
        quimica_sanguinea: 'exam_quimica_sanguinea', electrolitos: 'exam_electrolitos',
        gasometria: 'exam_gasometria', electrocardiograma: 'exam_electrocardiograma',
        endoscopia: 'exam_endoscopia', rx_torax: 'exam_rx_torax', rx_abdomen: 'exam_rx_abdomen',
        rx_osea: 'exam_rx_osea', eco_abdomen: 'exam_eco_abdomen', eco_pelvica: 'exam_eco_pelvica',
        tomografia: 'exam_tomografia', resonancia: 'exam_resonancia',
        interconsulta: 'exam_interconsulta', otros: 'exam_otros',
      };
      const examArr: string[] = Array.isArray(emergencia['examenes']) ? emergencia['examenes'] : [];
      for (const [k, mapKey] of Object.entries(examCompMap)) emergencia[mapKey] = examArr.includes(k) ? 'X' : '';
      emergencia.examenes_no_aplica = emergencia['examenes_no_aplica'] ? 'X' : '';

      // egreso_condicion: string[]
      const egresoMap: Record<string, string> = {
        vivo: 'egreso_vivo', estable: 'egreso_estable', inestable: 'egreso_inestable',
        fallecido: 'egreso_fallecido', alta_definitiva: 'egreso_alta_definitiva',
        consulta_externa: 'egreso_consulta_externa', observacion: 'egreso_observacion',
        hospitalizacion: 'egreso_hospitalizacion', referencia: 'egreso_referencia',
        ref_inversa: 'egreso_ref_inversa', derivacion: 'egreso_derivacion',
      };
      const egresoArr: string[] = Array.isArray(emergencia['egreso_condicion']) ? emergencia['egreso_condicion'] : [];
      for (const [k, mapKey] of Object.entries(egresoMap)) emergencia[mapKey] = egresoArr.includes(k) ? 'X' : '';

      // dx_presuntivos / dx_definitivos: {descripcion, cie}[]  → flat fields
      const dxP: Array<{descripcion: string; cie: string}> = Array.isArray(emergenciaRaw['dx_presuntivos']) ? emergenciaRaw['dx_presuntivos'] : [];
      for (let i = 0; i < 3; i++) {
        emergencia[`dx_presuntivo_${i + 1}`] = dxP[i]?.descripcion ?? '';
        emergencia[`dx_presuntivo_${i + 1}_cie`] = dxP[i]?.cie ?? '';
      }
      const dxD: Array<{descripcion: string; cie: string}> = Array.isArray(emergenciaRaw['dx_definitivos']) ? emergenciaRaw['dx_definitivos'] : [];
      for (let i = 0; i < 3; i++) {
        emergencia[`dx_definitivo_${i + 1}`] = dxD[i]?.descripcion ?? '';
        emergencia[`dx_definitivo_${i + 1}_cie`] = dxD[i]?.cie ?? '';
      }

      // tratamientos: Tratamiento[]  → flat fields per row
      const txArr: Array<{medicamento: string; via: string; dosis: string; posologia: string; dias: string; descripcion: string}> =
        Array.isArray(emergenciaRaw['tratamientos']) ? emergenciaRaw['tratamientos'] : [];
      for (let i = 0; i < 5; i++) {
        const tx = txArr[i] ?? {};
        emergencia[`tratamiento_${i + 1}_medicamento`] = tx.medicamento ?? '';
        emergencia[`tratamiento_${i + 1}_via`] = tx.via ?? '';
        emergencia[`tratamiento_${i + 1}_dosis`] = tx.dosis ?? '';
        emergencia[`tratamiento_${i + 1}_posologia`] = tx.posologia ?? '';
        emergencia[`tratamiento_${i + 1}_dias`] = tx.dias ?? '';
        emergencia[`tratamiento_descripcion_${i + 1}`] = tx.descripcion ?? '';
      }

      const anamnesis = preprocessShared(anamnesisRaw);
      const laboratorio = preprocessShared(laboratorioRaw);
      const imagenologia = preprocessShared(imagenologiaRaw);
      const interconsulta = preprocessShared(interconsultaRaw);

      injectFields(workbook, HISTORIA_CLINICA_MAP, emergencia);
      injectFields(workbook, HISTORIA_CLINICA_ANAMNESIS_MAP, anamnesis);
      injectEvolucionMatematica(workbook, evolucionRaw?.bloques || []);
      injectFields(workbook, HISTORIA_CLINICA_LABORATORIO_MAP, laboratorio);
      injectImagenologiaMatematica(workbook, imagenologiaRaw?.bloques || []);
      injectFields(workbook, HISTORIA_CLINICA_INTERCONSULTA_MAP, interconsulta);

      // ── Inyectar imágenes de Anamnesis (campo img_examen_fisico: string[]) ─────────────
      const anamnesisImg: string[] = Array.isArray(anamnesisRaw['img_examen_fisico']) ? anamnesisRaw['img_examen_fisico'] : [];
      if (anamnesisImg.length > 0) {
        const sheet = workbook.getWorksheet('ANAMNESIS');
        if (sheet) {
          // Rango de la celda de imágenes en Anamnesis (aprox. AN77:BO87)
          const imgRange = { colStart: 39, colEnd: 66, rowStart: 76, rowEnd: 87 };
          const totalCols = imgRange.colEnd - imgRange.colStart;
          const colsPerImage = totalCols / anamnesisImg.length;

          anamnesisImg.forEach((base64, idx) => {
            if (!base64 || !base64.startsWith('data:image')) return;
            const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) return;

            const ext = matches[1];
            const extension: 'png' | 'jpeg' | 'gif' =
              ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'gif' ? 'gif' : 'png';
            const imageBuffer = Buffer.from(matches[2], 'base64') as any;

            const imageId = workbook.addImage({ buffer: imageBuffer, extension });

            const colStart = imgRange.colStart + Math.round(idx * colsPerImage);
            const colEnd   = imgRange.colStart + Math.round((idx + 1) * colsPerImage);

            sheet.addImage(imageId, {
              tl: { col: colStart, row: imgRange.rowStart } as any,
              br: { col: colEnd,   row: imgRange.rowEnd   } as any,
              editAs: 'oneCell',
            });
          });
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }

    // Clonar para no mutar el objeto original
    datos = preprocessShared(datos ?? {});

    // ── Campos específicos de Historia Clínica EMERGENCIA ────────────────
    if (seccion === 'historia_clinica') {
      // hc_establecimiento: "SI"|"NO"
      if (datos['hc_establecimiento']) {
        const v = datos['hc_establecimiento'];
        datos.hc_establecimiento_si = v === 'SI' ? 'X' : '';
        datos.hc_establecimiento_no = v === 'NO' ? 'X' : '';
      }

      // tipo_doc: "CC/CI"|"PAS"|"CARNE"|"SD"
      if (datos['tipo_doc']) {
        const v = datos['tipo_doc'];
        datos.tipo_doc_cc_ci = v === 'CC/CI' ? 'X' : '';
        datos.tipo_doc_pas = v === 'PAS' ? 'X' : '';
        datos.tipo_doc_carne = v === 'CARNE' ? 'X' : '';
        datos.tipo_doc_sd = v === 'SD' ? 'X' : '';
      }

      // estado_civil: "SOL"|"CAS"|"DIV"|"VIU"|"UN"|"UH"|"NA"
      if (datos['estado_civil']) {
        const v = datos['estado_civil'];
        datos.estado_civil_sol = v === 'SOL' ? 'X' : '';
        datos.estado_civil_cas = v === 'CAS' ? 'X' : '';
        datos.estado_civil_div = v === 'DIV' ? 'X' : '';
        datos.estado_civil_viu = v === 'VIU' ? 'X' : '';
        datos.estado_civil_un = v === 'UN' ? 'X' : '';
        datos.estado_civil_uh = v === 'UH' ? 'X' : '';
        datos.estado_civil_na = v === 'NA' ? 'X' : '';
      }

      // seguro_salud: "IESS_G"|"IESS_C"|"ISSPOL"|"ISSFA"|"PRIV"|"NING"
      if (datos['seguro_salud']) {
        const v = datos['seguro_salud'];
        datos.seguro_iess_g = v === 'IESS_G' ? 'X' : '';
        datos.seguro_iess_c = v === 'IESS_C' ? 'X' : '';
        datos.seguro_isspol = v === 'ISSPOL' ? 'X' : '';
        datos.seguro_issfa = v === 'ISSFA' ? 'X' : '';
        datos.seguro_priv = v === 'PRIV' ? 'X' : '';
        datos.seguro_ning = v === 'NING' ? 'X' : '';
      }

      // grupo_prioritario: "SI"|"NO"
      if (datos['grupo_prioritario']) {
        const v = datos['grupo_prioritario'];
        datos.grupo_prioritario_si = v === 'SI' ? 'X' : '';
        datos.grupo_prioritario_no = v === 'NO' ? 'X' : '';
      }

      // forma_llegada: "AMBULATORIO"|"AMBULANCIA"|"OTRO"
      if (datos['forma_llegada']) {
        const v = datos['forma_llegada'];
        datos.llegada_ambulatorio = v === 'AMBULATORIO' ? 'X' : '';
        datos.llegada_ambulancia = v === 'AMBULANCIA' ? 'X' : '';
        datos.llegada_otro = v === 'OTRO' ? 'X' : '';
      }

      // condicion_llegada: "ESTABLE"|"INESTABLE"|"FALLECIDO"
      if (datos['condicion_llegada']) {
        const v = datos['condicion_llegada'];
        datos.condicion_estable = v === 'ESTABLE' ? 'X' : '';
        datos.condicion_inestable = v === 'INESTABLE' ? 'X' : '';
        datos.condicion_fallecido = v === 'FALLECIDO' ? 'X' : '';
      }

      // custodia_policial: "SI"|"NO"
      if (datos['custodia_policial']) {
        const v = datos['custodia_policial'];
        datos.custodia_policial_si = v === 'SI' ? 'X' : '';
        datos.custodia_policial_no = v === 'NO' ? 'X' : '';
      }

      // notificacion: "SI"|"NO"
      if (datos['notificacion']) {
        const v = datos['notificacion'];
        datos.notificacion_si = v === 'SI' ? 'X' : '';
        datos.notificacion_no = v === 'NO' ? 'X' : '';
      }

      // tipo_accidente: string[]  → accidente_transito, accidente_caida, etc.
      const accMap: Record<string, string> = {
        transito: 'accidente_transito', caida: 'accidente_caida', quemadura: 'accidente_quemadura',
        mordedura: 'accidente_mordedura', ahogamiento: 'accidente_ahogamiento',
        cuerpo_extrano: 'accidente_cuerpo_extrano', aplastamiento: 'accidente_aplastamiento', otro: 'accidente_otro',
      };
      const accArr: string[] = Array.isArray(datos['tipo_accidente']) ? datos['tipo_accidente'] : [];
      for (const [k, mapKey] of Object.entries(accMap)) datos[mapKey] = accArr.includes(k) ? 'X' : '';

      // tipo_violencia: string[]
      const violMap: Record<string, string> = {
        arma_fuego: 'violencia_arma_fuego', arma_punzante: 'violencia_arma_punzante',
        rina: 'violencia_rina', familiar: 'violencia_familiar', fisica: 'violencia_fisica',
        psicologica: 'violencia_psicologica', sexual: 'violencia_sexual',
      };
      const violArr: string[] = Array.isArray(datos['tipo_violencia']) ? datos['tipo_violencia'] : [];
      for (const [k, mapKey] of Object.entries(violMap)) datos[mapKey] = violArr.includes(k) ? 'X' : '';

      // tipo_intoxicacion: string[]
      const intoxMap: Record<string, string> = {
        alcoholica: 'intox_alcoholica', alimentaria: 'intox_alimentaria', drogas: 'intox_drogas',
        gases: 'intox_gases', otra: 'intox_otra', picadura: 'intox_picadura',
        envenenamiento: 'intox_envenenamiento', anafilaxia: 'intox_anafilaxia',
      };
      const intoxArr: string[] = Array.isArray(datos['tipo_intoxicacion']) ? datos['tipo_intoxicacion'] : [];
      for (const [k, mapKey] of Object.entries(intoxMap)) datos[mapKey] = intoxArr.includes(k) ? 'X' : '';

      // aliento_alcoholico: boolean
      datos.aliento_alcoholico = datos['aliento_alcoholico'] ? 'X' : '';

      // antecedentes: string[]
      const antMap: Record<string, string> = {
        alergicos: 'antecedente_1_alergicos', clinicos: 'antecedente_2_clinicos',
        ginecologicos: 'antecedente_3_ginecologicos', traumatologicos: 'antecedente_4_traumatologicos',
        pediatricos: 'antecedente_5_pediatricos', quirurgicos: 'antecedente_6_quirurgicos',
        farmacologicos: 'antecedente_7_farmacologicos', habitos: 'antecedente_8_habitos',
        familiares: 'antecedente_9_familiares', otros: 'antecedente_10_otros',
      };
      const antArr: string[] = Array.isArray(datos['antecedentes']) ? datos['antecedentes'] : [];
      for (const [k, mapKey] of Object.entries(antMap)) datos[mapKey] = antArr.includes(k) ? 'X' : '';
      datos.antecedentes_no_aplica = datos['antecedentes_no_aplica'] ? 'X' : '';

      // sin_constantes_vitales: boolean
      datos.sin_constantes_vitales = datos['sin_constantes_vitales'] ? 'X' : '';

      // examen_items: string[]  → examen_piel_faneras, examen_oidos, etc.
      const exMap: Record<string, string> = {
        piel_faneras: 'examen_piel_faneras', oidos: 'examen_oidos', oro_faringe: 'examen_oro_faringe',
        torax: 'examen_torax', ingle_perine: 'examen_ingle_perine', cabeza: 'examen_cabeza',
        nariz: 'examen_nariz', cuello: 'examen_cuello', abdomen: 'examen_abdomen',
        miembros_sup: 'examen_miembros_sup', ojos: 'examen_ojos', boca: 'examen_boca',
        axilas_mamas: 'examen_axilas_mamas', columna: 'examen_columna', miembros_inf: 'examen_miembros_inf',
      };
      const exArr: string[] = Array.isArray(datos['examen_items']) ? datos['examen_items'] : [];
      for (const [k, mapKey] of Object.entries(exMap)) datos[mapKey] = exArr.includes(k) ? 'X' : '';

      // embarazo_no_aplica: boolean
      datos.embarazo_no_aplica = datos['embarazo_no_aplica'] ? 'X' : '';

      // examenes: string[]  → exam_biometria, exam_uroanalisis, etc.
      const examCompMap: Record<string, string> = {
        biometria: 'exam_biometria', uroanalisis: 'exam_uroanalisis',
        quimica_sanguinea: 'exam_quimica_sanguinea', electrolitos: 'exam_electrolitos',
        gasometria: 'exam_gasometria', electrocardiograma: 'exam_electrocardiograma',
        endoscopia: 'exam_endoscopia', rx_torax: 'exam_rx_torax', rx_abdomen: 'exam_rx_abdomen',
        rx_osea: 'exam_rx_osea', eco_abdomen: 'exam_eco_abdomen', eco_pelvica: 'exam_eco_pelvica',
        tomografia: 'exam_tomografia', resonancia: 'exam_resonancia',
        interconsulta: 'exam_interconsulta', otros: 'exam_otros',
      };
      const examArr: string[] = Array.isArray(datos['examenes']) ? datos['examenes'] : [];
      for (const [k, mapKey] of Object.entries(examCompMap)) datos[mapKey] = examArr.includes(k) ? 'X' : '';
      datos.examenes_no_aplica = datos['examenes_no_aplica'] ? 'X' : '';

      // egreso_condicion: string[]
      const egresoMap: Record<string, string> = {
        vivo: 'egreso_vivo', estable: 'egreso_estable', inestable: 'egreso_inestable',
        fallecido: 'egreso_fallecido', alta_definitiva: 'egreso_alta_definitiva',
        consulta_externa: 'egreso_consulta_externa', observacion: 'egreso_observacion',
        hospitalizacion: 'egreso_hospitalizacion', referencia: 'egreso_referencia',
        ref_inversa: 'egreso_ref_inversa', derivacion: 'egreso_derivacion',
      };
      const egresoArr: string[] = Array.isArray(datos['egreso_condicion']) ? datos['egreso_condicion'] : [];
      for (const [k, mapKey] of Object.entries(egresoMap)) datos[mapKey] = egresoArr.includes(k) ? 'X' : '';

      // dx_presuntivos / dx_definitivos: {descripcion, cie}[]  → flat fields
      const dxP: Array<{descripcion: string; cie: string}> = Array.isArray(datos['dx_presuntivos']) ? datos['dx_presuntivos'] : [];
      for (let i = 0; i < 3; i++) {
        datos[`dx_presuntivo_${i + 1}`] = dxP[i]?.descripcion ?? '';
        datos[`dx_presuntivo_${i + 1}_cie`] = dxP[i]?.cie ?? '';
      }
      const dxD: Array<{descripcion: string; cie: string}> = Array.isArray(datos['dx_definitivos']) ? datos['dx_definitivos'] : [];
      for (let i = 0; i < 3; i++) {
        datos[`dx_definitivo_${i + 1}`] = dxD[i]?.descripcion ?? '';
        datos[`dx_definitivo_${i + 1}_cie`] = dxD[i]?.cie ?? '';
      }

      // tratamientos: Tratamiento[]  → flat fields per row
      const txArr: Array<{medicamento: string; via: string; dosis: string; posologia: string; dias: string; descripcion: string}> =
        Array.isArray(datos['tratamientos']) ? datos['tratamientos'] : [];
      for (let i = 0; i < 5; i++) {
        const tx = txArr[i] ?? {};
        datos[`tratamiento_${i + 1}_medicamento`] = tx.medicamento ?? '';
        datos[`tratamiento_${i + 1}_via`] = tx.via ?? '';
        datos[`tratamiento_${i + 1}_dosis`] = tx.dosis ?? '';
        datos[`tratamiento_${i + 1}_posologia`] = tx.posologia ?? '';
        datos[`tratamiento_${i + 1}_dias`] = tx.dias ?? '';
        datos[`tratamiento_descripcion_${i + 1}`] = tx.descripcion ?? '';
      }
    }

    // Si el mapa de celdas no existe pero fue procesado específicamente arriba, lo saltamos
    if (cellMap) {
      if (seccion === 'liquidaciones') {
        // Soporte para formato antiguo (objetos con llaves fijas) por si acaso no ha sido migrado
        const itemsKeys = [
          'habitacion', 'med_quirurgico', 'med_clinico', 'laboratorio', 'sala', 'anestesia',
          'honor_internista', 'honor_traumato', 'tac_craneo', 'tac_columna', 'rayosx', 'eco',
          'honor_traumato2', 'emergencia'
        ];
        for (const k of itemsKeys) {
          if (datos[k] && typeof datos[k] === 'object') {
            datos[`detalle_${k}`] = datos[k].detalle ?? '';
            datos[`cantidad_${k}`] = datos[k].cantidad ?? '';
            datos[`unitario_${k}`] = datos[k].unitario ?? '';
            datos[`total_${k}`] = datos[k].total ?? '';
          }
        }
        
        // Soporte para nuevo formato dinámico (arreglo de items)
        if (Array.isArray(datos.items)) {
          datos.items.forEach((item: any, idx: number) => {
            datos[`item_${idx}_cantidad`] = item.cantidad ?? '';
            datos[`item_${idx}_detalle`]  = item.detalle ?? '';
            datos[`item_${idx}_unitario`] = item.unitario ?? '';
            datos[`item_${idx}_total`]    = item.total ?? '';
          });
        }
      }
      injectFields(workbook, cellMap, datos);
      
      // Ocultar filas no utilizadas en Liquidaciones para que los totales suban
      if (seccion === 'liquidaciones') {
        const sheetName = Object.values(cellMap)[0]?.sheet || 'Liquidacion';
        const sheet = workbook.getWorksheet(sheetName);
        if (sheet) {
          const maxItems = 35;
          const startRow = 15;
          const itemsCount = Array.isArray(datos.items) ? datos.items.length : 0;
          for (let i = itemsCount; i < maxItems; i++) {
            const rowObj = sheet.getRow(startRow + i);
            rowObj.hidden = true;
          }
        }
      }
    }

    // ── Inyectar imágenes en mosaico (campo graficos: string[]) ─────────────
    const graficos: string[] = Array.isArray(datos['graficos']) ? datos['graficos'] : [];
    const graficoRange = getGraficoRange(seccion);
    if (graficos.length > 0 && graficoRange) {
      const sheet = workbook.getWorksheet(graficoRange.sheet);
      if (sheet) {
        const totalCols = graficoRange.colEnd - graficoRange.colStart;
        const colsPerImage = totalCols / graficos.length;

        graficos.forEach((base64, idx) => {
          if (!base64 || !base64.startsWith('data:image')) return;
          const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matches) return;

          const ext = matches[1];
          const extension: 'png' | 'jpeg' | 'gif' =
            ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'gif' ? 'gif' : 'png';
          const imageBuffer = Buffer.from(matches[2], 'base64') as any;

          const imageId = workbook.addImage({ buffer: imageBuffer, extension });

          const colStart = graficoRange.colStart + Math.round(idx * colsPerImage);
          const colEnd   = graficoRange.colStart + Math.round((idx + 1) * colsPerImage);

          sheet.addImage(imageId, {
            tl: { col: colStart, row: graficoRange.rowStart } as any,
            br: { col: colEnd,   row: graficoRange.rowEnd   } as any,
            editAs: 'oneCell',
          });
        });
      }
    }

    // ── Inyectar imágenes de Anamnesis (campo img_examen_fisico: string[]) fallback ─────────────
    const imgAnamnesisFallback: string[] = Array.isArray(datos['img_examen_fisico']) ? datos['img_examen_fisico'] : [];
    if (imgAnamnesisFallback.length > 0) {
      const sheet = workbook.getWorksheet('ANAMNESIS');
      if (sheet) {
        const imgRange = { colStart: 39, colEnd: 66, rowStart: 76, rowEnd: 87 };
        const totalCols = imgRange.colEnd - imgRange.colStart;
        const colsPerImage = totalCols / imgAnamnesisFallback.length;

        imgAnamnesisFallback.forEach((base64, idx) => {
          if (!base64 || !base64.startsWith('data:image')) return;
          const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!matches) return;

          const ext = matches[1];
          const extension: 'png' | 'jpeg' | 'gif' =
            ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'gif' ? 'gif' : 'png';
          const imageBuffer = Buffer.from(matches[2], 'base64') as any;

          const imageId = workbook.addImage({ buffer: imageBuffer, extension });

          const colStart = imgRange.colStart + Math.round(idx * colsPerImage);
          const colEnd   = imgRange.colStart + Math.round((idx + 1) * colsPerImage);

          sheet.addImage(imageId, {
            tl: { col: colStart, row: imgRange.rowStart } as any,
            br: { col: colEnd,   row: imgRange.rowEnd   } as any,
            editAs: 'oneCell',
          });
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  listarArchivos(): string[] {
    if (!fs.existsSync(this.uploadsDir)) return [];
    return fs.readdirSync(this.uploadsDir);
  }
}
