import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({ columns, data, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8 bg-white dark:bg-[#0b1e2d] rounded-xl border border-slate-200 dark:border-emerald-900/30">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState title="No Records" description={emptyMessage} />
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#0b1e2d] rounded-xl shadow-sm border border-slate-200 dark:border-emerald-900/30">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-[#071622]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#0b1e2d] divide-y divide-slate-100 dark:divide-slate-800/70">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
