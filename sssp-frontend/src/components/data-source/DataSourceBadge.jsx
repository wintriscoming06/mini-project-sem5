import React from 'react';
export const DataSourceBadge = ({ source = 'OFFICIAL_MATCH' }) => (
  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
    {source}
  </span>
);
export default DataSourceBadge;
