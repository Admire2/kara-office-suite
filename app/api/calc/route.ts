import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const DISCLAIMER = "Guidance only - not final, not verified, no warranty. Use at your own risk. For binding numbers, order a Certified Partner review.";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const suite = (q.get("suite") || "terra").toLowerCase();

  if (suite === "terra") {
    const L = parseFloat(q.get("L") || "20");   // span (m)
    const w = parseFloat(q.get("w") || "20");   // deck width (m)
    const P = parseFloat(q.get("P") || "100");  // live load (kN)
    const nG = Math.max(2, Math.round(w / 2.5));
    const deck = 0.2 * 25 * w;                  // 200mm concrete deck, 25 kN/m3
    const girder = 1.5 * nG;
    const wD = deck + girder;                   // dead UDL kN/m
    const lane = 9.3 * w;                       // lane load kN/m
    const M_D = (wD * L * L) / 8;
    const M_L = (P * L) / 4 + (lane * L * L) / 8;
    const Mu = 1.25 * M_D + 1.75 * M_L;         // AASHTO Strength I
    const Vu = 1.25 * (wD * L) / 2 + 1.75 * (P / 2 + (lane * L) / 2);
    const S_req = (Mu * 1e6) / 345;             // mm3, Fy=345 MPa
    return NextResponse.json({
      suite, calc: "bridge", inputs: { span_m: L, width_m: w, live_kN: P },
      loadFactors: { dead: 1.25, live: 1.75, impact: "33% on truck axles" },
      dead_kN_m: +wD.toFixed(1),
      moment_dead_kNm: +M_D.toFixed(0), moment_live_kNm: +M_L.toFixed(0),
      factored_moment_kNm: +Mu.toFixed(0), factored_shear_kN: +Vu.toFixed(0),
      required_section_modulus_cm3: +(S_req / 1000).toFixed(0),
      deflection_limit_mm: +((L * 1000) / 800).toFixed(0),
      design_life_yr: { bridge: 75, deck: 30, asphalt_wearing: 20 },
      girders: nG, disclaimer: DISCLAIMER
    });
  }

  if (suite === "volt") {
    const P = parseFloat(q.get("P") || "1000"); const V = parseFloat(q.get("V") || "240");
    const I = P / V;
    return NextResponse.json({ suite, calc: "power", current_A: +I.toFixed(1), cable_mm2: Math.ceil(I / 6), disclaimer: DISCLAIMER });
  }

  if (suite === "rivet") {
    const F = parseFloat(q.get("F") || "100"); const A = parseFloat(q.get("A") || "1000");
    const s = (F * 1000) / A;
    return NextResponse.json({ suite, calc: "stress", stress_MPa: +s.toFixed(1), utilization_pct: +((s / 250) * 100).toFixed(0), disclaimer: DISCLAIMER });
  }

  if (suite === "maxi") {
    const I = parseFloat(q.get("I") || "2");
    return NextResponse.json({ suite, calc: "trace", current_A: I, trace_width_mm: +(I / 2.5).toFixed(2), disclaimer: DISCLAIMER });
  }

  return NextResponse.json({ error: "unknown suite" }, { status: 400 });
}