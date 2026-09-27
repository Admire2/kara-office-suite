import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const wantsStream = body.stream === true;

    const tries: { url: string; key: string; model: string }[] = [];
    if (process.env.QWEN_API_KEY && process.env.QWEN_API_URL) {
      tries.push({
        url: process.env.QWEN_API_URL,
        key: process.env.QWEN_API_KEY,
        model: process.env.QWEN_MODEL || "qwen-plus",
      });
    }
    if (process.env.DEEPSEEK_API_KEY) {
      tries.push({
        url: "https://api.deepseek.com/chat/completions",
        key: process.env.DEEPSEEK_API_KEY,
        model: "deepseek-chat",
      });
    }
    if (process.env.GLM_API_KEY) {
      tries.push({
        url: process.env.GLM_URL || "https://api.z.ai/api/paas/v4/chat/completions",
        key: process.env.GLM_API_KEY,
        model: process.env.GLM_MODEL || "glm-5.3-flash",
      });
    }

    if (tries.length === 0) {
      return NextResponse.json({ error: { message: "no brain keys configured", keys_hint: ["QWEN_API_KEY", "QWEN_API_URL", "DEEPSEEK_API_KEY", "GLM_API_KEY"] } }, { status: 502 });
    }

    const msgs: any[] = Array.isArray(body.messages) ? body.messages : [];
    const hasSystem = msgs.some((m: any) => m && m.role === "system");
    if (!hasSystem) {
      msgs.unshift({
        role: "system",
        content:
          "You are Kara, KaraKata's AI phone agent on a LIVE call. Speak naturally, briefly (1-3 sentences per turn), warmly, and in the caller's language (English, Pidgin, Yoruba, Hausa, Igbo). Never mention being an AI model. Pursue the call objective given in context. If the caller asks for a human, say you will arrange it immediately.",
      });
    }

    for (const t of tries) {
      try {
        const r = await fetch(t.url, {
          method: "POST",
          headers: { Authorization: "Bearer " + t.key, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: t.model,
            messages: msgs,
            temperature: 0.4,
            stream: wantsStream,
            max_tokens: 300,
          }),
        });
        if (!r.ok) continue;

        if (wantsStream && r.body) {
          return new Response(r.body, {
            status: 200,
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
          });
        }
        const j: any = await r.json();
        return NextResponse.json(j);
      } catch {
        continue;
      }
    }
    return NextResponse.json({ error: { message: "all brains unavailable" } }, { status: 502 });
  } catch (e: any) {
    return NextResponse.json({ error: { message: String(e.message) } }, { status: 500 });
  }
}