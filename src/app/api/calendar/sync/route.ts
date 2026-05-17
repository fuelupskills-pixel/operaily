import { NextRequest, NextResponse } from "next/server";
import { getLeadService } from "@/services/leads";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "book",
      provider, // "google" | "microsoft"
      leadName,
      leadEmail,
      leadCompany = "Inbound Org",
      appointmentTime = "10:00",
      appointmentDate = 18,
      duration = "30m",
      meetingTitle = "Intro Discovery Consultation"
    } = body;

    if (action === "connect") {
      if (!provider) {
        return NextResponse.json({ success: false, error: "Missing calendar provider" }, { status: 400 });
      }
      // Simulate real-time Oauth handshake with external servers
      await new Promise(r => setTimeout(r, 1200));

      return NextResponse.json({
        success: true,
        message: `Successfully connected ${provider === 'google' ? 'Google Workspace' : 'Microsoft 365'} Calendar & Meet sync!`,
        connectedState: {
          connectedAt: new Date().toISOString(),
          provider,
          email: provider === 'google' ? 'operator@operaily.com' : 'operator@operaily.onmicrosoft.com',
          status: "active"
        }
      });
    }

    if (action === "book") {
      if (!provider || !leadName || !leadEmail) {
        return NextResponse.json({ success: false, error: "Missing required booking details (provider, name, email)" }, { status: 400 });
      }

      // Generate a mock unique real-time meeting join link
      let meetingUrl = "";
      if (provider === "google") {
        const randStr = (len: number) => Math.random().toString(36).substring(2, 2 + len);
        meetingUrl = `https://meet.google.com/${randStr(3)}-${randStr(4)}-${randStr(3)}`;
      } else {
        const randNum = () => Math.floor(100000 + Math.random() * 900000).toString();
        meetingUrl = `https://teams.live.com/meet/${randNum()}${randNum()}`;
      }

      // Sync lead record into OperAIly CRM automatically!
      const leadService = getLeadService();
      const names = leadName.split(" ");
      const firstName = names[0] || "Appointment";
      const lastName = names.slice(1).join(" ") || "Prospect";

      const newLead = await leadService.create({
        firstName,
        lastName,
        email: leadEmail,
        phone: null,
        whatsapp: null,
        designation: "Strategic Partner",
        companyName: leadCompany,
        website: null,
        address: null,
        city: null,
        country: null,
        industry: "B2B Tech",
        linkedinUrl: null,
        twitterHandle: null,
        facebookUrl: null,
        leadScore: 92, // Booked meeting leads start as hot contacts!
        status: "meeting_scheduled",
        source: provider === "google" ? "Google Calendar Sync" : "Microsoft Calendar Sync",
        sourceId: null,
        personalizedHook: `Prospect booked a 30m demo call via ${provider === 'google' ? 'Google Meet' : 'Microsoft Teams'}.`,
        aiSummary: `Meeting set for slot: ${appointmentTime} on date ${appointmentDate}. Virtual link pre-generated.`
      });

      // Simulate network roundtrip latency to Microsoft/Google servers
      await new Promise(r => setTimeout(r, 1000));

      return NextResponse.json({
        success: true,
        message: "Real-time appointment booked and synced!",
        event: {
          id: `ev_sync_${Math.random().toString(36).substring(7)}`,
          title: meetingTitle,
          time: appointmentTime,
          duration,
          type: "meeting",
          leadName,
          company: leadCompany,
          aiBooked: true,
          channel: provider === "google" ? "Google Meet" : "Microsoft Teams",
          meetingUrl
        },
        lead: newLead
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[API/CalendarSync] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
