// Indian Rupee (INR) Formatter Utility
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterWithPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (amount, { paise = false } = {}) =>
  (paise ? inrFormatterWithPaise : inrFormatter).format(Number(amount) || 0);

// Compact form for chart axes and summary tiles: ₹1.5L, ₹2.4Cr
export const formatINRCompact = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(amount) || 0);

