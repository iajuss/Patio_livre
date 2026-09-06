import { NextResponse } from "next/server";
import { FUNNEL_EVENTS, buildFunnelEvent, isValidFunnelEvent } from "@/lib/analytics";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !FUNNEL_EVENTS.includes(body.eventName)) return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  const event = buildFunnelEvent(body.eventName, body.context ?? {});
  if (!isValidFunnelEvent(event)) return NextResponse.json({ error: "Contexto de evento inválido" }, { status: 400 });
  const supabase = getSupabaseServer();
  if (!supabase) return new NextResponse(null, { status: 204 });
  await supabase.from("funnel_events").insert({ event_name: event.eventName, payload: event.payload, anonymous_session_id: body.sessionId, landing_path: body.landingPath, utm_source: body.context?.utmSource, utm_medium: body.context?.utmMedium, utm_campaign: body.context?.utmCampaign });
  return new NextResponse(null, { status: 204 });
}
