'use client';

import React from 'react';

// Shared interfaces
export interface Product {
  id: number;
  category: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  badgeUk?: string | null;
  badgeRu?: string | null;
  badgeEn?: string | null;
  specsJson: string;
  photo?: string;
}

export interface Order {
  id: number;
  type: string;
  name: string;
  phone: string;
  comment?: string | null;
  detailsJson: string;
  status: string;
  createdAt: string;
}

export interface ConstructorPart {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  icon: string;
}

export interface ColorPreset {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
}

export interface TranslationData {
  key: string;
  uk: string;
  ru: string;
  en: string;
}

export interface SeoData {
  route: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  descUk: string;
  descRu: string;
  descEn: string;
}

// Empty state placeholder component
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-icon">{icon}</span>
      <p className="admin-empty-title">{title}</p>
      {subtitle && <p className="admin-empty-subtitle">{subtitle}</p>}
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      {text && <p className="admin-loading-text">{text}</p>}
    </div>
  );
}

// Kanban card component (reusable for all 3 columns)
interface KanbanCardProps {
  order: Order;
  actions: { label: string; status?: string; isDelete?: boolean }[];
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  formatDetails: (order: Order) => string;
}

export function KanbanCard({ order, actions, onUpdateStatus, onDelete, formatDetails }: KanbanCardProps) {
  return (
    <div className="kanban-order-card">
      <div className="order-card-header">
        <span>№{order.id}</span>
        <span className="order-card-type-badge">{order.type}</span>
      </div>
      <div className="order-card-client-name">{order.name}</div>
      <div className="order-card-client-phone">{order.phone}</div>
      <pre className="order-card-details-box">{formatDetails(order)}</pre>
      {order.comment && <div className="order-card-comment">«{order.comment}»</div>}
      <div className="order-card-date">
        {new Date(order.createdAt).toLocaleString('uk-UA')}
      </div>
      <div className="order-card-actions">
        {actions.map((action) =>
          action.isDelete ? (
            <button
              key="delete"
              className="order-card-action-btn order-card-delete-btn"
              onClick={() => onDelete(order.id)}
            >
              ×
            </button>
          ) : (
            <button
              key={action.status}
              className="order-card-action-btn"
              onClick={() => onUpdateStatus(order.id, action.status!)}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
