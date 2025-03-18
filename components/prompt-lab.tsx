"use client";

import { useState } from "react";

import { studioMessages } from "@/lib/mock-data";

const queueStates = [
  { label: "Guardrails", value: "Passed profanity and injection checks" },
  { label: "Prompt shape", value: "Single centered object, clean silhouette" },
  { label: "Generation", value: "Queued for Modal worker pickup" }
];

export function PromptLab() {
  const [prompt, setPrompt] = useState("A lacquered fox figurine with a satin ribbon loop.");
  const [visibility, setVisibility] = useState<"private" | "unlisted" | "public">("unlisted");

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#68d7c0]">Chat to creation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Prompt lab</h2>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">Draft thread</div>
        </div>

        <div className="mt-6 space-y-4">
          {studioMessages.map((message) => (
            <article
              key={message.id}
              className={`rounded-3xl border p-4 ${
                message.role === "assistant"
                  ? "border-[#68d7c0]/25 bg-[#68d7c0]/8"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{message.role}</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">{message.content}</p>
            </article>
          ))}
        </div>

        <label className="mt-6 block text-sm text-slate-200">
          Final prompt
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-3 h-40 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-white outline-none transition focus:border-[#ffd27a]/45"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["private", "unlisted", "public"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                visibility === option
                  ? "bg-[#ffd27a] text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ffd27a]">Generation queue</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">What the backend owns</h2>
          </div>
          <div className="rounded-full border border-[#ffd27a]/25 bg-[#ffd27a]/10 px-3 py-1 text-xs text-[#ffe7a9]">
            Visibility: {visibility}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {queueStates.map((state) => (
            <div key={state.label} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{state.label}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{state.value}</p>
                </div>
                <div className="mt-1 h-3 w-3 rounded-full bg-[#68d7c0] shadow-[0_0_18px_rgba(104,215,192,0.8)]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/15 bg-black/10 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Why this matters</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Generation can take minutes. The product should treat that as a first-class state with
            durable jobs, resumable polling, and share links that only appear after artifacts are stored.
          </p>
        </div>
      </section>
    </div>
  );
}
