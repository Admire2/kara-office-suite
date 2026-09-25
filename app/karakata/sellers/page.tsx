import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
export const dynamic = "force-dynamic";

function stars(n: number) { const f = Math.round(n); return "★".repeat(f) + "☆".repeat(5 - f); }

export default async function SellersPage() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: sellers } = await sb.from("kara_sellers").select("*").order("avg_rating", { ascending: false });
  const list = sellers || [];
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <Link href="/karakata" className="text-sm text-cyan-400 hover:underline">← Back to market</Link>
      <h1 className="mt-3 text-3xl font-bold">KaraKata Sellers</h1>
      <p className="mt-1 text-sm text-slate-400">Ranked by verified-purchase ratings.</p><p className="mt-2 text-sm"><a className="text-emerald-400 underline" href="/karakata/build">🏗️ Open your own store free with AI StoreBuilder →</a></p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((s: any, i: number) => (
          <Link key={s.id} href={"/karakata/seller/" + s.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-emerald-500">
            <p className="font-bold">{i + 1}. {s.shop_name}</p>
            <p className="mt-1 text-yellow-400">{stars(Number(s.avg_rating || 0))} <span className="text-sm text-slate-300">{Number(s.avg_rating || 0).toFixed(1)} · {s.review_count || 0} reviews</span></p>
          </Link>
        ))}
      </div>
    </main>
  );
}