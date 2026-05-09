"use client";

import * as React from "react";
import { toast } from "sonner";
import "mapbox-gl/dist/mapbox-gl.css";
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
  History,
  Crosshair,
  Route,
  Trash2,
} from "lucide-react";
import { confirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface VisitedLocation {
  id: string;
  lat: number;
  lng: number;
  label: string | null;
  customerName: string | null;
  notes: string | null;
  visitedAt: string;
  appointmentId: string | null;
}

type LayerKey = "listings" | "appointments" | "events" | "visited";

const LAYER_META: Record<LayerKey, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  listings: { label: "İlanlar", color: "#C9A96E", icon: Building2 },
  appointments: { label: "Randevular", color: "#3B82F6", icon: CalIcon },
  events: { label: "Etkinlikler", color: "#8B5CF6", icon: Navigation },
  visited: { label: "Geçmiş ziyaretler", color: "#6B7280", icon: History },
};

const ISTANBUL_CENTER: [number, number] = [29.0428, 41.0773]; // [lng, lat] - Bebek

interface SelectedItem {
  source: "listing" | "appointment" | "event" | "visited";
  data: Listing | Appointment | CalendarEvent | VisitedLocation;
}

export default function HaritaPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [visited, setVisited] = React.useState<VisitedLocation[]>([]);
  const [activeLayers, setActiveLayers] = React.useState<Record<LayerKey, boolean>>({
    listings: true,
    appointments: true,
    events: true,
    visited: true,
  });
  const [selected, setSelected] = React.useState<SelectedItem | null>(null);
  const [mapboxToken, setMapboxToken] = React.useState<string>("");
  const [showRoute, setShowRoute] = React.useState(false);
  const [addingVisit, setAddingVisit] = React.useState<{ lat: number; lng: number } | null>(null);
  const [acquiringGps, setAcquiringGps] = React.useState(false);
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

      const [listingsRes, appts, evts, vis] = await Promise.all([
        api<{ items: Listing[] }>("/api/admin/listings?pageSize=100&status=ACTIVE"),
        api<Appointment[]>(`/api/admin/appointments?upcomingOnly=false`),
        api<CalendarEvent[]>(
          `/api/admin/calendar-events?fromDate=${past.toISOString()}&toDate=${future.toISOString()}`,
        ),
        api<VisitedLocation[]>(`/api/admin/visited-locations?limit=200`).catch(() => []),
      ]);
      setListings(listingsRes.items.filter((l) => l.lat != null && l.lng != null));
      setAppointments(
        appts.filter((a) => a.listing?.lat != null && a.listing?.lng != null),
      );
      setEvents(evts.filter((e) => e.lat != null && e.lng != null));
      setVisited(vis);
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
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;

      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: ISTANBUL_CENTER,
        zoom: 11,
      });
      mapRef.current = map;

      // Container 0px ile başlamış olabilir (flex layout race) — load sonrası resize.
      map.on("load", () => {
        setTimeout(() => map.resize(), 50);
      });
      // Window resize yakalama
      const onResize = () => map.resize();
      window.addEventListener("resize", onResize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).__cleanupResize = () => window.removeEventListener("resize", onResize);
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
        el.style.cssText = `width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4),0 0 0 1px rgba(0,0,0,0.1);cursor:pointer;display:block;padding:0;transition:transform 0.15s;`;
        el.onmouseenter = () => {
          el.style.transform = "scale(1.25)";
          el.style.zIndex = "10";
        };
        el.onmouseleave = () => {
          el.style.transform = "scale(1)";
          el.style.zIndex = "";
        };
        el.onclick = (e) => {
          e.stopPropagation();
          onClick();
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new (mapboxgl as any).Marker({ element: el, anchor: "center" })
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

      if (activeLayers.visited) {
        visited.forEach((v) => {
          addMarker(v.lat, v.lng, LAYER_META.visited.color, () =>
            setSelected({ source: "visited", data: v }),
          );
        });
      }

      // Today's route — draw line between today's appointments in time order
      if (showRoute && mapRef.current) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todays = appointments
          .filter((a) => {
            const d = new Date(a.startsAt);
            return (
              d >= today &&
              d < tomorrow &&
              a.listing?.lat != null &&
              a.listing?.lng != null
            );
          })
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        const coords = todays.map((a) => [a.listing!.lng!, a.listing!.lat!]);
        if (coords.length >= 2) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map = mapRef.current as any;
          const ROUTE_SOURCE = "today-route";
          const ROUTE_LAYER = "today-route-layer";

          if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER);
          if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);

          map.addSource(ROUTE_SOURCE, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: coords },
              properties: {},
            },
          });
          map.addLayer({
            id: ROUTE_LAYER,
            type: "line",
            source: ROUTE_SOURCE,
            paint: {
              "line-color": "#C9A96E",
              "line-width": 4,
              "line-opacity": 0.85,
              "line-dasharray": [2, 1],
            },
          });
        }
      } else if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = mapRef.current as any;
        if (map.getLayer && map.getLayer("today-route-layer")) {
          map.removeLayer("today-route-layer");
        }
        if (map.getSource && map.getSource("today-route")) {
          map.removeSource("today-route");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listings, appointments, events, visited, activeLayers, showRoute]);

  const counts = {
    listings: listings.length,
    appointments: appointments.length,
    events: events.length,
    visited: visited.length,
  };

  // "Buradayım" — get GPS, open dialog
  async function handleHereIAm() {
    if (!navigator.geolocation) {
      toast.error("Tarayıcın GPS desteklemiyor");
      return;
    }
    setAcquiringGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAcquiringGps(false);
        setAddingVisit({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setAcquiringGps(false);
        toast.error(`GPS alınamadı: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function deleteVisit(id: string) {
    if (
      !(await confirmDialog({
        title: "Ziyaret kaydını sil?",
        description: "Bu kayıt haritadan kalıcı olarak silinir.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
    try {
      await api(`/api/admin/visited-locations/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      setSelected(null);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  // Count today's appointments for route button
  const todaysCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return appointments.filter((a) => {
      const d = new Date(a.startsAt);
      return (
        d >= today &&
        d < tomorrow &&
        a.listing?.lat != null &&
        a.listing?.lng != null
      );
    }).length;
  }, [appointments]);

  return (
    <>
      <Topbar
        title="Harita"
        description="İlanlar, randevular ve planlanan ziyaretler tek haritada"
      />
      <main className="flex-1 relative min-h-[calc(100vh-44px)]">
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
            <div
              ref={mapContainer}
              className="absolute inset-0"
              style={{ minHeight: "calc(100vh - 44px)" }}
            />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Yükleniyor...
              </div>
            )}

            {/* Today's route toggle — top center (only if there's >=2 today's appts) */}
            {todaysCount >= 2 && (
              <button
                onClick={() => setShowRoute((v) => !v)}
                className={
                  "absolute top-4 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs backdrop-blur shadow transition-all " +
                  (showRoute
                    ? "bg-[#14141A] text-white"
                    : "bg-white/95 text-[#14141A] hover:bg-white")
                }
              >
                <Route className={"h-3.5 w-3.5 " + (showRoute ? "text-[#C9A96E]" : "text-[#14141A]/70")} />
                <span className="font-medium">
                  {showRoute ? "Rota Aktif" : "Bugünün Rotası"}
                </span>
                <span className="text-[10px] opacity-70">{todaysCount} randevu</span>
              </button>
            )}

            {/* "Buradayım" — bottom right */}
            <button
              onClick={handleHereIAm}
              disabled={acquiringGps}
              className="absolute bottom-6 right-6 z-10 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#C9A96E] hover:bg-[#b8965e] text-[#14141A] shadow-lg font-medium text-sm disabled:opacity-60 transition-colors"
            >
              {acquiringGps ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4" />
              )}
              {acquiringGps ? "GPS alınıyor..." : "📍 Buradayım"}
            </button>

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
                  {selected.source === "visited" && (
                    <VisitedPanel
                      visit={selected.data as VisitedLocation}
                      onDelete={deleteVisit}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {addingVisit && (
        <AddVisitDialog
          lat={addingVisit.lat}
          lng={addingVisit.lng}
          onClose={() => setAddingVisit(null)}
          onSaved={() => {
            setAddingVisit(null);
            refresh();
          }}
        />
      )}
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

function VisitedPanel({
  visit,
  onDelete,
}: {
  visit: VisitedLocation;
  onDelete: (id: string) => void;
}) {
  const date = new Date(visit.visitedAt);
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">{visit.label ?? "İsimsiz konum"}</p>
      {visit.customerName && (
        <p className="text-xs text-muted-foreground">👤 {visit.customerName}</p>
      )}
      <p className="text-[11px] text-muted-foreground">
        🕐 {date.toLocaleString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {visit.notes && (
        <div className="text-xs bg-muted/50 p-2 rounded">{visit.notes}</div>
      )}
      <div className="flex gap-2 pt-1">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${visit.lat},${visit.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 text-xs text-center px-3 py-2 bg-[#14141A] text-white rounded"
        >
          Yol tarifi
        </a>
        <button
          onClick={() => onDelete(visit.id)}
          className="px-3 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-xs inline-flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Sil
        </button>
      </div>
    </div>
  );
}

function AddVisitDialog({
  lat,
  lng,
  onClose,
  onSaved,
}: {
  lat: number;
  lng: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      await api("/api/admin/visited-locations", {
        method: "POST",
        body: {
          lat,
          lng,
          label: label.trim() || undefined,
          customerName: customerName.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast.success("Ziyaret kaydedildi");
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📍 Buradayım — Ziyareti kaydet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="text-xs p-2 bg-muted rounded font-mono">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Etiket / Adres (opsiyonel)</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Bebek Cevdetpaşa, sahil"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Müşteri (opsiyonel)</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ahmet Yılmaz"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Not (opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Yer gösterdim, bahçe büyük, fiyat 8M..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            İptal
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-[#14141A] text-white gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
