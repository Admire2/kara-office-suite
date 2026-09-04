import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["greatmind20+webhook@gmail.com", "greatmind20+live@gmail.com"];

export async function POST(req: Request) {
  try {
    const { action, email, credits, reason, passcode } = await req.json();
    const svcKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, svcKey);
    const ADMIN_PASS = process.env.ADMIN_PASSCODE || "founder2026";

    let authorized = passcode === ADMIN_PASS;
    if (!authorized) {
      const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
      if (token) { const { data: { user } } = await supabase.auth.getUser(token); authorized = !!user && ADMIN_EMAILS.includes(user.email || ""); }
    }
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const etNow = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });

    if (action === "adjust") {
      const { data: bal } = await supabase.from("credits").select("balance, pack_balance").eq("email", email).maybeSingle();
      const current = bal?.pack_balance || 0;
      const newBalance = current + (credits || 0);
      if (bal) await supabase.from("credits").update({ pack_balance: newBalance, updated_at: new Date().toISOString() }).eq("email", email);
      else await supabase.from("credits").insert({ email, pack_balance: newBalance, plan: "manual" });
      try { await supabase.from("credit_usage").insert({ email, action: "admin_adjust", credits, timestamp_et: etNow, suite: "admin", ip: "admin", user_agent: "Admin | " + (reason || "testing") }); } catch (e) {}
      return NextResponse.json({ success: true, oldBalance: current, newBalance, version: "v2-pack" });
    }

    if (action === "get_all_usage") {
      const { data } = await supabase.from("credit_usage").select("*").order("created_at", { ascending: false }).limit(100);
      return NextResponse.json({ usage: data || [] });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}