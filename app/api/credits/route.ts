import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const ALLOW: any = { pro: 20, team: 100, enterprise: 800 };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") || "").toLowerCase();
  if (!email) return NextResponse.json({ error: "no email" }, { status: 400 });
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  let { data } = await sb.from("credits").select("*").eq("email", email).single();
  if (!data) { const ins = await sb.from("credits").insert({ email: email, balance: 20, pack_balance: 0, plan: "free" }).select().single(); data = ins.data; }
  const plan = data.plan || "free";
  const allowance = ALLOW[plan] || 0;
  const last = data.last_refresh ? new Date(data.last_refresh).getTime() : 0;
  if (allowance > 0 && Date.now() - last >= 30 * 86400000) {
    await sb.from("credits").update({ balance: allowance, last_refresh: new Date().toISOString() }).eq("email", email);
    data.balance = allowance;
  }
  const monthly = data.balance || 0; const pack = data.pack_balance || 0;
  return NextResponse.json({ balance: monthly + pack, monthly: monthly, pack: pack, plan: plan });
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase();
  const c = Number(body.cost) || 10;
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  let { data } = await sb.from("credits").select("*").eq("email", email).single();
  if (!data) { const ins = await sb.from("credits").insert({ email: email, balance: 20, pack_balance: 0, plan: "free" }).select().single(); data = ins.data; }
  const plan = data.plan || "free";
  const allowance = ALLOW[plan] || 0;
  const last = data.last_refresh ? new Date(data.last_refresh).getTime() : 0;
  let monthly = data.balance || 0; let pack = data.pack_balance || 0; let stamp = data.last_refresh;
  if (allowance > 0 && Date.now() - last >= 30 * 86400000) { monthly = allowance; stamp = new Date().toISOString(); }
  if (monthly + pack < c) return NextResponse.json({ error: "insufficient", balance: monthly + pack }, { status: 402 });
  const fromMonthly = Math.min(monthly, c);
  monthly -= fromMonthly; pack -= (c - fromMonthly);
  await sb.from("credits").update({ balance: monthly, pack_balance: pack, last_refresh: stamp }).eq("email", email);
  return NextResponse.json({ newBalance: monthly + pack, monthly: monthly, pack: pack });
}