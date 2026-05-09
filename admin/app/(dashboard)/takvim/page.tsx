"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  X,
  Calendar as CalendarIcon,
  Home,
  FileWarning,
  CreditCard,
  ClipboardCheck,
  Megaphone,
  MapPin,
  Bell,
  Star,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

type EventType =
  | "APPOINTMENT"
  | "OPEN_HOUSE"
  | "LISTING_EXPIRY"
  | "CONTRACT_END"
  | "PAYMENT_DUE"
  | "INSPECTION"
  | "MARKETING_ACTION"
  | "PLANNED_VISIT"
  | "REMINDER"
  | "OTHER";

interface CalendarItem {
  id: string;
  type: EventType;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  allDay?: boolean;
  color?: string | null;
  location?: string | null;
  customerName?: string | null;
  status?: string;
  _source: "event" | "appointment";
  _appointmentId?: string;
  listing?: { slug: string; titleTr: string; district?: string | null } | null;
}

interface CombinedResponse {
  events: CalendarItem[];
  appointments: CalendarItem[];
}

const TYPE_META: Record<
  EventType,
  { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  APPOINTMENT: { label: "Randevu", color: "#C9A96E", bg: "bg-[#C9A96E]/15", icon: Star },
  OPEN_HOUSE: { label: "Açık Ev", color: "#7C3AED", bg: "bg-purple-500/15", icon: Home },
  LISTING_EXPIRY: { label: "İlan Süresi", color: "#EAB308", bg: "bg-yellow-500/15", icon: FileWarning },
  CONTRACT_END: { label: "Sözleşme Sonu", color: "#DC2626", bg: "bg-red-500/15", icon: ClipboardCheck },
  PAYMENT_DUE: { label: "Tahsilat", color: "#16A34A", bg: "bg-green-600/15", icon: CreditCard },
  INSPECTION: { label: "Ekspertiz", color: "#0891B2", bg: "bg-cyan-600/15", icon: ClipboardCheck },
  MARKETING_ACTION: { label: "Pazarlama", color: "#DB2777", bg: "bg-pink-600/15", icon: Megaphone },
  PLANNED_VISIT: { label: "Ziyaret", color: "#0EA5E9", bg: "bg-sky-500/15", icon: MapPin },
  REMINDER: { label: "Hatırlatma", color: "#737373", bg: "bg-neutral-500/15", icon: Bell },
  OTHER: { label: "Diğer", color: "#525252", bg: "bg-neutral-700/10", icon: CalendarIcon },
};

const ALL_TYPES: EventType[] = [
  "APPOINTMENT",
  "OPEN_HOUSE",
  "LISTING_EXPIRY",
  "CONTRACT_END",
  "PAYMENT_DUE",
  "INSPECTION",
  "MARKETING_ACTION",
  "PLANNED_VISIT",
  "REMINDER",
];

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function TakvimPage() {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [items, setItems] = React.useState<CalendarItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hiddenTypes, setHiddenTypes] = React.useState<Set<EventType>>(new Set());
  const [selected, setSelected] = React.useState<CalendarItem | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createDate, setCreateDate] = React.useState<Date | null>(null);

  const fromDate = cursor;
  const toDate = React.useMemo(() => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [cursor]);

  const fetchEvents = React.useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });
    api<CombinedResponse>(`/api/admin/calendar-events/combined?${sp}`)
      .then((res) => {
        const all: CalendarItem[] = [...res.events, ...res.appointments];
        setItems(all);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const visibleItems = items.filter((i) => !hiddenTypes.has(i.type));

  // Build month grid
  const monthGrid = React.useMemo(() => {
    const first = new Date(cursor);
    first.setDate(1);
    const dayOfWeek = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(first);
    start.setDate(first.getDate() - dayOfWeek);

    const days: Array<{ date: Date; inMonth: boolean; events: CalendarItem[] }> = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayEvents = visibleItems.filter(
        (it) => new Date(it.startsAt).toISOString().slice(0, 10) === dateStr,
      );
      dayEvents.sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
      days.push({
        date: d,
        inMonth: d.getMonth() === cursor.getMonth(),
        events: dayEvents,
      });
    }
    return days;
  }, [cursor, visibleItems]);

  const monthLabel = cursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const navMonth = (delta: number) => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <Topbar
        title="Takvim"
        description={`${visibleItems.length} etkinlik · ${monthLabel}`}
      />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const d = new Date();
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                setCursor(d);
              }}
            >
              Bugün
            </Button>
            <Button variant="outline" size="sm" onClick={() => navMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="ml-2 font-display text-2xl tracking-wide capitalize">
              {monthLabel}
            </h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[#C9A96E] ml-2" />}
          </div>

          <Button
            onClick={() => {
              setCreateDate(new Date());
              setCreateOpen(true);
            }}
            className="bg-[#14141A] hover:bg-black text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Yeni Etkinlik
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mr-1">
            Filtrele:
          </span>
          {ALL_TYPES.map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const hidden = hiddenTypes.has(t);
            const count = items.filter((i) => i.type === t).length;
            return (
              <button
                key={t}
                onClick={() => {
                  setHiddenTypes((prev) => {
                    const next = new Set(prev);
                    if (next.has(t)) next.delete(t);
                    else next.add(t);
                    return next;
                  });
                }}
                className={
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all " +
                  (hidden
                    ? "border-border bg-transparent text-muted-foreground/60 line-through"
                    : `border-transparent ${meta.bg} text-foreground`)
                }
                style={!hidden ? { borderColor: `${meta.color}40` } : undefined}
              >
                <Icon className="h-3 w-3" style={{ color: meta.color }} />
                {meta.label}
                {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Month grid */}
        <div className="border rounded-md overflow-hidden bg-card">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground text-center"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 grid-rows-6">
            {monthGrid.map((day, idx) => {
              const isToday = day.date.getTime() === today.getTime();
              const isWeekend = idx % 7 >= 5;
              return (
                <div
                  key={idx}
                  className={
                    "border-r border-b last:border-r-0 min-h-[110px] p-1.5 flex flex-col gap-1 " +
                    (day.inMonth ? "bg-card" : "bg-muted/30") +
                    (isWeekend ? " bg-opacity-50" : "")
                  }
                >
                  <button
                    onClick={() => {
                      setCreateDate(day.date);
                      setCreateOpen(true);
                    }}
                    className={
                      "text-[11px] font-mono w-7 h-7 flex items-center justify-center rounded-full transition-colors " +
                      (isToday
                        ? "bg-[#C9A96E] text-[#14141A] font-medium"
                        : day.inMonth
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground/50 hover:bg-muted")
                    }
                    title="Bu güne etkinlik ekle"
                  >
                    {day.date.getDate()}
                  </button>
                  <div className="space-y-0.5 overflow-hidden">
                    {day.events.slice(0, 3).map((ev) => {
                      const meta = TYPE_META[ev.type];
                      const time = new Date(ev.startsAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelected(ev)}
                          className={
                            "w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate transition-colors hover:opacity-80 " +
                            meta.bg
                          }
                          style={{ borderLeft: `2px solid ${meta.color}` }}
                          title={ev.title}
                        >
                          <span className="font-mono opacity-70 mr-1">{time}</span>
                          {ev.title}
                        </button>
                      );
                    })}
                    {day.events.length > 3 && (
                      <p className="text-[9px] text-muted-foreground px-1">
                        +{day.events.length - 3} daha
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && <EventDetail item={selected} onDeleted={() => {
            setSelected(null);
            fetchEvents();
          }} />}
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <CreateEventForm
            initialDate={createDate ?? new Date()}
            onCreated={() => {
              setCreateOpen(false);
              fetchEvents();
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventDetail({
  item,
  onDeleted,
}: {
  item: CalendarItem;
  onDeleted: () => void;
}) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const date = new Date(item.startsAt);

  const handleDelete = async () => {
    if (item._source !== "event") {
      toast.info("Randevular bu sayfadan silinmez. Randevular sekmesini aç.");
      return;
    }
    if (!confirm("Bu etkinliği silmek istediğine emin misin?")) return;
    try {
      await api(`/api/admin/calendar-events/${item.id}`, { method: "DELETE" });
      toast.success("Etkinlik silindi");
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silinemedi");
    }
  };

  return (
    <>
      <DialogHeader>
        <div
          className="inline-flex items-center gap-2 self-start px-2 py-1 rounded-full text-[10px] tracking-wider uppercase"
          style={{ background: `${meta.color}20`, color: meta.color }}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </div>
        <DialogTitle className="text-xl font-display">{item.title}</DialogTitle>
        <DialogDescription>
          {date.toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          ·{" "}
          {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm">
        {item.description && (
          <p className="text-foreground/80 whitespace-pre-line">{item.description}</p>
        )}
        {item.customerName && (
          <p className="text-xs">
            <span className="text-muted-foreground">Müşteri:</span> {item.customerName}
          </p>
        )}
        {item.location && (
          <p className="text-xs flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[#C9A96E]" /> {item.location}
          </p>
        )}
        {item.listing && (
          <Link
            href={`/listings`}
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:underline"
          >
            <Home className="h-3 w-3" /> {item.listing.titleTr}
          </Link>
        )}
        {item.status && (
          <p className="text-[10px] tracking-wider uppercase text-muted-foreground">
            Durum: {item.status}
          </p>
        )}
      </div>

      <DialogFooter>
        {item._source === "appointment" && (
          <Button asChild variant="outline">
            <Link href={`/appointments`}>Randevulara git</Link>
          </Button>
        )}
        {item._source === "event" && (
          <Button variant="destructive" onClick={handleDelete}>
            Sil
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

function CreateEventForm({
  initialDate,
  onCreated,
  onCancel,
}: {
  initialDate: Date;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = React.useState<EventType>("REMINDER");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [date, setDate] = React.useState(initialDate.toISOString().slice(0, 10));
  const [time, setTime] = React.useState("09:00");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Başlık zorunlu");
      return;
    }
    setSubmitting(true);
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      await api("/api/admin/calendar-events", {
        method: "POST",
        body: {
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startsAt,
          status: "PLANNED",
        },
      });
      toast.success("Etkinlik oluşturuldu");
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Yeni Etkinlik</DialogTitle>
        <DialogDescription>
          Randevu dışı etkinlikler buradan oluşturulur (sözleşme bitişi, açık ev, ekspertiz vb).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Tip
          </Label>
          <Select value={type} onValueChange={(v) => setType(v as EventType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_TYPES.filter((t) => t !== "APPOINTMENT").map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_META[t].label}
                </SelectItem>
              ))}
              <SelectItem value="OTHER">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Başlık *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bebek 3+1 — sözleşme bitişi"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
              Tarih
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
              Saat
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Konum (opsiyonel)
          </Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bebek Cad. No:12"
          />
        </div>

        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Açıklama (opsiyonel)
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          İptal
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#14141A] hover:bg-black text-white gap-2"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Oluştur
        </Button>
      </DialogFooter>
    </form>
  );
}
