import { clsx } from 'clsx';
import type { Stage } from '@/lib/types';
import { STAGE_LABELS } from '@/lib/types';

const STAGE_COLORS: Record<Stage, string> = {
  group: 'bg-blue-500/15 text-blue-400',
  round_of_16: 'bg-purple-500/15 text-purple-400',
  quarter_final: 'bg-amber-500/15 text-amber-400',
  semi_final: 'bg-orange-500/15 text-orange-400',
  final: 'bg-danger/20 text-danger',
};

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span className={clsx('badge', STAGE_COLORS[stage], className)}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
