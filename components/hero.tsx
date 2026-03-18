import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(104,215,192,0.18),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(240,124,82,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(255,210,122,0.12),transparent_45%)]" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#ffd27a]">
            Prompt-guided 3D gifting
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] text-white md:text-7xl">
            Turn a single idea into a gift people can generate, keep, and pass along.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            GiftGen pairs guided prompt refinement with long-running 3D generation, a queue you can
            trust, and share pages that feel more like a gallery opening than a file dump.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/studio"
              className="rounded-full bg-[linear-gradient(135deg,#f07c52,#edb94e)] px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(240,124,82,0.35)] transition hover:-translate-y-0.5"
            >
              Start a gift
            </Link>
            <Link
              href="/creations"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse the queue
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="rounded-[1.5rem] border border-[#68d7c0]/20 bg-[#071a20] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.26em] text-[#68d7c0]">Generation flight deck</p>
              <div className="rounded-full border border-[#68d7c0]/30 px-3 py-1 text-xs text-[#b6fff0]">
                3 jobs active
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["Prompt review", "OpenAI refines the intent into a generation-safe prompt."],
                ["Queue orchestration", "The backend records a durable job and dispatches the worker."],
                ["Modal render", "The worker stores finished assets and exposes signed downloads."]
              ].map(([title, text], index) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ffd27a]/30 bg-[#ffd27a]/10 text-sm text-[#ffd27a]">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
