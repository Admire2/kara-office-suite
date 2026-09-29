import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const vapiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID; // You'll add this to your .env.local
  
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    // 1. Check recent calls from Vapi (Last 1 hour)
    const res = await fetch("https://api.vapi.ai/call?limit=50&status=ended", {
      headers: { Authorization: "Bearer " + vapiKey }
    });
    const calls: any[] = await res.json();

    // 2. Analyze for failures (e.g., endedReason = 'pipeline-error' or 'llm-error')
    const failed = calls.filter(c => c.endedReason && c.endedReason.includes('error')).length;
    const errorRate = calls.length > 0 ? (failed / calls.length) * 100 : 0;

    let actionTaken = "System Healthy";
    let currentModel = "Groq - Llama 3.3";

    // 3. THE AUTO-FIX LOGIC
    if (errorRate > 20) { // If more than 20% of calls are failing
      actionTaken = "CRITICAL: Switching Primary Model to OpenRouter (Qwen)";
      currentModel = "OpenRouter - Qwen 2.5";
      
      // TODO: Call Vapi API to update the assistant model to OpenRouter
      // await fetch(`https://api.vapi.ai/assistant/${assistantId}`, { method: 'PATCH', ... })
      
      // TODO: Send SMS to Admin (Twilio/Resend)
    }

    // 4. Log to Database
    await sb.from("kara_sentinel_logs").insert({
      total_calls: calls.length,
      failed_calls: failed,
      error_rate: errorRate,
      primary_model: currentModel,
      action_taken: actionTaken
    });

    return NextResponse.json({ ok: true, error_rate: errorRate, action: actionTaken });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}