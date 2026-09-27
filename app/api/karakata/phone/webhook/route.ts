import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const b: any = await req.json().catch(() => ({}));
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const raw = String(b.message || b.type || b.event || "unknown");
    let event = raw;
    if (raw === "status_update") event = String(b.status || "") === "started" ? "call_started" : (String(b.status || "") === "ended" ? "call_ended" : raw);
    if (raw === "end-of-call-report") event = "call_ended";
    if (raw === "transcript" && String(b.type || "") === "partial") event = "ignore_partial";

    const callId = String(b.callId || (b.call && b.call.id) || b.id || "");
    const rawPhone = String(b.phoneNumber || b.customerNumber || b.to || b.from || "");
    
    let tenantId = "karakata";
    if (rawPhone) {
      const { data: tenantMap } = await sb.from("kara_tenants").select("id").eq("phone_number", rawPhone).single();
      if (tenantMap && tenantMap.id) tenantId = tenantMap.id;
    }

    if (event === "call_started") {
      await sb.from("kara_calls").insert({
        direction: String(b.direction || "inbound"),
        phone_number: rawPhone,
        provider_call_id: callId,
        campaign: String(b.campaign || "receptionist"),
        status: "active",
        context: b.context || (b.call && b.call.assistantOverrides && b.call.assistantOverrides.variableValues) || {},
        tenant_id: tenantId
      });
      return NextResponse.json({ ok: true });
    }

    if (event === "transcript" || event === "user_message" || event === "bot_message") {
      let call: any = null;
      try {
        const res = await sb.from("kara_calls").select("*").eq("provider_call_id", callId).order("id", { ascending: false }).limit(1).single();
        call = res.data;
      } catch {}

      const role = String(b.role || (event === "bot_message" ? "bot" : "user"));
      const text = String(b.transcript || b.text || "");

      if (call) {
        await sb.from("kara_calls").update({
          transcript: String(call.transcript || "") + "\n" + role + ": " + text
        }).eq("id", call.id);
      } else if (callId) {
        await sb.from("kara_calls").insert({
          provider_call_id: callId,
          phone_number: rawPhone,
          direction: String(b.direction || "inbound"),
          status: "active",
          transcript: role + ": " + text,
          tenant_id: tenantId
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (event === "call_ended" || event === "end") {
      await sb.from("kara_calls").update({ status: "completed" }).eq("provider_call_id", callId);
      
      try {
        const { data: doneCall } = await sb.from("kara_calls").select("*").eq("provider_call_id", callId).order("id", { ascending: false }).limit(1).single();
        if (doneCall && doneCall.transcript) {
          await fetch(new URL("/api/karakata/crm/extract", req.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_id: doneCall.tenant_id || tenantId,
              call_id: callId,
              transcript: doneCall.transcript,
              caller_phone: doneCall.phone_number
            })
          });
        }
      } catch (e) {
        console.error("CRM extract failed", e);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: event });
  } catch (e: any) {
    console.error("Webhook error", e);
    return NextResponse.json({ ok: false, error: String(e.message) }, { status: 500 });
  }
}