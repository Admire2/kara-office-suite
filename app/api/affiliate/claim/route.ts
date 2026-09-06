import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ ok: false });
    const svcKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, svcKey);
    const etNow = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
    const { data: existing } = await supabase.from("referrals").select("id").eq("referred_email", email).limit(1);
    if (existing && existing.length > 0) return NextResponse.json({ ok: true, already: true });
    await supabase.from("referrals").insert({ affiliate_code: code, referred_email: email, status: "signed_up", timestamp_et: etNow });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}