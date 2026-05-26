// OMNI-SIGMA 360 — Telephony Numbers API
// GET  /api/telephony/numbers — Search available numbers to purchase
// POST /api/telephony/numbers — Purchase & assign a number to the current user

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchNumbers, purchaseNumber, assignNumberToUser } from "@/services/telephony/numbers";

// ─── GET: search available numbers ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode") || "US";
    const limit = Number(searchParams.get("limit") || "10");
    const features = (searchParams.get("features") || "sms,voice").split(",") as ("sms" | "voice" | "mms" | "fax")[];

    const numbers = await searchNumbers({ countryCode, limit, features });

    return NextResponse.json({ success: true, numbers });
  } catch (error: any) {
    console.error("[API/Telephony/Numbers] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search numbers" },
      { status: 500 }
    );
  }
}

// ─── POST: purchase & assign a number ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, assignToUserId } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "phoneNumber is required" }, { status: 400 });
    }

    // 1. Purchase via Telnyx
    const order = await purchaseNumber(phoneNumber);

    // 2. Assign to user in DB
    const assignedTo = assignToUserId || user.id;
    const assignment = await assignNumberToUser(phoneNumber, assignedTo);

    // 3. Log the event in messages table (non-fatal)
    try {
      await supabase.from("messages").insert({
        channel: "system",
        sender: "system",
        receiver: user.id,
        content: `📞 Phone number ${phoneNumber} purchased and assigned.`,
        direction: "inbound",
        user_id: user.id,
      });
    } catch { /* non-fatal, ignore */ }

    return NextResponse.json({
      success: true,
      order,
      assignment,
      phoneNumber,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API/Telephony/Numbers] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purchase number" },
      { status: 500 }
    );
  }
}
