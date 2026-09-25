import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const b: any = await req.json().catch(() => ({}));
    const imageUrl = String(b.image_url || "");
    if (!imageUrl) return NextResponse.json({ ok: false, error: "image_url required" }, { status: 400 });

    const key = process.env.GLM_API_KEY;
    if (!key) return NextResponse.json({ ok: false, error: "GLM_API_KEY missing - add from z.ai" }, { status: 500 });

    const prompt = "You are KaraKata's VIN Reader. From this image of car registration papers, VIN plate or dashboard, extract: vin (17 chars), make, model, year (number), color, mileage (number or null), country_registered. Return ONLY valid JSON; use null for unseen fields.";

    const r = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GLM_MODEL || "glm-5.3-flash",
        messages: [{ role: "user", content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: prompt }
        ] }]
      })
    });

    if (!r.ok) {
      const err = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "GLM " + r.status, details: err }, { status: 502 });
    }

    const j: any = await r.json();
    const text = String((j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "");
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s < 0 || e <= s) return NextResponse.json({ ok: false, error: "no JSON in reply", raw: text }, { status: 502 });

    return NextResponse.json({ ok: true, vehicle: JSON.parse(text.slice(s, e + 1)) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e.message) }, { status: 500 });
  }
}