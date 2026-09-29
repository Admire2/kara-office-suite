import { KAWS_AGENTS } from "@/lib/kaws-agents";
import { rentcastLeads, rentcastLookup } from "@/lib/property-data";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const TRACK_SUFFIX: Record<string, string> = {
  investor: "\n\nTRACK: UNLICENSED REAL ESTATE INVESTOR. Advise strictly from public records, wholesale/assignment strategies and MAO/ARV math. Never reference MLS-only data and never suggest activities requiring a license.",
  agent: "\n\nTRACK: LICENSED REAL ESTATE AGENT. You may reference MLS comps, CMA standards, IDX feeds and fiduciary duties. Keep all advice compliant with state license law and fair-housing rules."
};

export async function POST(req: Request) {
  const b: any = await req.json().catch(() => ({}));
  const def = KAWS_AGENTS.find(a => a.id === b.agent);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown agent" }, { status: 404 });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "Missing OPENROUTER_API_KEY" }, { status: 500 });

  const track = b.track === "agent" ? "agent" : "investor";
  const rawInput = String(b.input || "");
  const place = String(b.place || "");

  let live: any[] = [];
  let dataSource = "SAMPLE (unverified)";
  try {
    if (["scout", "leaderboard", "map"].includes(def.id) && place) live = await rentcastLeads(place, 8);
    if (def.id === "valuate" && rawInput) { const one = await rentcastLookup(rawInput); if (one) live = [one]; }
    if (live.length) dataSource = "LIVE (RentCast records)";
  } catch {}

  const rentcastGrounding = live.length
    ? "\n\nVERIFIED RECORDS FROM RENTCAST (prefer these):\n" + JSON.stringify(live)
    : "";

  const searchInstruction = def.search
    ? "\n\nYou MUST use live web search now. Only return real, verifiable addresses/listings with source_url. Never invent data."
    : "";

  let model = "qwen/qwen-2.5-72b-instruct";
  if (def.search) model = "perplexity/sonar";
  let messages: any[];
  if (def.vision && /^https?:\/\//.test(rawInput.trim())) {
    model = "qwen/qwen2.5-vl-72b-instruct";
    messages = [
      { role: "system", content: def.system + TRACK_SUFFIX[track] },
      { role: "user", content: [{ type: "text", text: "Analyze this property photo." + rentcastGrounding }, { type: "image_url", image_url: { url: rawInput.trim() } }] }
    ];
  } else {
    const userInput = (def.fields ? JSON.stringify(b.fields || {}) : rawInput) + (place ? "\nMarket: " + place : "") + rentcastGrounding + searchInstruction;
    messages = [{ role: "system", content: def.system + TRACK_SUFFIX[track] }, { role: "user", content: userInput }];
  }

  let out: any = null;
  let usedModel = model;
  const call = async (m: string, msgs: any[]) => {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: m, messages: msgs, temperature: 0.2 })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j: any = await r.json();
    return j?.choices?.[0]?.message?.content || "";
  };

  try {
    const text = await call(model, messages);
    try { const m = text.match(/\{[\s\S]*\}/); out = m ? JSON.parse(m[0]) : { result: text }; } catch { out = { result: text }; }
  } catch {
    // Fallback: search model failed -> plain Qwen with honest SAMPLE labeling
    usedModel = "qwen/qwen-2.5-72b-instruct";
    if (dataSource !== "LIVE (RentCast records)") dataSource = "SAMPLE (search unavailable)";
    const fbMessages = [messages[0], { role: "user", content: String(messages[1].content).replace(searchInstruction, "\n\nNo live search available right now. Label every address as SAMPLE/ILLUSTRATIVE.") }];
    try {
      const text = await call(usedModel, fbMessages);
      try { const m = text.match(/\{[\s\S]*\}/); out = m ? JSON.parse(m[0]) : { result: text }; } catch { out = { result: text }; }
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: "LLM call failed: " + e.message }, { status: 502 });
    }
  }

  if (def.search && dataSource !== "LIVE (RentCast records)" && usedModel.startsWith("perplexity")) {
    dataSource = "LIVE (web-grounded search)";
  }

  if (def.id === "investor" && b.fields) {
    const p = Number(b.fields.purchase_price) || 0;
    const rh = Number(b.fields.rehab_cost) || 0;
    const arv = Number(b.fields.arv) || 0;
    const rent = Number(b.fields.monthly_rent) || 0;
    const mao = arv * 0.7 - rh;
    const onePct = p + rh > 0 ? (rent / (p + rh)) * 100 : 0;
    const gross = p + rh > 0 ? ((rent * 12) / (p + rh)) * 100 : 0;
    out.metrics = { max_allowable_offer: Math.round(mao), one_percent_rule: onePct.toFixed(2) + "%", gross_yield: gross.toFixed(2) + "%", verdict: p <= mao ? "DEAL - at or below MAO" : "OVER MAO by $" + Math.round(p - mao) };
  }

  return NextResponse.json({ ok: true, agent: def.id, track, dataSource, model: usedModel, output: out });
}