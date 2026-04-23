import { MatchCard } from '@/components/predictions/match-card';
import { sampleMatches } from '@/lib/services/mock-data';

export default function PredictionsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Match Predictions</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {sampleMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
