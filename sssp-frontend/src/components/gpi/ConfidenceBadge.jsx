import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ConfidenceBadge = ({ confidence = 'VERIFIED' }) => (
  <span className="inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
    <ShieldCheck className="w-3 h-3 mr-1" /> {confidence}
  </span>
);
export default ConfidenceBadge;
