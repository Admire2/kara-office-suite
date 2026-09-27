import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const vapiKey = process.env.VAPI_API_KEY;
  if (!vapiKey) return NextResponse.json({ ok: false, error: "VAPI_API_KEY missing in env" }, { status: 500 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const r = await fetch("https://api.vapi.ai/call?limit=25", { headers: { Authorization: "Bearer " + vapiKey } });
  if (!r.ok) return NextResponse.json({ ok: false, error: "vapi list failed: " + r.status }, { status: 502 });
  const calls: any[] = await r.json();

  const ingested: any[] = [];
  for (const c of calls) {
    try {
      const callId = String(c.id || "");
      if (!callId || String(c.status || "") !== "ended") continue;
      const transcript = String(c.transcript || "");
      if (!transcript) continue;

      const { data: existing } = await sb.from("kara_calls").select("id").eq("provider_call_id", callId).limit(1);
      if (existing && existing.length > 0) continue;

      let tenantId = "karakata";
      const pnId = String(c.phoneNumberId || "");
      if (pnId) {
        const { data: poolRow } = await sb.from("kara_phone_pool").select("tenant_id").eq("vapi_phone_id", pnId).limit(1);
        if (poolRow && poolRow[0] && poolRow[0].tenant_id) tenantId = String(poolRow[0].tenant_id);
      }

      const customerNumber = String((c.customer && c.customer.number) || "");
      await sb.from("kara_calls").insert({
        direction: String(c.type || "") === "outboundPhoneCall" ? "outbound" : "inbound",
        phone_number: customerNumber,
        provider_call_id: callId,
        campaign: "live",
        status: "completed",
        transcript: transcript,
        outcome: String(c.endedReason || ""),
        context: { cost: c.cost || 0, startedAt: c.startedAt, endedAt: c.endedAt, recordingUrl: c.recordingUrl || "" },
        tenant_id: tenantId
      });

      const ex = await fetch(new URL("/api/karakata/crm/extract", "https://founderpilot-theta.vercel.app"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, call_id: callId, transcript: transcript, caller_phone: customerNumber })
      });
      const exj: any = await ex.json().catch(() => ({}));
      ingested.push({ call_id: callId, contact_code: exj.contact_code || null, completeness: exj.completeness || 0 });
    } catch {}
  }
  return NextResponse.json({ ok: true, ingested: ingested.length, details: ingested });
}