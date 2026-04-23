import { Countdown } from '@/components/ui/countdown';
import { samplePreQuestions } from '@/lib/services/mock-data';

export default function PreQuestionsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Pre-Questions</h1>
      {samplePreQuestions.map((item) => (
        <article className="card space-y-2" key={item.id}>
          <div className="flex justify-between gap-2">
            <h2 className="text-xl font-bold">{item.question_text}</h2>
            <Countdown closeAt={item.close_at} />
          </div>
          <p className="text-sm text-silver">Score +{item.score_correct} / {item.score_wrong}</p>
          <button className="rounded-xl bg-danger px-4 py-2 font-semibold">Submit answer</button>
        </article>
      ))}
    </section>
  );
}
