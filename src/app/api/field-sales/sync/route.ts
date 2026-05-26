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
    const { workLogs, appointmentUpdates } = body; 

    // 1. Process Offline Work Logs (Check-ins, Check-outs)
    if (workLogs && Array.isArray(workLogs)) {
      const logRows = workLogs.map((log: any) => ({
        agent_id: user.id,
        action_type: log.action_type,
        related_entity_id: log.related_entity_id,
        latitude: log.latitude,
        longitude: log.longitude,
        timestamp: new Date(log.timestamp).toISOString(),
        sync_id: log.sync_id // To prevent double inserts if app retries
      }));

      // Use upsert to ignore duplicates based on sync_id (requires unique constraint)
      if (logRows.length > 0) {
        const { error } = await supabase.from('work_logs').upsert(logRows, { onConflict: 'sync_id' });
        if (error) console.error("[Sync] Error inserting work logs:", error);
      }
    }

    // 2. Process Appointment Updates (status changes, outcome notes)
    if (appointmentUpdates && Array.isArray(appointmentUpdates)) {
      for (const update of appointmentUpdates) {
        const { id, status, outcome_notes } = update;
        
        // Only update if the appointment belongs to the user
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status, 
            outcome_notes, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .eq('agent_id', user.id);

        if (error) console.error(`[Sync] Error updating appointment ${id}:`, error);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[API/Field-Sales] Error during sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch upcoming appointments for the agent to store offline
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('agent_id', user.id)
      .gte('scheduled_at', today.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: { appointments } });
  } catch (error: any) {
    console.error("[API/Field-Sales] Error fetching sync data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
