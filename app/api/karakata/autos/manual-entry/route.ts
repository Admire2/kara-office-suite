import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b: any = await req.json();
    
    const { year, make, model, vin, price_usd, seller_id, condition } = b;
    
    if (!year || !make || !model || !vin) {
      return NextResponse.json({ 
        ok: false, 
        error: "year, make, model, vin are required" 
      }, { status: 400 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate title-matched image using Pollinations
    const title = `${year} ${make} ${model}`;
    const imagePrompt = encodeURIComponent(`professional car photo of ${year} ${make} ${model}, clean studio lighting, white background`);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=800&height=600&seed=${vin.replace(/\W/g, '')}&nologo=true`;

    // Calculate compare_at_usd (15% markup for "typical" price)
    const compareAt = Math.round(Number(price_usd) * 1.15);

    // Insert into kara_listings
    const { data, error } = await sb.from("kara_listings").insert({
      title: title,
      description: `VIN: ${vin}. ${condition || 'Well-maintained'}, clean title, ready for immediate sale.`,
      category: "Automotive",
      subcategory: condition === "new" ? "Cars for sale - New" : "Cars for sale - Fairly used",
      status: "active",
      price_usd: Number(price_usd) || 0,
      compare_at_usd: compareAt,
      image_url: imageUrl,
      seller_id: Number(seller_id) || 1,
      metadata: {
        vin: vin,
        year: Number(year),
        make: make,
        model: model,
        condition: condition || "fairly_used",
        entry_method: "manual"
      }
    }).select().single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      listing: data,
      message: `Car listing created: ${title}`,
      market_url: "https://founderpilot-theta.vercel.app/karakata"
    });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e.message) }, { status: 500 });
  }
}