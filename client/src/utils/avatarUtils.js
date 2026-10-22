/**
 * Reliable Offline Avatar Generator
 * Generates an SVG Data URI so avatars never break even without an internet connection.
 */
export function getOfflineAvatar(name = 'User') {
  const initials = name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20" fill="#e2e8f0"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, sans-serif" font-weight="bold" font-size="14" fill="#475569">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
