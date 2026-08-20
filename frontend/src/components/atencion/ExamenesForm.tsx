import React, { useImperativeHandle, forwardRef, useState } from "react";
import { Upload, FileText, Eye, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

export interface DatosExamenes {
  archivos: Array<{
    nombre: string;
    url: string;
    fecha_carga: string;
  }>;
}

interface ExamenesFormProps {
  atencionId?: number;
  paciente?: any;
  initialData?: Record<string, any>;
  onGuardar?: (datos: DatosExamenes) => void;
  guardando?: boolean;
}

const ExamenesForm = forwardRef((props: ExamenesFormProps, ref) => {
  const { atencionId, paciente, initialData, onGuardar, guardando } = props;

  const [d, setD] = useState<DatosExamenes>({
    archivos: [],
    ...initialData,
  });

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `examenes_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await api.post("/archivos/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      const nuevosAdjuntos = data.adjuntos || [];
      
      const now = new Date();
      const fechaCarga = `${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`;

      const conFecha = nuevosAdjuntos.map((a: any) => ({
        ...a,
        fecha_carga: fechaCarga
      }));

      setD(prev => ({
        ...prev,
        // Los archivos nuevos van al principio (arriba de la pila)
        archivos: [...conFecha, ...(prev.archivos || [])]
      }));

    } catch (error) {
      console.error(error);
      alert("No se pudieron subir los archivos. Verifique que sean PDF.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeArchivo = async (index: number) => {
    if (!d.archivos) return;
    if (!confirm("¿Seguro que quieres eliminar este documento?")) return;
    
    const url = d.archivos[index].url;
    if (url && url.startsWith("/archivos/pdfs/")) {
      try {
        await api.delete(url);
      } catch (error) {
        console.error("Error al eliminar archivo físico:", error);
      }
    }

    const nuevos = [...d.archivos];
    nuevos.splice(index, 1);
    setD(prev => ({ ...prev, archivos: nuevos }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "#f8fafc" }}>
      
      {/* ── Barra acciones ──────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: "#fff",
        borderBottom: "1px solid #e2e8f0", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
            Módulo de Exámenes de Laboratorio
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { onGuardar?.(d); clearAutosave(); }} disabled={guardando} 
            style={{
              padding: "8px 16px", background: "#0ea5e9", color: "#fff", 
              border: "none", borderRadius: "6px", cursor: guardando ? "not-allowed" : "pointer",
              fontWeight: 600, fontSize: "13px"
            }}>
            {guardando ? "Guardando..." : "💾 Guardar Cambios"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        
        {/* Dropzone / Upload button */}
        <div style={{ 
          background: "#fff", padding: "32px", borderRadius: "8px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "center",
          border: "2px dashed #cbd5e1", marginBottom: "24px"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>Carga de Resultados</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
            Sube aquí los documentos PDF correspondientes a los exámenes del paciente.
          </p>

          <input
            type="file"
            accept=".pdf"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: "6px", cursor: isUploading ? "not-allowed" : "pointer",
              fontSize: "14px", fontWeight: 600, transition: "background 0.2s"
            }}
          >
            <Upload size={18} />
            {isUploading ? "Subiendo archivos..." : "Cargar documento (PDF)"}
          </button>
        </div>

        {/* Lista de archivos */}
        {d.archivos && d.archivos.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#334155", paddingLeft: "4px" }}>
              Documentos Cargados ({d.archivos.length})
            </h3>
            {d.archivos.map((archivo, index) => (
              <div key={index} style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                padding: "16px", background: "#fff", border: "1px solid #e2e8f0", 
                borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "#fee2e2", padding: "10px", borderRadius: "8px" }}>
                    <FileText size={24} color="#ef4444" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>{archivo.nombre}</span>
                    <span style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>Cargado el: {archivo.fecha_carga}</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
                      setPdfPreviewUrl(`${baseUrl}${archivo.url}`);
                    }}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", 
                      background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", 
                      borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 500 
                    }}
                  >
                    <Eye size={16} />
                    Previsualizar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeArchivo(index)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", 
                      background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", 
                      borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 500 
                    }}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            No hay documentos cargados aún.
          </div>
        )}
        
      </div>

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.75)", zIndex: 10000, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center", padding: "40px"
        }}>
          <div style={{
            width: "100%", maxWidth: "900px", height: "85vh", background: "#fff",
            borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#334155" }}>Visor de Documento PDF</h3>
              <button
                onClick={() => setPdfPreviewUrl(null)}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 12px", fontWeight: "bold", cursor: "pointer" }}
              >
                X Cerrar
              </button>
            </div>
            <iframe src={pdfPreviewUrl} style={{ width: "100%", flex: 1, border: "none" }} title="PDF Preview" />
          </div>
        </div>
      )}

    </div>
  );
});

ExamenesForm.displayName = "ExamenesForm";

export default ExamenesForm;
