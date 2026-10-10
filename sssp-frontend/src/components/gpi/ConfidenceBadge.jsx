import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ConfidenceBadge = ({ confidence = 'VERIFIED' }) => (
  <span className="inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
    <ShieldCheck className="w-3 h-3 mr-1" /> {confidence}
  </span>
);
export default ConfidenceBadge;
