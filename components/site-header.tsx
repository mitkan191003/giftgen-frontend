import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/studio", label: "Studio" },
  { href: "/creations", label: "Creations" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(5,16,22,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ffd27a]/50 bg-[linear-gradient(160deg,#f07c52,#edb94e)] text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(240,124,82,0.32)]">
            GG
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-[#ffd27a]">GiftGen</p>
            <p className="text-sm text-slate-300">Prompt to object to shareable gift</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/studio"
          className="rounded-full border border-[#68d7c0]/40 bg-[#68d7c0]/10 px-4 py-2 text-sm font-medium text-[#b6fff0] transition hover:bg-[#68d7c0]/20"
        >
          Open Studio
        </Link>
      </div>
    </header>
  );
}
