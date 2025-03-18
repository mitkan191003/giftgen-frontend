import Link from "next/link";

import { CreationGrid } from "@/components/creation-grid";
import { Hero } from "@/components/hero";
import { creations } from "@/lib/mock-data";

const principles = [
  {
    title: "Asynchronous by design",
    body: "Users should never wait on a browser request for the full render. Jobs exist independently and survive refreshes."
  },
  {
    title: "Private assets first",
    body: "Meshes stay private in object storage and only become downloadable through signed URLs or explicit share intent."
  },
  {
    title: "IaC all the way down",
    body: "Cluster add-ons, IAM wiring, ingress, and cleanup triggers should all come from Terraform and Helm rather than manual kubectl steps."
  }
];

export default function HomePage() {
  return (
    <main className="pb-20">
      <Hero />

      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <article key={principle.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#ffd27a]">Principle</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{principle.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#68d7c0]">Recent creations</p>
            <h2 className="mt-2 text-4xl font-semibold text-white">The queue should feel alive.</h2>
          </div>
          <Link
            href="/creations"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10"
          >
            View all creations
          </Link>
        </div>
        <CreationGrid items={creations} />
      </section>
    </main>
  );
}
