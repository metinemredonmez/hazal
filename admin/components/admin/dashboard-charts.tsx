"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { TimeseriesResponse } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişim",
  HOT: "Sıcak",
  CLOSED: "Kapandı",
};
const STATUS_COLORS: Record<string, string> = {
  NEW: "#C9A96E",
  CONTACTED: "#10b981",
  HOT: "#dc2626",
  CLOSED: "#6e6e73",
};

function tickFormatter(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export function DashboardCharts() {
  const [data, setData] = React.useState<TimeseriesResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api<TimeseriesResponse>("/api/admin/listings/stats/timeseries?days=30")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton className="h-48 lg:col-span-2" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (!data) return null;

  const merged = data.inquiries.map((p, i) => ({
    date: p.date,
    talep: p.count,
    ilan: data.listingsCreated[i]?.count ?? 0,
  }));

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <p className="text-xs font-medium">Son 30 gün</p>
          <p className="text-[10px] text-muted-foreground">Talepler ve yeni ilanlar</p>
        </div>
        <CardContent className="p-3 pt-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged} margin={{ top: 5, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(merged.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="talep"
                  stroke="#C9A96E"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Talep"
                />
                <Line
                  type="monotone"
                  dataKey="ilan"
                  stroke="#14141A"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 3 }}
                  name="Yeni ilan"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 px-2 mt-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C9A96E]" /> Talep
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#14141A]" /> Yeni ilan
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-medium">Talep durumları</p>
          <p className="text-[10px] text-muted-foreground">Tüm zamanlar</p>
        </div>
        <CardContent className="p-3 pt-4">
          {data.inquiriesByStatus.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[10px] text-muted-foreground">
              Veri yok
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.inquiriesByStatus.map((s) => ({
                    label: STATUS_LABELS[s.status] ?? s.status,
                    count: s.count,
                    fill: STATUS_COLORS[s.status] ?? "#C9A96E",
                  }))}
                  margin={{ top: 5, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.inquiriesByStatus.map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s.status] ?? "#C9A96E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
