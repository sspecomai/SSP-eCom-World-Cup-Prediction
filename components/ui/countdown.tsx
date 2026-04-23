'use client';

import { useEffect, useState } from 'react';
import { countdownParts, isClosed } from '@/lib/utils/time';

export function Countdown({ closeAt }: { closeAt: string }) {
  const [parts, setParts] = useState(() => countdownParts(closeAt));
  const closed = isClosed(closeAt);

  useEffect(() => {
    const timer = setInterval(() => setParts(countdownParts(closeAt)), 1000);
    return () => clearInterval(timer);
  }, [closeAt]);

  if (closed) return <span className="badge bg-danger/20 text-danger">Locked</span>;

  return (
    <span className="badge bg-emerald-500/20 text-emerald-300">
      {parts.hours}h {parts.minutes}m {parts.seconds}s left
    </span>
  );
}
