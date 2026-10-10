import { useState, useMemo } from 'react';
export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);
  return { page, setPage, totalPages, currentItems };
}
export default usePagination;
