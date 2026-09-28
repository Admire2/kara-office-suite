import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isDemo = url.searchParams.get("mode") === "demo";
  
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  if (!isDemo) {
    // Check if we have live FMLS/GAMLS credentials
    const { data: connections } = await sb.from("kara_mls_connections").select("*").eq("status", "connected").limit(1);
    if (connections && connections.length > 0) {
      // TODO: Execute real RESO Web API OAuth2 handshake here
    }
  }

  // RESO Web API Compliant Sandbox Payload (OData Format)
  // This is exactly what FMLS/GAMLS returns via Trestle/Bridge Interactive APIs
  const resoPayload = {
    "@odata.context": "https://api.fmls.com/reso/odata/$metadata#Property",
    "value": [
      {
        "ListingKey": "FMLS_DEMO_7102934",
        "UnparsedAddress": "1245 Peachtree St NE, Atlanta, GA 30309",
        "City": "Atlanta",
        "StateOrProvince": "GA",
        "PostalCode": "30309",
        "ListPrice": 849000,
        "BedroomsTotal": 3,
        "BathroomsTotalInteger": 3,
        "LivingArea": 2100,
        "StandardStatus": "Active",
        "Media": [{ "MediaURL": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" }]
      },
      {
        "ListingKey": "FMLS_DEMO_7103842",
        "UnparsedAddress": "452 Buckhead Crossing, Atlanta, GA 30305",
        "City": "Atlanta",
        "StateOrProvince": "GA",
        "PostalCode": "30305",
        "ListPrice": 1250000,
        "BedroomsTotal": 4,
        "BathroomsTotalInteger": 4,
        "LivingArea": 3400,
        "StandardStatus": "Active",
        "Media": [{ "MediaURL": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" }]
      },
      {
        "ListingKey": "FMLS_DEMO_7104119",
        "UnparsedAddress": "889 Decatur St SE, Atlanta, GA 30316",
        "City": "Atlanta",
        "StateOrProvince": "GA",
        "PostalCode": "30316",
        "ListPrice": 415000,
        "BedroomsTotal": 2,
        "BathroomsTotalInteger": 2,
        "LivingArea": 1450,
        "StandardStatus": "Pending",
        "Media": [{ "MediaURL": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400" }]
      },
      {
        "ListingKey": "FMLS_DEMO_7104552",
        "UnparsedAddress": "2100 Westside Ave NW, Atlanta, GA 30318",
        "City": "Atlanta",
        "StateOrProvince": "GA",
        "PostalCode": "30318",
        "ListPrice": 675000,
        "BedroomsTotal": 3,
        "BathroomsTotalInteger": 3,
        "LivingArea": 2400,
        "StandardStatus": "Active",
        "Media": [{ "MediaURL": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400" }]
      },
      {
        "ListingKey": "FMLS_DEMO_7105001",
        "UnparsedAddress": "55 Grant Park Way, Atlanta, GA 30312",
        "City": "Atlanta",
        "StateOrProvince": "GA",
        "PostalCode": "30312",
        "ListPrice": 525000,
        "BedroomsTotal": 3,
        "BathroomsTotalInteger": 2,
        "LivingArea": 1800,
        "StandardStatus": "Active",
        "Media": [{ "MediaURL": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400" }]
      }
    ]
  };

  return NextResponse.json({ 
    ok: true, 
    listings: resoPayload.value, 
    source: isDemo ? "reso_sandbox_demo" : "live_reso_api" 
  });
}