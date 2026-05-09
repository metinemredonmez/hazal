"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  MapPin,
  Building2,
  Calendar as CalIcon,
  Navigation,
  X,
  Filter,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Listing {
  id: string;
  slug: string;
  titleTr: string;
  district: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  price: number;
  currency: string;
  bedrooms: number | null;
  status: string;
  type: string;
  images?: Array<{ url: string }>;
}

interface Appointment {
  id: string;
  startsAt: string;
  name: string;
  phone: string | null;
  status: string;
  location: string | null;
  listing?: { slug: string; titleTr: string; district: string | null; lat?: number | null; lng?: number | null } | null;
}

interface CalendarEvent {
  id: string;
  type: string;
  status: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  lat: number | null;
  lng: number | null;
  location: string | null;
  customerName: string | null;
  listing?: { slug: string; titleTr: string; district: string | null } | null;
}

type LayerKey = "listings" | "appointments" | "events";

const LAYER_META: Record<LayerKey, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  listings: { label: "İlanlar", color: "#C9A96E", icon: Building2 },
  appointments: { label: "Randevular", color: "#3B82F6", icon: CalIcon },
  events: { label: "Etkinlikler", color: "#8B5CF6", icon: Navigation },
};

const ISTANBUL_CENTER: [number, number] = [29.0428, 41.0773]; // [lng, lat] - Bebek

interface SelectedItem {
  source: "listing" | "appointment" | "event";
  data: Listing | Appointment | CalendarEvent;
}

export default function HaritaPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeLayers, setActiveLayers] = React.useState<Record<LayerKey, boolean>>({
    listings: true,
    appointments: true,
    events: true,
  });
  const [selected, setSelected] = React.useState<SelectedItem | null>(null);
  const [mapboxToken, setMapboxToken] = React.useState<string>("");
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<unknown>(null);
  const markersRef = React.useRef<unknown[]>([]);

  // Load Mapbox token from settings
  React.useEffect(() => {
    api<{ mapboxToken: string | null }>("/api/admin/settings")
      .then((s) => {
        const token =
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN || s.mapboxToken || "";
        setMapboxToken(token);
      })
      .catch(() => setMapboxToken(""));
  }, []);

  // Fetch all 3 sources
  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [listingsRes, appts, evts] = await Promise.all([
        api<{ items: Listing[] }>("/api/admin/listings?pageSize=200&status=ACTIVE"),
        api<Appointment[]>(`/api/admin/appointments?upcomingOnly=false`),
        api<CalendarEvent[]>(
          `/api/admin/calendar-events?fromDate=${past.toISOString()}&toDate=${future.toISOString()}`,
        ),
      ]);
      setListings(listingsRes.items.filter((l) => l.lat != null && l.lng != null));
      setAppointments(
        appts.filter((a) => a.listing?.lat != null && a.listing?.lng != null),
      );
      setEvents(evts.filter((e) => e.lat != null && e.lng != null));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Initialize Mapbox map (lazy load)
  React.useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      // Dynamic import — keeps initial bundle small
      // @ts-expect-error mapbox-gl dynamic import
      const mapboxgl = (await import("mapbox-gl")).default;
      // @ts-expect-error css side-effect import
      await import("mapbox-gl/dist/mapbox-gl.css");
      if (cancelled) return;

      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: ISTANBUL_CENTER,
        zoom: 11,
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
    };
  }, [mapboxToken]);

  // Render markers when data or layers change
  React.useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    (async () => {
      // @ts-expect-error mapbox-gl dynamic import
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;

      // Clear existing markers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];

      const addMarker = (
        lat: number,
        lng: number,
        color: string,
        onClick: () => void,
      ) => {
        const el = document.createElement("button");
        el.className = "mapbox-pin";
        el.style.cssText = `width:32px;height:32px;border-radius:50% 50% 50% 0;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;transition:transform 0.15s;`;
        el.onmouseenter = () => {
          el.style.transform = "rotate(-45deg) scale(1.15)";
        };
        el.onmouseleave = () => {
          el.style.transform = "rotate(-45deg)";
        };
        el.onclick = (e) => {
          e.stopPropagation();
          onClick();
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new (mapboxgl as any).Marker({ element: el })
          .setLngLat([lng, lat])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .addTo(mapRef.current as any);
        markersRef.current.push(marker);
      };

      if (activeLayers.listings) {
        listings.forEach((l) => {
          if (l.lat != null && l.lng != null) {
            addMarker(l.lat, l.lng, LAYER_META.listings.color, () =>
              setSelected({ source: "listing", data: l }),
            );
          }
        });
      }

      if (activeLayers.appointments) {
        appointments.forEach((a) => {
          const lat = a.listing?.lat;
          const lng = a.listing?.lng;
          if (lat != null && lng != null) {
            addMarker(lat, lng, LAYER_META.appointments.color, () =>
              setSelected({ source: "appointment", data: a }),
            );
          }
        });
      }

      if (activeLayers.events) {
        events.forEach((e) => {
          if (e.lat != null && e.lng != null) {
            addMarker(e.lat, e.lng, LAYER_META.events.color, () =>
              setSelected({ source: "event", data: e }),
            );
          }
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listings, appointments, events, activeLayers]);

  const counts = {
    listings: listings.length,
    appointments: appointments.length,
    events: events.length,
  };

  return (
    <>
      <Topbar
        title="Harita"
        description="İlanlar, randevular ve planlanan ziyaretler tek haritada"
      />
      <main className="flex-1 relative">
        {!mapboxToken ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Mapbox Token gerekli</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ayarlar → Yerelleştirme → Mapbox Token alanına public token gir,
                  ya da web'in <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> env'ini ayarla.
                </p>
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#C9A96E] inline-flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Token al (mapbox.com)
                </a>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Yükleniyor...
              </div>
            )}

            {/* Layer chip filter — top */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              {(Object.keys(LAYER_META) as LayerKey[]).map((k) => {
                const meta = LAYER_META[k];
                const Icon = meta.icon;
                const active = activeLayers[k];
                return (
                  <button
                    key={k}
                    onClick={() =>
                      setActiveLayers((prev) => ({ ...prev, [k]: !prev[k] }))
                    }
                    className={
                      "inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs backdrop-blur shadow transition-all " +
                      (active
                        ? "bg-white text-[#14141A]"
                        : "bg-white/40 text-[#14141A]/50 hover:bg-white/70")
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-medium">{meta.label}</span>
                    <span className="text-[10px] opacity-60">{counts[k]}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected detail panel */}
            {selected && (
              <Card className="absolute top-4 right-4 w-80 z-10 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{
                        background:
                          selected.source === "listing"
                            ? `${LAYER_META.listings.color}20`
                            : selected.source === "appointment"
                              ? `${LAYER_META.appointments.color}20`
                              : `${LAYER_META.events.color}20`,
                        color:
                          selected.source === "listing"
                            ? LAYER_META.listings.color
                            : selected.source === "appointment"
                              ? LAYER_META.appointments.color
                              : LAYER_META.events.color,
                      }}
                    >
                      {selected.source === "listing"
                        ? "İlan"
                        : selected.source === "appointment"
                          ? "Randevu"
                          : "Etkinlik"}
                    </span>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {selected.source === "listing" && (
                    <ListingPanel listing={selected.data as Listing} />
                  )}
                  {selected.source === "appointment" && (
                    <AppointmentPanel appointment={selected.data as Appointment} />
                  )}
                  {selected.source === "event" && (
                    <EventPanel event={selected.data as CalendarEvent} />
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  );
}

function ListingPanel({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0]?.url;
  return (
    <div>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={listing.titleTr} className="w-full h-32 object-cover rounded mb-2" />
      )}
      <p className="text-sm font-medium line-clamp-2 mb-1">{listing.titleTr}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {listing.district} · {listing.bedrooms ? `${listing.bedrooms}+1` : ""}
      </p>
      <p className="text-base font-light mb-3">
        {Number(listing.price).toLocaleString("tr-TR")} {listing.currency}
      </p>
      <div className="flex gap-2">
        <a
          href={`/listings/${listing.id}`}
          className="flex-1 text-xs text-center px-3 py-2 bg-[#14141A] text-white rounded hover:bg-[#C9A96E]"
        >
          Düzenle
        </a>
        <a
          href={`https://www.google.com/maps?q=${listing.lat},${listing.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 text-xs text-center px-3 py-2 border border-border rounded hover:border-[#C9A96E]"
        >
          Yol tarifi
        </a>
      </div>
    </div>
  );
}

function AppointmentPanel({ appointment }: { appointment: Appointment }) {
  const time = new Date(appointment.startsAt);
  return (
    <div>
      <p className="text-sm font-medium mb-1">{appointment.name}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {time.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
        {time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      {appointment.listing && (
        <p className="text-xs text-[#C9A96E] mb-2">🏠 {appointment.listing.titleTr}</p>
      )}
      <div className="flex gap-2 mt-3">
        {appointment.phone && (
          <a
            href={`tel:${appointment.phone}`}
            className="flex-1 text-xs text-center px-3 py-2 bg-[#14141A] text-white rounded"
          >
            Ara
          </a>
        )}
        <a
          href="/appointments"
          className="flex-1 text-xs text-center px-3 py-2 border border-border rounded"
        >
          Detay
        </a>
      </div>
    </div>
  );
}

function EventPanel({ event }: { event: CalendarEvent }) {
  const time = new Date(event.startsAt);
  return (
    <div>
      <p className="text-sm font-medium mb-1">{event.title}</p>
      <p className="text-xs text-muted-foreground mb-1">{event.type}</p>
      <p className="text-xs text-muted-foreground mb-2">
        {time.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
        {time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      {event.location && <p className="text-xs mb-2">📍 {event.location}</p>}
      {event.customerName && <p className="text-xs mb-2">👤 {event.customerName}</p>}
      <a
        href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
        target="_blank"
        rel="noreferrer"
        className="block w-full text-xs text-center px-3 py-2 bg-[#14141A] text-white rounded"
      >
        Yol tarifi
      </a>
    </div>
  );
}
