"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/validator", label: "Idea Validator", icon: "💡", highlight: false },
  { href: "/business-model", label: "Business Model", icon: "📊", highlight: false },
  { href: "/persona", label: "Customer Persona", icon: "👤", highlight: false },
  { href: "/landing-page", label: "Landing Page Copy", icon: "✍️", highlight: false },
  { href: "/pricing", label: "Pricing", icon: "💎", highlight: false },
  { href: "/auth", label: "Sign in / Account", icon: "🔐", highlight: false },
  { href: "/team", label: "My Team", icon: "👥", highlight: false },
  { href: "/contact", label: "Contact & Support", icon: "📬", highlight: false },
  { href: "/suite", label: "Business Suite", icon: "⭐", highlight: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-900/50 p-6 hidden md:block">
      <div className="mb-8">
        <Link href="/" className="block">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">FounderPilot</p>
          <h1 className="text-xl font-bold mt-1">AI Suite</h1>
        </Link>
        </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === link.href
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : link.highlight 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/10" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={link.highlight ? "animate-pulse text-lg" : ""}>{link.icon}</span>
            <span>{link.label}</span>
            {link.highlight && (
              <span className="ml-auto text-[10px] font-bold bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded-full animate-pulse">
                NEW
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="mt-8 pt-8 border-t border-white/10">
        <Link href="/suite/engineering" className="mt-3 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-500/20"><span>🛠️</span><span>Engineering Suite</span><span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">NEW</span></Link>
<Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
           ← Back to Home
         </Link>
      </div>
    </aside>
  );
}