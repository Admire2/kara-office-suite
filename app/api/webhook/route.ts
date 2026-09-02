import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const PACK_BY_AMOUNT: Record<number, { pack: string; credits: number }> = {
  1000: { pack: "starter", credits: 150 },
  1900: { pack: "plus", credits: 300 },
  5900: { pack: "pro", credits: 1000 },
  19900: { pack: "studio", credits: 4000 },
};

export async function GET() {
  return NextResponse.json({ ok: true, hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET, hasKey: !!process.env.STRIPE_SECRET_KEY });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!secret || !key) return NextResponse.json({ error: "missing keys" }, { status: 500 });
    const stripe = new Stripe(key);
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret);
    } catch (e: any) {
      return NextResponse.json({ error: "bad signature", detail: String((e && e.message) || e) }, { status: 400 });
    }
    if (event.type !== "checkout.session.completed") return NextResponse.json({ ok: true, ignored: event.type });

    const session: any = event.data.object;
    const email = String(session.customer_details?.email || session.customer_email || "").toLowerCase();
    let pack = String(session.metadata?.pack || "");
    let credits = Number(session.metadata?.credits || 0);

    if (!pack || !credits) {
      const hit = PACK_BY_AMOUNT[Number(session.amount_total || 0)];
      if (hit) { pack = pack || hit.pack; credits = credits || hit.credits; }
    }
    if (!email || !credits) return NextResponse.json({ error: "cannot map session", email, credits }, { status: 422 });

    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!);
    const { data } = await sb.from("credits").select("*").eq("email", email).single();
    if (!data) {
      await sb.from("credits").insert({ email, balance: 20, pack_balance: credits, plan: "free" });
    } else {
      await sb.from("credits").update({ pack_balance: (Number(data.pack_balance) || 0) + credits }).eq("email", email);
    }
    return NextResponse.json({ ok: true, email, pack, credits });
  } catch (e: any) {
    return NextResponse.json({ error: "crash", detail: String((e && e.message) || e) }, { status: 500 });
  }
}