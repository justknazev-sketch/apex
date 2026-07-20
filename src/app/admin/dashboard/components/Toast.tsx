'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

let toastId = 0;

// Global toast state
let globalSetToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>> | null = null;

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = ++toastId;
  globalSetToasts?.(prev => [...prev, { id, type, text }]);
  setTimeout(() => {
    globalSetToasts?.(prev => prev.filter(t => t.id !== id));
  }, 3500);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    globalSetToasts = setToasts;
    return () => { globalSetToasts = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-text">{toast.text}</span>
          <button
            className="toast-close"
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Confirm Dialog component
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-dialog-icon">⚠</div>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="btn-outline confirm-btn-cancel" onClick={onCancel}>
            Скасувати
          </button>
          <button className="btn-primary confirm-btn-delete" onClick={onConfirm}>
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for confirm dialog
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    resolve: ((value: boolean) => void) | null;
  }>({ open: false, title: '', message: '', resolve: null });

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState(prev => ({ ...prev, open: false }));
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}
