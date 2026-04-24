'use client';

import { useEffect, useState } from 'react';
import { countdownParts, isClosed } from '@/lib/utils/time';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

type Props = { closeAt: string; className?: string };

export function Countdown({ closeAt, className }: Props) {
  const [parts, setParts] = useState(() => countdownParts(closeAt));
  const [closed, setClosed] = useState(() => isClosed(closeAt));

  useEffect(() => {
    const tick = () => {
      setParts(countdownParts(closeAt));
      setClosed(isClosed(closeAt));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [closeAt]);

  if (closed) {
    return (
      <span className={clsx('badge-danger', className)}>
        Locked
      </span>
    );
  }

  const totalSeconds =
    parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
  const urgent = totalSeconds < 3600; // last hour

  return (
    <span
      className={clsx(
        'badge flex items-center gap-1',
        urgent
          ? 'bg-amber-500/20 text-amber-400 countdown-urgent'
          : 'bg-emerald-500/15 text-emerald-400',
        className
      )}
    >
      <Clock size={11} />
      {parts.hours > 0 && `${parts.hours}h `}
      {parts.minutes}m {String(parts.seconds).padStart(2, '0')}s
    </span>
  );
}
