"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, KeyRound, Loader2, Smartphone } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store";
import type { Admin } from "@/lib/types";

export default function ProfilePage() {
  const admin = useAuth((s) => s.admin);
  const refresh = useAuth((s) => s.refresh);

  const [name, setName] = React.useState(admin?.name ?? "");
  const [phone, setPhone] = React.useState(admin?.phone ?? "");
  const [savingProfile, setSavingProfile] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [savingPwd, setSavingPwd] = React.useState(false);

  const [twoFa, setTwoFa] = React.useState<{ enabled: boolean; pending: boolean } | null>(null);
  const [setupData, setSetupData] = React.useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUri: string;
  } | null>(null);
  const [code, setCode] = React.useState("");
  const [twoFaLoading, setTwoFaLoading] = React.useState(false);
  const [disablePassword, setDisablePassword] = React.useState("");

  React.useEffect(() => {
    setName(admin?.name ?? "");
    setPhone(admin?.phone ?? "");
  }, [admin]);

  React.useEffect(() => {
    api<{ enabled: boolean; pending: boolean }>("/api/auth/2fa/status").then(setTwoFa);
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api<Admin>("/api/auth/profile", {
        method: "PATCH",
        body: { name, phone },
      });
      await refresh();
      toast.success("Profil güncellendi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Yeni şifre en az 8 karakter olmalı");
      return;
    }
    setSavingPwd(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      toast.success("Şifre değiştirildi. Tekrar giriş yapman gerekecek.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata";
      toast.error(message);
    } finally {
      setSavingPwd(false);
    }
  }

  async function startSetup() {
    setTwoFaLoading(true);
    try {
      const res = await api<{ secret: string; otpauthUrl: string; qrCodeDataUri: string }>(
        "/api/auth/2fa/setup",
        { method: "POST" },
      );
      setSetupData(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata";
      toast.error(message);
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function enableTwoFa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaLoading(true);
    try {
      await api("/api/auth/2fa/enable", { method: "POST", body: { code } });
      toast.success("2FA aktif. Tekrar giriş yapman gerekecek.");
      setSetupData(null);
      setCode("");
      setTwoFa({ enabled: true, pending: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata";
      toast.error(message);
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function disableTwoFa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaLoading(true);
    try {
      await api("/api/auth/2fa/disable", { method: "POST", body: { password: disablePassword } });
      toast.success("2FA kapatıldı");
      setDisablePassword("");
      setTwoFa({ enabled: false, pending: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata";
      toast.error(message);
    } finally {
      setTwoFaLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Profil & Güvenlik" description={admin?.email} />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up max-w-3xl">
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Profil</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ad Soyad">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Telefon">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
            <Field label="E-posta">
              <Input value={admin?.email ?? ""} disabled />
            </Field>
            <Button onClick={saveProfile} disabled={savingProfile} className="bg-[#14141A] hover:bg-black text-white">
              {savingProfile ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border flex-row items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> İki Faktörlü Doğrulama
            </CardTitle>
            <Badge variant={twoFa?.enabled ? "success" : "outline"} className="text-[10px]">
              {twoFa?.enabled ? "Aktif" : "Kapalı"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {twoFa?.enabled ? (
              <form onSubmit={disableTwoFa} className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  2FA kapatmak için mevcut şifreni gir.
                </p>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Şifre"
                  />
                  <Button type="submit" variant="destructive" disabled={twoFaLoading} className="gap-1.5">
                    <ShieldOff className="h-3 w-3" />
                    {twoFaLoading ? "..." : "Kapat"}
                  </Button>
                </div>
              </form>
            ) : setupData ? (
              <form onSubmit={enableTwoFa} className="space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>Google Authenticator</strong> veya <strong>Authy</strong>'de QR kodu tara,
                  sonra 6 haneli kodu gir.
                </p>
                <div className="flex gap-3 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupData.qrCodeDataUri}
                    alt="2FA QR"
                    className="w-32 h-32 rounded border border-border"
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Manuel kurulum
                    </p>
                    <code className="block text-[10px] bg-muted rounded px-2 py-1.5 break-all">
                      {setupData.secret}
                    </code>
                  </div>
                </div>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="6 haneli kod"
                  inputMode="numeric"
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={code.length !== 6 || twoFaLoading} className="bg-[#14141A] hover:bg-black text-white">
                    {twoFaLoading ? "..." : "Aktif Et"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setSetupData(null)}>
                    İptal
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">
                  Şifren çalınsa bile yetkisiz girişi engeller. <Smartphone className="inline h-3 w-3 mx-0.5" />
                  Authenticator uygulaması gerekli.
                </p>
                <Button onClick={startSetup} disabled={twoFaLoading} variant="accent" className="gap-1.5">
                  {twoFaLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                  2FA Kur
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={changePassword} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mevcut şifre">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Yeni şifre (en az 8)">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </Field>
              </div>
              <Button type="submit" disabled={savingPwd} className="bg-[#14141A] hover:bg-black text-white">
                {savingPwd ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
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
