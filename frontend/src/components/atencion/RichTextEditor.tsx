'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';

// ── Extensión FontSize: guarda el valor en `pt` para que DOCX y pantalla coincidan ──
// Los navegadores renderizan `pt` correctamente, y html-to-docx lo mapea 1:1 a Word.
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            // Al leer HTML guardado: acepta tanto "Xpt" como "Xpx" (legado)
            parseHTML: (element) => {
              const raw = element.style.fontSize;
              if (!raw) return null;
              if (raw.endsWith('pt')) return raw; // ya está en pt
              if (raw.endsWith('px')) {
                // Convertir px → pt para contenido guardado con versión anterior
                const px = parseFloat(raw);
                return `${Math.round(px * 0.75)}pt`;
              }
              return raw;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              // Siempre renderizar en pt (navegador lo muestra igual que Word)
              const val = String(attributes.fontSize);
              const ptVal = val.endsWith('pt') ? val : `${val}pt`;
              return { style: `font-size: ${ptVal}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (pt: number) =>
        ({ chain }: any) => {
          return chain().setMark('textStyle', { fontSize: `${pt}pt` }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
        },
    } as any;
  },
});

// ── Tipos ─────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  minHeight?: string;
}

// ── Leer el tamaño de fuente activo desde el editor ───────────────────────
function getActiveFontSize(editor: Editor): number {
  const attrs = editor.getAttributes('textStyle');
  const raw: string = attrs?.fontSize ?? '';
  if (!raw) return 12;
  const num = parseFloat(raw);
  return isNaN(num) ? 12 : Math.round(num);
}

// ── Barra de herramientas ─────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  // Estado local del input de tamaño — se sincroniza con la selección activa
  const [fontSize, setFontSize] = useState<number>(getActiveFontSize(editor));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Actualizar el input cuando cambia la selección en el editor
  useEffect(() => {
    const handler = () => setFontSize(getActiveFontSize(editor));
    editor.on('selectionUpdate', handler);
    editor.on('transaction', handler);
    return () => {
      editor.off('selectionUpdate', handler);
      editor.off('transaction', handler);
    };
  }, [editor]);

  const applyFontSize = (val: number) => {
    const clamped = Math.min(Math.max(val, 6), 96);
    if (isNaN(clamped)) return;
    (editor.chain().focus() as any).setFontSize(clamped).run();
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFontSize(val);
    // Aplicar en tiempo real con debounce corto para no disparar en cada tecla
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFontSize(val), 300);
  };

  const handleFontSizeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFontSize(Number(e.target.value));
  };

  const handleFontSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      applyFontSize(Number((e.target as HTMLInputElement).value));
    }
  };

  if (!editor) return null;

  const btnBase =
    'px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-sm transition-colors';
  const btnActive = 'bg-blue-100 border-blue-400';

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-slate-200 bg-slate-50">
      {/* Estilo de párrafo */}
      <select
        className="px-2 py-1 border border-slate-300 rounded bg-white text-sm"
        title="Estilo"
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'paragraph') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(val) as 1 | 2 | 3 }).run();
        }}
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : 'paragraph'
        }
      >
        <option value="paragraph">Normal</option>
        <option value="1">Título 1</option>
        <option value="2">Título 2</option>
        <option value="3">Título 3</option>
      </select>

      {/* Fuente */}
      <select
        className="px-2 py-1 border border-slate-300 rounded bg-white text-sm"
        title="Tipo de letra"
        defaultValue="Arial"
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
      >
        <option value="Arial">Arial</option>
        <option value="Calibri">Calibri</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
      </select>

      {/* Tamaño numérico en pt — aplica en tiempo real */}
      <input
        type="number"
        min={6}
        max={96}
        value={fontSize}
        className="w-16 px-2 py-1 border border-slate-300 rounded bg-white text-sm"
        title="Tamaño de letra (pt)"
        onChange={handleFontSizeChange}
        onBlur={handleFontSizeBlur}
        onKeyDown={handleFontSizeKeyDown}
      />

      <div className="w-px h-5 bg-slate-300 mx-0.5" />

      {/* Negrita */}
      <button
        type="button"
        title="Negrita"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btnBase} font-bold ${editor.isActive('bold') ? btnActive : ''}`}
      >
        B
      </button>

      {/* Cursiva */}
      <button
        type="button"
        title="Cursiva"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btnBase} italic ${editor.isActive('italic') ? btnActive : ''}`}
      >
        I
      </button>

      {/* Subrayado */}
      <button
        type="button"
        title="Subrayado"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`${btnBase} underline ${editor.isActive('underline') ? btnActive : ''}`}
      >
        U
      </button>

      {/* Tachado */}
      <button
        type="button"
        title="Tachado"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${btnBase} line-through ${editor.isActive('strike') ? btnActive : ''}`}
      >
        S
      </button>

      <div className="w-px h-5 bg-slate-300 mx-0.5" />

      {/* Color de texto */}
      <label className="flex items-center gap-1 cursor-pointer" title="Color de texto">
        <span className="text-xs text-slate-500 font-bold">A</span>
        <input
          type="color"
          className="w-6 h-6 rounded cursor-pointer border border-slate-300"
          onInput={(e) =>
            editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
          }
        />
      </label>

      <div className="w-px h-5 bg-slate-300 mx-0.5" />

      {/* Listas */}
      <button
        type="button"
        title="Lista con viñetas"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
      >
        • Lista
      </button>

      <button
        type="button"
        title="Lista numerada"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
      >
        1. Lista
      </button>

      <div className="w-px h-5 bg-slate-300 mx-0.5" />

      {/* Alineación */}
      <button
        type="button"
        title="Alinear izquierda"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`${btnBase} ${editor.isActive({ textAlign: 'left' }) ? btnActive : ''}`}
      >
        ⬅
      </button>
      <button
        type="button"
        title="Centrar"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? btnActive : ''}`}
      >
        ≡
      </button>
      <button
        type="button"
        title="Alinear derecha"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`${btnBase} ${editor.isActive({ textAlign: 'right' }) ? btnActive : ''}`}
      >
        ➡
      </button>
      <button
        type="button"
        title="Justificar"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`${btnBase} ${editor.isActive({ textAlign: 'justify' }) ? btnActive : ''}`}
      >
        ☰
      </button>

      <div className="w-px h-5 bg-slate-300 mx-0.5" />

      {/* Deshacer / Rehacer */}
      <button
        type="button"
        title="Deshacer"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btnBase} disabled:opacity-40`}
      >
        ↩
      </button>
      <button
        type="button"
        title="Rehacer"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btnBase} disabled:opacity-40`}
      >
        ↪
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function RichTextEditor({
  content,
  onChange,
  minHeight = '60vh',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none tiptap',
        style: `min-height: ${minHeight}; padding: 28px 34px; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;`,
      },
    },
  });

  // Sincronizar contenido externo (carga inicial desde BD)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {editor && <Toolbar editor={editor} />}
      <div className="bg-slate-100 p-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
      <style>{`
        .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap li { margin: 0.2rem 0; }
        .tiptap h1 { font-size: 2em; font-weight: bold; margin: 0.5rem 0; }
        .tiptap h2 { font-size: 1.5em; font-weight: bold; margin: 0.5rem 0; }
        .tiptap h3 { font-size: 1.17em; font-weight: bold; margin: 0.5rem 0; }
        .tiptap p { margin: 0.3rem 0; }
        .tiptap p:first-child { margin-top: 0; }
        .tiptap table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
        .tiptap td, .tiptap th { min-width: 1em; border: 2px solid #ced4da; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }
        .tiptap th { font-weight: bold; text-align: left; background-color: #f1f3f5; }
        .tiptap .column-resize-handle { background-color: #adf; bottom: -2px; position: absolute; right: -2px; pointer-events: none; top: -2px; width: 4px; }
      `}</style>
    </div>
  );
}
