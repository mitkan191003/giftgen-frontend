import { PromptLab } from "@/components/prompt-lab";

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[#ffd27a]">Studio</p>
        <h1 className="mt-3 text-5xl font-semibold text-white">Design the conversation before the mesh exists.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          The studio is where a rough idea becomes a structured prompt, a durable job, and eventually a
          shareable artifact bundle. This page uses mock state now, but it is intentionally shaped around
          the backend entities and async job model.
        </p>
      </section>

      <PromptLab />
    </main>
  );
}
