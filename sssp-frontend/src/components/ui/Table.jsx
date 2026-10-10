import React from 'react';

export const Table = ({ headers, children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
      {headers && (
        <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {children}
      </tbody>
    </table>
  </div>
);
export default Table;
