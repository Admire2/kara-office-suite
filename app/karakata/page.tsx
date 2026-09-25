"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const TAXONOMY: any[] = [
  { name: "Fashion & Clothing", icon: "👗" }, { name: "Jewelry & Gems", icon: "💍" },
  { name: "Fabrics & Textiles", icon: "🧵" }, { name: "Art & Crafts", icon: "🎨" },
  { name: "Home & Living", icon: "🏠" }, { name: "Beauty & Care", icon: "🧴" },
  { name: "Electronics", icon: "📱" }, { name: "Food & Groceries", icon: "🍲" },
  { name: "Books & Media", icon: "📚" }, { name: "Toys & Games", icon: "🧸" },
  { name: "Sports & Outdoors", icon: "⚽" }, { name: "Automotive", icon: "🚗" },
  { name: "Health & Wellness", icon: "🌿" }, { name: "Services", icon: "🛠️" },
];

function useCountdown() {
  const [left, setLeft] = useState("00:00:00");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setLeft(String(Math.floor(s / 3600)).padStart(2, "0") + ":" + String(Math.floor((s % 3600) / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export default function Market() {
  const [items, setItems] = useState<any[]>([]);
  const [cat, setCat] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const left = useCountdown();

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data } = await sb.from("kara_listings").select("*");
        setItems((data || []).filter((l: any) => !l.status || l.status === "active"));
      } catch (e) {}
      try { setCartCount(JSON.parse(localStorage.getItem("kara_cart") || "[]").reduce((a: number, c: any) => a + (c.qty || 1), 0)); } catch (e) {}
    })();
  }, []);

  const priceOf = (l: any) => Number(l.price_usd != null ? l.price_usd : l.price) || 0;
  const deals = items.filter((l: any) => Number(l.compare_at_usd) > priceOf(l));
  const shown = cat ? items.filter((l: any) => l.category === cat) : items;

  const add = (l: any) => {
    const p = priceOf(l);
    const item = { id: l.id, listing_id: l.id, title: l.title, price_usd: p, price: p, image_url: l.image_url, seller_id: l.seller_id, qty: 1, it: { title: l.title, price_usd: p, price: p, image_url: l.image_url, seller_id: l.seller_id } };
    const cart = JSON.parse(localStorage.getItem("kara_cart") || "[]");
    const ex = cart.find((c: any) => String(c.id) === String(l.id));
    if (ex) ex.qty = (ex.qty || 1) + 1; else cart.push(item);
    localStorage.setItem("kara_cart", JSON.stringify(cart));
    setCartCount(cart.reduce((a: number, c: any) => a + (c.qty || 1), 0));
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="bg-slate-900 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xl font-bold">KaraKata</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/karakata/sellers" className="hover:text-amber-300">Sellers</Link>
            <Link href="/karakata/build" className="font-bold text-amber-400 hover:text-amber-300">🏗️ Build my store free</Link>
            <Link href="/karakata/studio" className="hover:text-amber-300">Studio</Link>
            <Link href="/karakata/checkout" className="rounded bg-amber-400 px-4 py-2 font-bold text-slate-900 hover:bg-amber-300">🛒 Cart ({cartCount})</Link>
          </nav>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
          <button onClick={() => setCat(null)} className={"whitespace-nowrap rounded-full px-4 py-1 text-sm font-bold " + (!cat ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200")}>All</button>
          {TAXONOMY.map((t: any) => (
            <button key={t.name} onClick={() => setCat(cat === t.name ? null : t.name)} className={"whitespace-nowrap rounded-full px-4 py-1 text-sm font-bold " + (cat === t.name ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200")}>{t.icon} {t.name}</button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 p-4 text-white">
          <p className="text-lg font-bold">KaraKata Haul — Today only! Ends in <span className="font-mono">{left}</span></p>
          <p className="text-sm">Escrow-protected payments · Verified-purchase reviews · Free AI storefront builder</p>
        </div>

        {deals.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold">⚡ Rolling deals — ends in {left}</h2>
            <div className="mt-3 flex gap-4 overflow-x-auto pb-3">
              {deals.map((l: any) => {
                const p = priceOf(l);
                const pct = Math.round((1 - p / Number(l.compare_at_usd)) * 100);
                return (
                  <div key={l.id} className="w-56 shrink-0 rounded-lg border border-slate-200 p-3 shadow-sm">
                    {l.image_url ? (<img src={l.image_url} alt="" className="h-32 w-full rounded object-cover" />) : (<div className="flex h-32 items-center justify-center rounded bg-slate-100 text-3xl">📦</div>)}
                    <p className="mt-2 text-xs font-bold text-red-600">{pct}% off <span className="rounded bg-red-600 px-1 py-0.5 text-[10px] text-white">Limited time deal</span></p>
                    <p className="mt-1 text-lg font-bold">${p.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Typical: <span className="line-through">${Number(l.compare_at_usd).toFixed(2)}</span></p>
                    <p className="mt-1 line-clamp-2 text-xs">{l.title}</p>
                    <button onClick={() => add(l)} className="mt-2 w-full rounded-full bg-amber-400 py-1 text-xs font-bold hover:bg-amber-300">Add to cart</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-lg font-bold">{cat ? cat : "All products & services"}</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((l: any) => (
              <div key={l.id} className="rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md">
                {l.image_url ? (<img src={l.image_url} alt="" className="h-40 w-full rounded object-cover" />) : (<div className="flex h-40 items-center justify-center rounded bg-slate-100 text-4xl">📦</div>)}
                <p className="mt-2 text-lg font-bold">${priceOf(l).toFixed(2)}</p>
                <p className="mt-1 line-clamp-2 text-sm">{l.title}</p>
                <p className="mt-1 text-xs text-slate-500">{l.category || "Uncategorized"}</p>
                <button onClick={() => add(l)} className="mt-2 w-full rounded-full bg-amber-400 py-1.5 text-sm font-bold hover:bg-amber-300">Add to cart</button>
              </div>
            ))}
            {shown.length === 0 && (
              <div className="col-span-2 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center md:col-span-4">
                <p className="font-bold">No listings here yet.</p>
                <Link href="/karakata/build" className="mt-3 inline-block rounded-lg bg-amber-400 px-5 py-2 font-bold text-slate-900 hover:bg-amber-300">🏗️ Be the first - build your store free</Link>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>Selling on Amazon, Etsy or Shopify? <Link className="text-emerald-600 underline" href="/karakata/build">Photograph your shop - KaraKata builds your storefront free</Link></p>
        </footer>
      </div>
    </main>
  );
}