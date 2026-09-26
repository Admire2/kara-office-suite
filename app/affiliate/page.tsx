import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();
    if (!order_id) return NextResponse.json({ ok: false, error: "order_id required" }, { status: 400 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch the order
    const { data: order, error: orderErr } = await sb
      .from("kara_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Check if this order already has a commission
    const { data: existing } = await sb
      .from("referrals")
      .select("id")
      .eq("order_id", order_id)
      .eq("track", "market")
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, already: true, message: "Commission already calculated" });
    }

    // 3. Check if buyer was referred (cookie tracking)
    const buyerEmail = order.buyer_email || order.email;
    if (!buyerEmail) {
      return NextResponse.json({ ok: false, error: "No buyer email on order" }, { status: 400 });
    }

    // Look for referral record for this buyer
    const { data: referral } = await sb
      .from("referrals")
      .select("*")
      .eq("referred_email", buyerEmail)
      .eq("track", "suite")
      .order("id", { ascending: false })
      .limit(1);

    if (!referral || referral.length === 0) {
      return NextResponse.json({ ok: true, no_referral: true, message: "Buyer not referred" });
    }

    const affiliateCode = referral[0].affiliate_code;

    // 4. Calculate commission (3% of order value)
    const orderValue = Number(order.total_usd || order.total || 0);
    const commissionRate = 0.03;
    const commissionAmount = orderValue * commissionRate;

    // 5. Insert market-track referral record
    const { error: insertErr } = await sb.from("referrals").insert({
      affiliate_code: affiliateCode,
      referred_email: buyerEmail,
      order_id: order_id,
      order_value: orderValue,
      commission_amount: commissionAmount,
      status: "pending",
      track: "market",
      timestamp_et: new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false })
    });

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    // 6. Update affiliate's total_earned
    const { error: updateErr } = await sb
      .from("affiliates")
      .update({ total_earned: commissionAmount })
      .eq("affiliate_code", affiliateCode);

    if (updateErr) {
      return NextResponse.json({ ok: false, error: "Failed to update affiliate balance" }, { status: 500 });
    }

    // 7. Update leaderboard cache
    await sb.rpc("update_affiliate_leaderboard", { p_code: affiliateCode });

    return NextResponse.json({
      ok: true,
      affiliate_code: affiliateCode,
      order_value: orderValue,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "pending (14-day hold)"
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}