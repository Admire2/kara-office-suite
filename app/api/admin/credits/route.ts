import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["greatmind20+webhook@gmail.com", "greatmind20+live@gmail.com"];

export async function POST(req: Request) {
  const { action, email, credits, reason } = await req.json();
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const etNow = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });

  if (action === "adjust") {
    const { data: bal } = await supabase.from("credits").select("balance").eq("email", email).single();
    const current = bal?.balance || 0;
    const newBalance = current + (credits || 0);
    if (bal) await supabase.from("credits").update({ balance: newBalance }).eq("email", email);
    else await supabase.from("credits").insert({ email, balance: newBalance });
    try { await supabase.from("credit_usage").insert({ email, action: "admin_adjust", credits, timestamp_et: etNow, suite: "admin", ip: "admin", user_agent: "Admin: " + user.email + " | " + (reason || "testing") }); } catch (e) {}
    return NextResponse.json({ success: true, oldBalance: current, newBalance });
  }

  if (action === "get_all_usage") {
    const { data } = await supabase.from("credit_usage").select("*").order("created_at", { ascending: false }).limit(100);
    return NextResponse.json({ usage: data || [] });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}