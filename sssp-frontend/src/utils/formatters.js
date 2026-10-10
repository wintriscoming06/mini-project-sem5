export const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toFixed(1) : '—');
export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
