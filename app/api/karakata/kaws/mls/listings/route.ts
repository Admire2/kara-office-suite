import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Check if we have live FMLS/GAMLS credentials
  const { data: connections } = await sb.from("kara_mls_connections").select("*").eq("status", "connected").limit(1);
  
  if (connections && connections.length > 0) {
    // TODO: In production, execute RESO Web API OAuth2 handshake here using connections[0].api_key
    // const res = await fetch(connections[0].api_endpoint + "/reso/odata/Property", { headers: { Authorization: "Bearer " + token } });
    // return NextResponse.json({ ok: true, listings: await res.json() });
  }

  // Fallback: Realistic Atlanta Demo Feed (Used for demoing to broker/buyers before IDX approval)
  const demoListings = [
    { mls_id: "FMLS7102934", address: "1245 Peachtree St NE", city: "Atlanta", state: "GA", zip: "30309", price: 849000, beds: 3, baths: 2.5, sqft: 2100, status: "Active", list_date: "2026-09-25" },
    { mls_id: "FMLS7103842", address: "452 Buckhead Crossing", city: "Atlanta", state: "GA", zip: "30305", price: 1250000, beds: 4, baths: 3.5, sqft: 3400, status: "Active", list_date: "2026-09-27" },
    { mls_id: "FMLS7104119", address: "889 Decatur St SE", city: "Atlanta", state: "GA", zip: "30316", price: 415000, beds: 2, baths: 2, sqft: 1450, status: "Pending", list_date: "2026-09-20" },
    { mls_id: "FMLS7104552", address: "2100 Westside Ave NW", city: "Atlanta", state: "GA", zip: "30318", price: 675000, beds: 3, baths: 3, sqft: 2400, status: "Active", list_date: "2026-09-28" },
    { mls_id: "FMLS7105001", address: "55 Grant Park Way", city: "Atlanta", state: "GA", zip: "30312", price: 525000, beds: 3, baths: 2, sqft: 1800, status: "Active", list_date: "2026-09-28" }
  ];

  return NextResponse.json({ ok: true, listings: demoListings, source: "demo_feed" });
}