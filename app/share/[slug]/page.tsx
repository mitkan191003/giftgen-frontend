import Link from "next/link";
import { notFound } from "next/navigation";

import { publicShare } from "@/lib/mock-data";

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== publicShare.slug) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#ffd27a]">Public share</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">{publicShare.title}</h1>
          <p className="mt-4 text-lg text-slate-300">By {publicShare.ownerDisplayName}</p>
          <p className="mt-8 max-w-2xl text-sm leading-8 text-slate-200">{publicShare.prompt}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              Share type: {publicShare.shareType}
            </div>
            <div className="rounded-full border border-[#68d7c0]/30 bg-[#68d7c0]/10 px-4 py-2 text-sm text-[#b6fff0]">
              Assets: {publicShare.assets.length}
            </div>
          </div>
        </div>

        <aside className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#68d7c0]">Asset contract</p>
          <div className="mt-6 space-y-4">
            {publicShare.assets.map((asset) => (
              <article key={asset.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm font-medium text-white">{asset.assetType}</p>
                <p className="mt-2 break-all text-xs leading-6 text-slate-400">{asset.storageKey}</p>
                <p className="mt-4 text-sm text-slate-300">{asset.mimeType}</p>
              </article>
            ))}
          </div>

          <Link
            href="/studio"
            className="mt-8 inline-flex rounded-full bg-[linear-gradient(135deg,#f07c52,#edb94e)] px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Create your own gift
          </Link>
        </aside>
      </section>
    </main>
  );
}
