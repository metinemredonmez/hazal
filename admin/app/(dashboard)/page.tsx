"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  Inbox,
  Star,
  TrendingUp,
  CheckCircle2,
  CircleDashed,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { ListingStats, InquiriesResponse, Inquiry } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişim",
  HOT: "Sıcak",
  CLOSED: "Kapandı",
};

export default function DashboardPage() {
  const [stats, setStats] = React.useState<ListingStats | null>(null);
  const [inquiries, setInquiries] = React.useState<InquiriesResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api<ListingStats>("/api/admin/listings/stats"),
      api<InquiriesResponse>("/api/admin/inquiries?pageSize=5"),
    ])
      .then(([s, i]) => {
        setStats(s);
        setInquiries(i);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Aktif", value: stats?.active ?? 0, icon: Building2, sub: `${stats?.total ?? 0} toplam` },
    { label: "Öne çıkan", value: stats?.featured ?? 0, icon: Star, sub: "Anasayfa" },
    { label: "Görüntülenme", value: stats?.totalViews ?? 0, icon: Eye, sub: "Toplam" },
    {
      label: "Yeni talep",
      value: inquiries?.unreadCount ?? 0,
      icon: Inbox,
      sub: "Cevap bekliyor",
      accent: (inquiries?.unreadCount ?? 0) > 0,
    },
  ];

  return (
    <>
      <Topbar title="Panel" description="Hazal Muti Real Estate" />
      <main className="flex-1 px-4 py-5 space-y-5 animate-fade-up">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, sub, accent }) => (
            <Card key={label} className="group hover:border-[#C9A96E] transition-colors">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <Icon
                    className={
                      "h-3.5 w-3.5 " + (accent ? "text-[#C9A96E]" : "text-muted-foreground")
                    }
                  />
                </div>
                <p className="mt-2 font-display text-2xl font-medium leading-none">
                  {loading ? <Skeleton className="h-6 w-12" /> : value.toLocaleString("tr-TR")}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-xs font-medium">Son Talepler</p>
                <p className="text-[10px] text-muted-foreground">Müşterilerden gelen mesajlar</p>
              </div>
              <Link
                href="/inquiries"
                className="text-[11px] text-[#C9A96E] hover:text-[#B89757] inline-flex items-center gap-1"
              >
                Hepsi <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardContent className="p-2 space-y-1">
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : inquiries && inquiries.items.length > 0 ? (
                inquiries.items.map((inq) => <InquiryRow key={inq.id} inquiry={inq} />)
              ) : (
                <EmptyState icon={Inbox} text="Henüz talep yok" />
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium">En çok görüntülenen</p>
              <p className="text-[10px] text-muted-foreground">İlk 5 ilan</p>
            </div>
            <CardContent className="p-2 space-y-0.5">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : stats && stats.topViewed.length > 0 ? (
                stats.topViewed.map((l, i) => (
                  <Link
                    key={l.id}
                    href={`/admin/listings/${l.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-display text-sm font-medium text-[#C9A96E] w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{l.titleTr}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{l.titleEn}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="h-2.5 w-2.5" />
                      {l.views}
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState icon={TrendingUp} text="Veri yok" />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatusCard label="Taslak" value={stats?.draft ?? 0} icon={CircleDashed} />
          <StatusCard label="Satıldı" value={stats?.sold ?? 0} icon={CheckCircle2} />
          <StatusCard label="Kiralandı" value={stats?.rented ?? 0} icon={Tag} />
        </section>
      </main>
    </>
  );
}

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const variant: "warning" | "default" | "destructive" | "success" =
    inquiry.status === "NEW"
      ? "warning"
      : inquiry.status === "HOT"
      ? "destructive"
      : inquiry.status === "CLOSED"
      ? "default"
      : "success";

  return (
    <Link
      href="/inquiries"
      className="flex items-start gap-2 px-2 py-2 rounded hover:bg-muted/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium truncate">{inquiry.name}</p>
          <Badge variant={variant} className="text-[9px] px-1.5 py-0">
            {STATUS_LABEL[inquiry.status]}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{inquiry.message}</p>
        <p className="text-[9px] text-muted-foreground mt-1">{formatDateTime(inquiry.createdAt)}</p>
      </div>
    </Link>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className="rounded-full bg-secondary p-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-lg font-medium leading-none">
            {value.toLocaleString("tr-TR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <Icon className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
      <p className="text-[11px]">{text}</p>
    </div>
  );
}
