"use client";

import * as React from "react";
import { Plus, Calendar, Clock, MapPin, User, Phone, Mail, Trash2, Edit3, Building2, ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import { confirmDialog } from "@/components/admin/confirm-dialog";
import type { Appointment, AppointmentStatus, Listing, Paginated } from "@/lib/types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: "Planlandı",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  NO_SHOW: "Gelmedi",
};
const STATUS_VARIANT: Record<AppointmentStatus, "default" | "warning" | "success" | "destructive"> = {
  SCHEDULED: "warning",
  CONFIRMED: "success",
  COMPLETED: "default",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

export default function AppointmentsPage() {
  const [items, setItems] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"upcoming" | "all">("upcoming");
  const [view, setView] = React.useState<"list" | "calendar">("list");
  const [editing, setEditing] = React.useState<Appointment | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "upcoming") params.set("upcomingOnly", "true");
    api<Appointment[]>(`/api/admin/appointments?${params}`)
      .then(setItems)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Group by date
  const grouped = React.useMemo(() => {
    const m = new Map<string, Appointment[]>();
    items.forEach((a) => {
      const key = new Date(a.startsAt).toISOString().slice(0, 10);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a);
    });
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <>
      <Topbar
        title="Randevular"
        description={`${items.length} ${filter === "upcoming" ? "yaklaşan" : "toplam"}`}
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Yaklaşanlar</SelectItem>
                <SelectItem value="all">Tümü</SelectItem>
              </SelectContent>
            </Select>
            <div className="inline-flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setView("list")}
                className={
                  "px-3 py-2 text-xs flex items-center gap-1.5 transition-colors " +
                  (view === "list"
                    ? "bg-[#14141A] text-white"
                    : "bg-white text-muted-foreground hover:text-foreground")
                }
              >
                <List className="h-3.5 w-3.5" /> Liste
              </button>
              <button
                onClick={() => setView("calendar")}
                className={
                  "px-3 py-2 text-xs flex items-center gap-1.5 transition-colors " +
                  (view === "calendar"
                    ? "bg-[#14141A] text-white"
                    : "bg-white text-muted-foreground hover:text-foreground")
                }
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Takvim
              </button>
            </div>
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="bg-[#14141A] hover:bg-black text-white gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Randevu Ekle
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-8 w-8 mx-auto opacity-30 mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Randevu yok</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setCreating(true)}
                className="text-[#C9A96E] mt-2"
              >
                İlk randevuyu ekle
              </Button>
            </CardContent>
          </Card>
        ) : view === "calendar" ? (
          <CalendarView
            items={items}
            onEdit={(a) => setEditing(a)}
            onChange={refresh}
          />
        ) : (
          <div className="space-y-4">
            {grouped.map(([dateKey, group]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {new Date(dateKey + "T00:00:00").toLocaleDateString("tr-TR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{group.length} randevu</span>
                </div>
                <div className="space-y-1.5">
                  {group.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} onEdit={() => setEditing(a)} onChange={refresh} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <AppointmentDialog
          existing={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            refresh();
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function CalendarView({
  items,
  onEdit,
  onChange,
}: {
  items: Appointment[];
  onEdit: (a: Appointment) => void;
  onChange: () => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    today.toISOString().slice(0, 10),
  );

  // Group appointments by YYYY-MM-DD
  const byDay = React.useMemo(() => {
    const m = new Map<string, Appointment[]>();
    items.forEach((a) => {
      const key = new Date(a.startsAt).toISOString().slice(0, 10);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a);
    });
    return m;
  }, [items]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Monday-first: getDay 0=Sun → shift to 6, others -1
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const monthLabel = cursor.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const dayHeaders = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const todayKey = today.toISOString().slice(0, 10);
  const selectedAppts = selectedDate ? byDay.get(selectedDate) ?? [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar grid */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium capitalize">{monthLabel}</p>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayHeaders.map((d) => (
              <div
                key={d}
                className="text-[10px] tracking-wider uppercase text-muted-foreground text-center py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayNum = idx - firstWeekday + 1;
              const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
              if (!inMonth) {
                return <div key={idx} className="aspect-square" />;
              }
              const date = new Date(year, month, dayNum);
              const key = date.toISOString().slice(0, 10);
              const appts = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(key)}
                  className={
                    "aspect-square flex flex-col items-center justify-start p-1.5 text-xs border rounded transition-colors " +
                    (isSelected
                      ? "border-[#C9A96E] bg-[#C9A96E]/10"
                      : isToday
                        ? "border-[#14141A] bg-[#14141A]/5"
                        : "border-transparent hover:bg-muted")
                  }
                >
                  <span
                    className={
                      "text-xs " + (isToday ? "font-semibold text-[#14141A]" : "text-foreground")
                    }
                  >
                    {dayNum}
                  </span>
                  {appts.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-0.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                      <span className="text-[9px] text-muted-foreground">
                        {appts.length}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day's appointments */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {selectedDate
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Bir gün seç"}
          </p>
          {selectedAppts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Bu gün randevu yok
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedAppts
                .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                .map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    onEdit={() => onEdit(a)}
                    onChange={onChange}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onEdit,
  onChange,
}: {
  appointment: Appointment;
  onEdit: () => void;
  onChange: () => void;
}) {
  const time = new Date(appointment.startsAt).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function deleteAppt() {
    if (
      !(await confirmDialog({
        title: "Randevuyu sil?",
        description: "Bu randevu kalıcı olarak silinecek. Müşteriye bilgi vermeyi unutma.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
    try {
      await api(`/api/admin/appointments/${appointment.id}`, { method: "DELETE" });
      toast.success("Silindi");
      onChange();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(msg);
    }
  }

  return (
    <Card className="hover:border-[#C9A96E] transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="text-center w-12 shrink-0">
            <p className="font-display text-lg font-medium leading-tight">{time}</p>
            <p className="text-[9px] text-muted-foreground uppercase">{appointment.durationMin} dk</p>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{appointment.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
                  {appointment.phone && (
                    <a href={`tel:${appointment.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                      <Phone className="h-2.5 w-2.5" /> {appointment.phone}
                    </a>
                  )}
                  {appointment.email && (
                    <a href={`mailto:${appointment.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                      <Mail className="h-2.5 w-2.5" /> {appointment.email}
                    </a>
                  )}
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[appointment.status]} className="text-[9px] shrink-0">
                {STATUS_LABEL[appointment.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
              {appointment.listing && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-[#C9A96E]" />
                  {appointment.listing.titleTr}
                </span>
              )}
              {appointment.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {appointment.location}
                </span>
              )}
            </div>
            {appointment.notes && (
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{appointment.notes}</p>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <Button size="icon" variant="ghost" onClick={onEdit} className="h-7 w-7">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={deleteAppt} className="h-7 w-7">
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentDialog({
  existing,
  onClose,
  onSaved,
}: {
  existing: Appointment | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = React.useState(() => {
    if (existing) {
      const d = new Date(existing.startsAt);
      return d.toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  });
  const [time, setTime] = React.useState(() => {
    if (existing) {
      const d = new Date(existing.startsAt);
      return d.toTimeString().slice(0, 5);
    }
    return "10:00";
  });
  const [name, setName] = React.useState(existing?.name ?? "");
  const [email, setEmail] = React.useState(existing?.email ?? "");
  const [phone, setPhone] = React.useState(existing?.phone ?? "");
  const [duration, setDuration] = React.useState(existing?.durationMin?.toString() ?? "60");
  const [listingId, setListingId] = React.useState(existing?.listingId ?? "");
  const [location, setLocation] = React.useState(existing?.location ?? "");
  const [notes, setNotes] = React.useState(existing?.notes ?? "");
  const [status, setStatus] = React.useState<AppointmentStatus>(existing?.status ?? "SCHEDULED");
  const [listings, setListings] = React.useState<Pick<Listing, "id" | "titleTr">[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    api<Paginated<Listing>>("/api/admin/listings?pageSize=100")
      .then((res) => setListings(res.items.map((l) => ({ id: l.id, titleTr: l.titleTr }))))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !date || !time) {
      toast.error("Tarih, saat ve isim gerekli");
      return;
    }
    setSubmitting(true);
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      const payload: Record<string, unknown> = {
        startsAt,
        durationMin: parseInt(duration, 10) || 60,
        name,
        status,
      };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (listingId) payload.listingId = listingId;
      if (location) payload.location = location;
      if (notes) payload.notes = notes;

      if (existing) {
        await api(`/api/admin/appointments/${existing.id}`, { method: "PATCH", body: payload });
        toast.success("Randevu güncellendi");
      } else {
        await api("/api/admin/appointments", { method: "POST", body: payload });
        toast.success("Randevu oluşturuldu");
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Randevuyu düzenle" : "Yeni randevu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tarih">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Saat">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Süre (dk)">
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Durum">
                <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Planlandı</SelectItem>
                    <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                    <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                    <SelectItem value="CANCELLED">İptal</SelectItem>
                    <SelectItem value="NO_SHOW">Gelmedi</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <Field label="Müşteri Adı *">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Telefon">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="E-posta">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>

          <Field label="İlan (opsiyonel)">
            <Select value={listingId || "none"} onValueChange={(v) => setListingId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="İlan seç..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                {listings.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.titleTr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Konum / Adres">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="örn: Bebek, sahil yolu önü"
            />
          </Field>

          <Field label="Not">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#14141A] hover:bg-black text-white">
              {submitting ? "Kaydediliyor..." : existing ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
