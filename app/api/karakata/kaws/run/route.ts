import { KAWS_AGENTS } from "@/lib/kaws-agents";
import { rentcastLeads, rentcastLookup } from "@/lib/property-data";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const FREE_QWEN = "qwen/qwen-2.5-72b-instruct:free";
const PAID_QWEN = "qwen/qwen-2.5-72b-instruct";
const SONAR = "perplexity/sonar";

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
  const isUrl = /^https?:\/\//.test(rawInput.trim());

  let live: any[] = [];
  try {
    if (["scout", "leaderboard", "map"].includes(def.id) && place) live = await rentcastLeads(place, 8);
    if (def.id === "valuate" && rawInput && !isUrl) { const one = await rentcastLookup(rawInput); if (one) live = [one]; }
  } catch {}
  const rentcastGrounding = live.length ? "\n\nVERIFIED RECORDS FROM RENTCAST (prefer these):\n" + JSON.stringify(live) : "";

  const searchInstruction = def.search ? "\n\nYou MUST use live web search now. Only return real, verifiable addresses/listings with source_url. Never invent data." : "";
  const sampleNote = def.search ? "\n\nNo live search is available on this model. Label every address or figure as SAMPLE/ILLUSTRATIVE and say so." : "";

  const sysMsg = { role: "system", content: def.system + TRACK_SUFFIX[track] };
  const buildMsgs = (m: string): any[] => {
    if (def.vision && isUrl) {
      return [sysMsg, { role: "user", content: [{ type: "text", text: "Analyze this property photo." + rentcastGrounding }, { type: "image_url", image_url: { url: rawInput.trim() } }] }];
    }
    const base = (def.fields ? JSON.stringify(b.fields || {}) : rawInput) + (place ? "\nMarket: " + place : "") + rentcastGrounding;
    const note = def.search ? (m === SONAR ? searchInstruction : sampleNote) : "";
    return [sysMsg, { role: "user", content: base + note }];
  };

  let chain: string[];
  if (def.vision && isUrl) chain = ["qwen/qwen2.5-vl-72b-instruct", PAID_QWEN];
  else if (def.search) chain = [SONAR, FREE_QWEN, PAID_QWEN];
  else chain = [FREE_QWEN, PAID_QWEN];

  const call = async (m: string) => {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: m, messages: buildMsgs(m), temperature: 0.2 })
    });
    if (!r.ok) throw new Error(m + " HTTP " + r.status);
    const j: any = await r.json();
    const text = j?.choices?.[0]?.message?.content || "";
    if (!text) throw new Error(m + " empty");
    return text;
  };

  let out: any = null;
  let usedModel = "";
  for (const m of chain) {
    try {
      const text = await call(m);
      try { const mm = text.match(/\{[\s\S]*\}/); out = mm ? JSON.parse(mm[0]) : { result: text }; } catch { out = { result: text }; }
      usedModel = m;
      break;
    } catch {}
  }
  if (!out) return NextResponse.json({ ok: false, error: "All models in chain failed" }, { status: 502 });

  let dataSource: string;
  if (live.length) dataSource = "LIVE (RentCast records)";
  else if (usedModel === SONAR) dataSource = "LIVE (web-grounded search)";
  else if (def.search) dataSource = "SAMPLE (unverified)";
  else dataSource = usedModel.includes(":free") ? "FREE TIER (Qwen)" : "PAID TIER";

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