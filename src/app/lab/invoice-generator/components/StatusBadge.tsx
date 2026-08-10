// src/app/lab/invoice-generator/components/StatusBadge.tsx

import React from 'react';
import { InvoiceStatus } from '../lib/types';

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'Partially Paid':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Sent':
        return 'bg-[#3BA2DE]/10 border-[#3BA2DE]/20 text-[#3BA2DE]';
      case 'Overdue':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'Cancelled':
        return 'bg-zinc-800/50 border-zinc-800 text-zinc-500';
      case 'Draft':
      default:
        return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${getColors()} tracking-wider font-space shrink-0`}>
      {status}
    </span>
  );
}
