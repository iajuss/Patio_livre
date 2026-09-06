import { filtersFromSearchParams } from "./domain/filters";
import { CATALOG_NEIGHBORHOODS, DOG_SIZES, SPACES, TIME_SLOTS, USE_TYPES, ZONES } from "./domain/catalog";
import { STAY_INTENTS } from "./domain/stay";

export const FUNNEL_EVENTS = ["search_started", "filters_changed", "space_clicked", "space_viewed", "region_interest_clicked", "interest_submitted", "interest_confirmed"] as const;
export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
export type FunnelEvent = { eventName: FunnelEventName; payload: Record<string, string | number | boolean>; createdAt: string };

const SPACE_EVENTS = new Set<FunnelEventName>(["space_clicked", "space_viewed"]);

const allowedKeys = new Set(["zone", "useType", "dogSize", "dogCount", "timeSlot", "neighborhood", "stayIntent", "spaceSlug", "sourceKind", "utmSource", "utmMedium", "utmCampaign"]);

const FILTER_VALUE_CHECKS: Record<string, (value: unknown) => boolean> = {
  zone: (value) => typeof value === "string" && ZONES.includes(value as (typeof ZONES)[number]),
  useType: (value) => typeof value === "string" && USE_TYPES.includes(value as (typeof USE_TYPES)[number]),
  dogSize: (value) => typeof value === "string" && DOG_SIZES.includes(value as (typeof DOG_SIZES)[number]),
  dogCount: (value) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 8,
  timeSlot: (value) => typeof value === "string" && TIME_SLOTS.includes(value as (typeof TIME_SLOTS)[number]),
  neighborhood: (value) => typeof value === "string" && CATALOG_NEIGHBORHOODS.includes(value),
  stayIntent: (value) => typeof value === "string" && STAY_INTENTS.includes(value as (typeof STAY_INTENTS)[number]),
  spaceSlug: (value) => typeof value === "string" && SPACES.some((space) => space.slug === value),
};

/** Converte somente filtros validados do catálogo em dados seguros para o funil. */
export function funnelContextFromSearchParams(params: URLSearchParams): Record<string, string | number> {
  const filters = filtersFromSearchParams(params);

  return {
    ...(filters.zone ? { zone: filters.zone } : {}),
    ...(filters.useType ? { useType: filters.useType } : {}),
    ...(filters.dogSize ? { dogSize: filters.dogSize } : {}),
    ...(filters.dogCount ? { dogCount: filters.dogCount } : {}),
    ...(filters.timeSlot ? { timeSlot: filters.timeSlot } : {}),
    ...(filters.neighborhood ? { neighborhood: filters.neighborhood } : {}),
    ...(filters.stayIntent ? { stayIntent: filters.stayIntent } : {}),
  };
}

export function buildFunnelEvent(name: FunnelEventName, context: Record<string, unknown>): FunnelEvent {
  const payload = Object.fromEntries(
    Object.entries(context).filter(([key, value]) =>
      allowedKeys.has(key) && ["string", "number", "boolean"].includes(typeof value) && (FILTER_VALUE_CHECKS[key]?.(value) ?? true),
    ),
  ) as FunnelEvent["payload"];
  const event = { eventName: name, payload, createdAt: new Date().toISOString() };
  return isValidFunnelEvent(event) ? event : { ...event, payload: {} };
}

/** Eventos de espaço só são úteis quando apontam para a zona real do catálogo. */
export function isValidFunnelEvent(event: FunnelEvent): boolean {
  if (!SPACE_EVENTS.has(event.eventName)) return true;
  const spaceSlug = event.payload.spaceSlug;
  const zone = event.payload.zone;
  return typeof spaceSlug === "string" && typeof zone === "string" && SPACES.some((space) => space.slug === spaceSlug && space.zone === zone);
}

export function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "patio-livre-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}
