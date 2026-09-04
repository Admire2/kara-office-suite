import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["greatmind20+webhook@gmail.com", "greatmind20+live@gmail.com"];

export async function POST(req: Request) {
  try {
    const { action, email, credits, reason } = await req.json();
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    const svcKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, svcKey);
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    if (!ADMIN_EMAILS.includes(user.email || "")) return NextResponse.json({ error: "Unauthorized: " + user.email }, { status: 403 });

    const etNow = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });

    if (action === "adjust") {
      const { data: bal, error: selErr } = await supabase.from("credits").select("balance").eq("email", email).maybeSingle();
      if (selErr) return NextResponse.json({ error: "Select failed: " + selErr.message }, { status: 500 });
      
      const current = bal?.balance || 0;
      const newBalance = current + (credits || 0);
      
      if (bal) {
        const { error: updErr } = await supabase.from("credits").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("email", email);
        if (updErr) return NextResponse.json({ error: "Update failed: " + updErr.message }, { status: 500 });
      } else {
        const { error: insErr } = await supabase.from("credits").insert({ email, balance: newBalance, plan: "manual" });
        if (insErr) return NextResponse.json({ error: "Insert failed: " + insErr.message }, { status: 500 });
      }
      
      try { await supabase.from("credit_usage").insert({ email, action: "admin_adjust", credits, timestamp_et: etNow, suite: "admin", ip: "admin", user_agent: "Admin: " + user.email + " | " + (reason || "testing") }); } catch (e) {}
      return NextResponse.json({ success: true, oldBalance: current, newBalance });
    }

    if (action === "get_all_usage") {
      const { data, error } = await supabase.from("credit_usage").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ usage: data || [] });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}