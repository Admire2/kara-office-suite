import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const pname = u.searchParams.get("p") || "";
  const item = u.searchParams.get("item") || "";
  const email = u.searchParams.get("e") || "anonymous";
  const suite = u.searchParams.get("s") || "";
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("affiliate_partners").select("affiliate_url").eq("partner_name", pname).limit(1).maybeSingle();
  let dest = data?.affiliate_url || "/suite/engineering";
  if (item) dest += (dest.includes("?") ? "&" : "?") + "item=" + encodeURIComponent(item);
  try { await supabase.from("affiliate_clicks").insert({ user_email: email, partner_name: pname, suite, project_context: item }); } catch (e) {}
  return NextResponse.redirect(dest, 302);
}
