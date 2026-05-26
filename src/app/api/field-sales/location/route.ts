import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { locations } = body; // Array of location objects batched from mobile

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json({ error: 'Invalid payload, expected array of locations' }, { status: 400 });
    }

    // Map locations to match DB schema
    const rows = locations.map((loc: any) => ({
      agent_id: user.id,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      battery_level: loc.battery?.level,
      is_mocked: loc.mocked || false,
      recorded_at: new Date(loc.timestamp).toISOString(),
    }));

    const { error } = await supabase
      .from('agent_locations')
      .insert(rows);

    if (error) throw error;

    return NextResponse.json({ success: true, inserted: rows.length });

  } catch (error: any) {
    console.error("[API/Field-Sales] Error saving locations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
