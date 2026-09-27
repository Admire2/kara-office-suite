import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b: any = await req.json().catch(() => ({}));
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const event = String(b.type || b.event || "unknown");
  const callId = String(b.callId || b.id || "");
  const phone = String(b.phoneNumber || b.customerNumber || b.to || "");

  if (event === "call_started" || event === "start" || event === "conversation.start") {
    await sb.from("kara_calls").insert({
      direction: String(b.direction || "inbound"),
      phone_number: phone,
      provider_call_id: callId,
      campaign: String(b.campaign || "receptionist"),
      status: "active",
      context: b.context || {}
    });
    return NextResponse.json({ ok: true });
  }

  if (event === "transcript" || event === "message" || event === "user_message") {
    const { data: call } = await sb.from("kara_calls").select("*").eq("provider_call_id", callId).order("id", { ascending: false }).limit(1).single().catch(() => ({ data: null }));
    const mode = (call && call.campaign === "webinar_followup") ? "outbound_followup" : "inbound";
    const brainRes = await fetch(new URL("/api/karakata/phone/brain", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: mode, transcript: String(b.transcript || b.text || ""), context: (call && call.context) || {} })
    });
    const bj: any = await brainRes.json().catch(() => ({}));
    if (call) {
      await sb.from("kara_calls").update({
        transcript: String(call.transcript || "") + "\n" + String(b.role || "user") + ": " + String(b.transcript || b.text || ""),
        outcome: (bj && bj.action && bj.action.action) || call.outcome,
        action_taken: (bj && bj.action) || call.action_taken
      }).eq("id", call.id);
    }
    return NextResponse.json({ ok: true, reply: (bj && bj.reply) || "", action: (bj && bj.action) || null });
  }

  if (event === "call_ended" || event === "end" || event === "conversation.end") {
    await sb.from("kara_calls").update({ status: "completed" }).eq("provider_call_id", callId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event });
}