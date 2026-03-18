import { CreationGrid } from "@/components/creation-grid";
import { creations } from "@/lib/mock-data";

export default function CreationsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#68d7c0]">Creations</p>
          <h1 className="mt-3 text-5xl font-semibold text-white">A queue, not a spinner.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            The product should preserve clear status transitions for every creation: queued, running, ready,
            or failed with context.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
          Durable source of truth lives in Postgres. Assets live in S3.
        </div>
      </div>

      <CreationGrid items={creations} />
    </main>
  );
}
