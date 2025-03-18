import Link from "next/link";

import { CreationCard } from "@/lib/mock-data";

const statusAccent: Record<CreationCard["status"], string> = {
  queued: "text-[#ffd27a] border-[#ffd27a]/30 bg-[#ffd27a]/10",
  running: "text-[#68d7c0] border-[#68d7c0]/30 bg-[#68d7c0]/10",
  ready: "text-[#f07c52] border-[#f07c52]/30 bg-[#f07c52]/10",
  failed: "text-[#ff8f8f] border-[#ff8f8f]/30 bg-[#ff8f8f]/10"
};

export function CreationGrid({ items }: { items: CreationCard[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{item.visibility}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs ${statusAccent[item.status]}`}>{item.status}</div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">{item.prompt}</p>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <span>{item.assetCount} assets</span>
            <span>{item.updatedAt}</span>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/share/${item.title.toLowerCase().replaceAll(" ", "-")}-${item.id.slice(0, 4)}`}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Preview share
            </Link>
            <button className="rounded-full border border-[#68d7c0]/30 bg-[#68d7c0]/10 px-4 py-2 text-sm text-[#b6fff0]">
              Poll job
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
