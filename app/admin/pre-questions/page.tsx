export default function AdminPreQuestionsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black">Admin: Pre-Questions</h1>
      <div className="card space-y-3">
        <p>Create and edit campaign pre-questions with timing, options, scoring, and publish controls.</p>
        <form className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Question text" />
          <select className="rounded-xl border border-white/15 bg-black/20 p-3"><option>single_choice</option><option>multi_choice</option><option>text</option></select>
          <input type="datetime-local" className="rounded-xl border border-white/15 bg-black/20 p-3" />
          <input type="datetime-local" className="rounded-xl border border-white/15 bg-black/20 p-3" />
          <button className="rounded-xl bg-danger px-4 py-3 font-bold md:col-span-2">Save question</button>
        </form>
      </div>
    </section>
  );
}
