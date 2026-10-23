import React from 'react';
import { User } from 'lucide-react';

const PALETTES = [
  { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' }, // Indigo
  { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' }, // Blue
  { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }, // Emerald
  { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }, // Amber
  { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }, // Purple
  { bg: '#cffafe', text: '#155e75', border: '#a5f3fc' }, // Cyan
  { bg: '#ffe4e6', text: '#9f1239', border: '#fecdd3' }, // Rose
  { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' }, // Slate
];

function getPalette(name) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Enterprise User Avatar Component
 * Displays professional deterministic initials badge or icon instead of person stock photos.
 */
export default function UserAvatar({ name = '', size = 32, className = '' }) {
  const palette = getPalette(name);
  const initials = getInitials(name);
  const fontSize = Math.max(11, Math.round(size * 0.38));

  return (
    <div
      className={`user-avatar-badge ${className}`}
      title={name || 'Employee'}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        backgroundColor: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: `${fontSize}px`,
        letterSpacing: '0.5px',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {initials ? initials : <User size={Math.round(size * 0.55)} color={palette.text} />}
    </div>
  );
}
