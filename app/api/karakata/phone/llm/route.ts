import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PERSONA = "You are Kara, KaraKata's AI phone agent. You are on a LIVE phone call. Speak naturally, briefly (1-3 sentences per turn), warmly, and in the caller's language (English, Pidgin, Yoruba, Hausa, Igbo). Never mention being an AI model. Pursue the call objective given in context. If the caller asks for a human, promise a colleague within 24 hours and end politely.";

function chunk(id: string, content: string | null, finish: string | null) {
  return "data: " + JSON.stringify({ id: id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "kara-qwen", choices: [{ index: 0, delta: content === null ? {} : { content: content }, finish_reason: finish }] }) + "\n\n";
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const wantsStream = body.stream === true;
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    if (!msgs.some((m: any) => m.role === "system")) msgs.unshift({ role: "system", content: PERSONA });

    const tries: any[] = [];
    if (process.env.QWEN_API_KEY && process.env.QWEN_API_URL) tries.push({ url: process.env.QWEN_API_URL, key: process.env.QWEN_API_KEY, model: process.env.QWEN_MODEL || "qwen-plus" });
    if (process.env.DEEPSEEK_API_KEY) tries.push({ url: "https://api.deepseek.com/chat/completions", key: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat" });
    if (process.env.GLM_API_KEY) tries.push({ url: process.env.GLM_URL || "https://api.z.ai/api/paas/v4/chat/completions", key: process.env.GLM_API_KEY, model: process.env.GLM_MODEL || "glm-5.3-flash" });

    for (const t of tries) {
      try {
        const r = await fetch(t.url, {
          method: "POST",
          headers: { Authorization: "Bearer " + t.key, "Content-Type": "application/json", "Accept": "text/event-stream" },
          body: JSON.stringify({ model: t.model, messages: msgs, temperature: 0.4, stream: true, max_tokens: 300 })
        });
        if (!r.ok || !r.body) continue;

        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        const pieces: string[] = [];

        const pump = async (onDelta: (s: string) => void) => {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              const s = line.trim();
              if (!s.startsWith("data:")) continue;
              const payload = s.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const j = JSON.parse(payload);
                const d = (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || "";
                if (d) { pieces.push(d); onDelta(d); }
              } catch {}
            }
          }
        };

        if (!wantsStream) {
          await pump(() => {});
          const full = pieces.join("");
          if (!full) continue;
          return NextResponse.json({ id: "kara-" + Date.now(), object: "chat.completion", created: Math.floor(Date.now() / 1000), model: "kara-qwen", choices: [{ index: 0, message: { role: "assistant", content: full }, finish_reason: "stop" }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } });
        }

        const id = "kara-" + Date.now();
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(enc.encode(chunk(id, "", null)));
            await pump((d) => controller.enqueue(enc.encode(chunk(id, d, null))));
            controller.enqueue(enc.encode(chunk(id, null, "stop")));
            controller.enqueue(enc.encode("data: [DONE]\n\n"));
            controller.close();
          }
        });
        return new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Accel-Buffering": "no" }
        });
      } catch {}
    }
    return NextResponse.json({ error: { message: "no brain available" } }, { status: 502 });
  } catch (e: any) {
    return NextResponse.json({ error: { message: String(e.message) } }, { status: 500 });
  }
}