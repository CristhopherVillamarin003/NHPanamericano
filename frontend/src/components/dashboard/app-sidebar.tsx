'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Stethoscope,
  LogOut,
  FolderHeart,
  Trash2,
  Pencil,
  MoreHorizontal,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Categoria } from '@/types';
import {
  getCategorias,
  createCategoria,
  deleteCategoria,
  updateCategoria,
} from '@/lib/services/categorias';

// ─── Dropdown flotante via portal ────────────────────────────────────────────

interface DropdownMenuProps {
  anchorRect: DOMRect;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function DropdownMenu({ anchorRect, onEdit, onDelete, onClose }: DropdownMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handle);
    };
  }, [onClose]);

  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const top = anchorRect.bottom + 6;
  const left = anchorRect.right - 140;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top,
        left,
        width: 140,
        background: '#fff',
        border: '1px solid #e4e4e7',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'dropdownFadeIn 0.12s ease',
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '9px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 500,
          color: '#3f3f46',
          transition: 'background 0.1s',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        <Pencil size={14} />
        Editar
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '9px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 500,
          color: '#dc2626',
          transition: 'background 0.1s',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        <Trash2 size={14} />
        Eliminar
      </button>
    </div>,
    document.body,
  );
}

// ─── Sidebar principal ────────────────────────────────────────────────────────

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [expanded, setExpanded] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const [menuState, setMenuState] = React.useState<{ id: number; rect: DOMRect; cat: Categoria } | null>(null);

  const fetchCategorias = React.useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch { /* silently fail */ }
  }, []);

  React.useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await createCategoria(trimmed);
      setNewName('');
      setCreating(false);
      await fetchCategorias();
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
  };

  const startEditing = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditingName(cat.nombre);
  };

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>, cat: Categoria) => {
    e.stopPropagation();
    if (menuState?.id === cat.id) {
      setMenuState(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuState({ id: cat.id, rect, cat });
    }
  };

  const handleEditSubmit = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    setLoading(true);
    try {
      await updateCategoria(id, trimmed);
      setEditingId(null);
      await fetchCategorias();
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') { e.preventDefault(); handleEditSubmit(id); }
    if (e.key === 'Escape') { setEditingId(null); }
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = async () => {
    if (categoryToDelete === null) return;
    setDeleting(true);
    try {
      await deleteCategoria(categoryToDelete);
      await fetchCategorias();
      if (pathname === `/dashboard/categoria/${categoryToDelete}`) {
        router.push('/dashboard');
      }
    } catch { /* silently fail */ }
    finally { setDeleting(false); setCategoryToDelete(null); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    router.push('/auth/login');
  };

  const isActive = (id: number) => pathname === `/dashboard/categoria/${id}`;

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo-container">
        <img src="/logo.png" alt="Nuevo Hospital Panamericano" className="sidebar-logo" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => router.push('/dashboard')}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Inicio</span>
        </button>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <button
              type="button"
              className="sidebar-section-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <FolderHeart className="w-4 h-4" />
              <span>Servicios</span>
            </button>
            <button
              type="button"
              className="sidebar-add-btn"
              onClick={() => { setExpanded(true); setCreating(true); }}
              title="Crear servicio"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {expanded && (
            <div className="sidebar-section-content">
              {creating && (
                <div className="sidebar-create-input">
                  <input
                    type="text"
                    placeholder="Nombre del servicio..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (!newName.trim()) setCreating(false); }}
                    autoFocus
                    disabled={loading}
                    className="sidebar-input"
                  />
                </div>
              )}

              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className={`sidebar-category-item ${isActive(cat.id) ? 'active' : ''}`}
                  onClick={() => router.push(`/dashboard/categoria/${cat.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/categoria/${cat.id}`);
                  }}
                >
                  <span className="sidebar-category-dot" />
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, cat.id)}
                      onBlur={() => handleEditSubmit(cat.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      disabled={loading}
                      className="sidebar-input edit-inline-input"
                    />
                  ) : (
                    <>
                      <span className="sidebar-category-name">{cat.nombre}</span>
                      <button
                        type="button"
                        className={`sidebar-category-menu-btn ${menuState?.id === cat.id ? 'open' : ''}`}
                        onClick={(e) => handleMenuToggle(e, cat)}
                        title="Más opciones"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {categorias.length === 0 && !creating && (
                <p className="sidebar-empty">No hay servicios creados</p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {menuState && (
        <DropdownMenu
          anchorRect={menuState.rect}
          onEdit={() => {
            setMenuState(null);
            startEditing(menuState.cat);
          }}
          onDelete={() => {
            setMenuState(null);
            handleDeleteClick(menuState.id);
          }}
          onClose={() => setMenuState(null)}
        />
      )}

      <ConfirmDialog
        open={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar"
        message="¿Está seguro que desea eliminar este servicio? Esta acción no se puede deshacer y removerá a los pacientes de este servicio."
        loading={deleting}
      />
    </aside>
  );
}
