import { KAWS_AGENTS } from "@/lib/kaws-agents";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const b: any = await req.json().catch(() => ({}));
  const def = KAWS_AGENTS.find(a => a.id === b.agent);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown agent" }, { status: 404 });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "Missing OPENROUTER_API_KEY in Vercel environment" }, { status: 500 });

  let model = "qwen/qwen-2.5-72b-instruct";
  let messages: any[];
  const rawInput = String(b.input || "");

  if (def.vision && /^https?:\/\//.test(rawInput.trim())) {
    model = "qwen/qwen2.5-vl-72b-instruct";
    messages = [
      { role: "system", content: def.system },
      { role: "user", content: [ { type: "text", text: "Analyze this property photo." }, { type: "image_url", image_url: { url: rawInput.trim() } } ] }
    ];
  } else {
    const userInput = def.fields ? JSON.stringify(b.fields || {}) : rawInput;
    messages = [ { role: "system", content: def.system }, { role: "user", content: userInput } ];
  }

  let out: any = { result: "Model returned no content." };
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature: 0.4 })
    });
    const j: any = await r.json();
    const text = j?.choices?.[0]?.message?.content || "";
    try { const m = text.match(/\{[\s\S]*\}/); out = m ? JSON.parse(m[0]) : { result: text }; } catch { out = { result: text }; }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "LLM call failed: " + e.message }, { status: 502 });
  }

  if (def.id === "investor" && b.fields) {
    const p = Number(b.fields.purchase_price) || 0;
    const rh = Number(b.fields.rehab_cost) || 0;
    const arv = Number(b.fields.arv) || 0;
    const rent = Number(b.fields.monthly_rent) || 0;
    const mao = arv * 0.7 - rh;
    const onePct = p + rh > 0 ? (rent / (p + rh)) * 100 : 0;
    const gross = p + rh > 0 ? ((rent * 12) / (p + rh)) * 100 : 0;
    out.metrics = {
      max_allowable_offer: Math.round(mao),
      one_percent_rule: onePct.toFixed(2) + "%",
      gross_yield: gross.toFixed(2) + "%",
      verdict: p <= mao ? "DEAL - at or below MAO" : "OVER MAO by $" + Math.round(p - mao)
    };
  }

  return NextResponse.json({ ok: true, agent: def.id, output: out });
}