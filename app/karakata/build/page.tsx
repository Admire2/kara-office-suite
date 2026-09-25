"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuildPage() {
  const router = useRouter();
  const [sells, setSells] = useState("");
  const [vibe, setVibe] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const inp = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white";

  const generate = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/karakata/storebuild", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate", sells, vibe, city, country }) });
      const j = await r.json();
      if (j.ok) setDraft(j.draft); else setMsg(j.error || "Generation failed");
    } catch (e) { setMsg("Network error"); }
    setBusy(false);
  };

  const publish = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/karakata/storebuild", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish", draft, email }) });
      const j = await r.json();
      if (j.ok && j.seller_id) router.push("/karakata/seller/" + j.seller_id);
      else setMsg(j.error || "Publish failed");
    } catch (e) { setMsg("Network error"); }
    setBusy(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <Link href="/karakata" className="text-sm text-cyan-400 hover:underline">← Back to market</Link>
      <h1 className="mt-3 text-3xl font-bold">🏗️ KaraKata StoreBuilder</h1>
      <p className="mt-1 text-sm text-slate-400">Describe your business - our AI designs your storefront, writes your copy, and stocks 5 starter products.</p>

      {!draft && (
        <div className="mt-6 max-w-xl space-y-3">
          <input className={inp} value={sells} onChange={(e) => setSells(e.target.value)} placeholder="What do you sell? e.g. handwoven aso oke belts and adire scarves" />
          <input className={inp} value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="Store vibe? e.g. royal, earthy, luxury, playful" />
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <input className={inp} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
          </div>
          <input className={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email (for store ownership)" />
          <button onClick={generate} disabled={busy} className="w-full rounded-lg bg-emerald-600 py-3 font-bold hover:bg-emerald-500 disabled:opacity-50">{busy ? "Designing your store..." : "✨ Design my store with AI"}</button>
          {msg && <p className="text-sm text-red-400">{msg}</p>}
        </div>
      )}

      {draft && (
        <div className="mt-6 max-w-3xl">
          <div className="rounded-2xl p-6" style={{ background: draft.theme_color || "#0f766e" }}>
            <p className="text-2xl font-bold text-white">{draft.banner_headline}</p>
            <p className="mt-1 text-white/90">{draft.tagline}</p>
            <p className="mt-2 text-sm text-white/70">{draft.shop_name} · {city}, {country}</p>
          </div>
          <p className="mt-4 text-sm text-slate-300">{draft.about_text}</p>
          <div className="mt-3 flex gap-2">{(draft.categories || []).map((c: string) => (<span key={c} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{c}</span>))}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(draft.products || []).map((p: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="font-bold">{p.title}</p>
                <p className="mt-1 text-xs text-slate-400">{p.description}</p>
                <p className="mt-2 font-bold text-emerald-400">${Number(p.price_usd || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setDraft(null)} className="rounded-lg border border-slate-700 px-5 py-3 text-sm hover:border-slate-500">↺ Redesign</button>
            <button onClick={publish} disabled={busy} className="flex-1 rounded-lg bg-emerald-600 py-3 font-bold hover:bg-emerald-500 disabled:opacity-50">{busy ? "Publishing..." : "🚀 Publish my store live"}</button>
          </div>
          {msg && <p className="mt-2 text-sm text-red-400">{msg}</p>}
        </div>
      )}
    </main>
  );
}