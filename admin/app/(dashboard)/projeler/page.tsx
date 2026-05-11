"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Loader2, Landmark, ExternalLink, GripVertical, Eye, EyeOff } from "lucide-react";
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
import { confirmDialog } from "@/components/admin/confirm-dialog";

interface Spec {
  labelTr: string;
  labelEn: string;
  valueTr: string;
  valueEn: string;
}

interface Project {
  id: string;
  slug: string;
  brandTr: string;
  brandEn: string;
  nameTr: string;
  nameEn: string;
  taglineTr: string;
  taglineEn: string;
  locationTr: string;
  locationEn: string;
  descriptionTr: string;
  descriptionEn: string;
  heroImage: string;
  heroVideo: string | null;
  specs: Spec[];
  featuresTr: string[];
  featuresEn: string[];
  gallery: string[];
  brochureUrl: string | null;
  statusTr: string;
  statusEn: string;
  statusTone: "live" | "exclusive";
  featured: boolean;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_PROJECT: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  brandTr: "Atılgan İnşaat",
  brandEn: "Atılgan İnşaat",
  nameTr: "",
  nameEn: "",
  taglineTr: "",
  taglineEn: "",
  locationTr: "",
  locationEn: "",
  descriptionTr: "",
  descriptionEn: "",
  heroImage: "",
  heroVideo: null,
  specs: [],
  featuresTr: [],
  featuresEn: [],
  gallery: [],
  brochureUrl: null,
  statusTr: "Satışı devam eden",
  statusEn: "On sale",
  statusTone: "live",
  featured: true,
  order: 0,
  isPublished: true,
};

export default function ProjelerPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [open, setOpen] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<Project[]>("/api/admin/projects");
      setProjects(data);
    } catch (e: any) {
      toast.error(e?.message || "Projeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const onNew = () => {
    setEditing({ ...EMPTY_PROJECT, id: "", createdAt: "", updatedAt: "" });
    setOpen(true);
  };

  const onEdit = (p: Project) => {
    setEditing({
      ...p,
      specs: Array.isArray(p.specs) ? p.specs : [],
      featuresTr: p.featuresTr ?? [],
      featuresEn: p.featuresEn ?? [],
      gallery: p.gallery ?? [],
    });
    setOpen(true);
  };

  const onSave = async () => {
    if (!editing) return;
    if (!editing.nameTr || !editing.nameEn) {
      toast.error("Türkçe ve İngilizce isim zorunlu");
      return;
    }
    const payload = { ...editing };
    delete (payload as any).createdAt;
    delete (payload as any).updatedAt;
    try {
      if (editing.id) {
        await api(`/api/admin/projects/${editing.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast.success("Güncellendi");
      } else {
        delete (payload as any).id;
        await api("/api/admin/projects", { method: "POST", body: payload });
        toast.success("Oluşturuldu");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Kaydedilemedi");
    }
  };

  const onDelete = async (p: Project) => {
    if (!(await confirmDialog({ title: `${p.nameTr} silinsin mi?`, confirmLabel: "Sil" }))) return;
    try {
      await api(`/api/admin/projects/${p.id}`, { method: "DELETE" });
      toast.success("Silindi");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Silinemedi");
    }
  };

  return (
    <>
      <Topbar
        title="Projeler"
        description="Atılgan Royal & Oasis gibi geliştirici projeleri — anasayfa ve /koleksiyon'da görünür"
        actions={
          <Button onClick={onNew}>
            <Plus className="h-4 w-4" />
            Yeni Proje
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-6 space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Landmark className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="mb-4">Henüz proje yok</p>
              <Button onClick={onNew} variant="outline">
                <Plus className="h-4 w-4" />
                İlk projeyi ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex">
                  {p.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.heroImage} alt="" className="w-32 h-32 object-cover bg-muted" />
                  )}
                  <CardContent className="flex-1 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                          {p.brandTr}
                        </p>
                        <h3 className="font-semibold">{p.nameTr}</h3>
                        <p className="text-xs text-muted-foreground">{p.locationTr}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {p.featured && <Badge variant="secondary">Öne Çıkan</Badge>}
                        {!p.isPublished && (
                          <Badge variant="outline" className="gap-1">
                            <EyeOff className="h-3 w-3" /> Gizli
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.taglineTr}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>
                        <Edit3 className="h-3.5 w-3.5" />
                        Düzenle
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(p)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </Button>
                      <a
                        href={`https://hazalmuti.com/koleksiyon`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-[#C9A96E] hover:underline inline-flex items-center gap-1"
                      >
                        Sitede gör <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Projeyi Düzenle" : "Yeni Proje"}</DialogTitle>
          </DialogHeader>

          {editing && <ProjectForm value={editing} onChange={setEditing as (p: Project) => void} />}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={onSave}>
              {editing?.id ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectForm({
  value,
  onChange,
}: {
  value: Project;
  onChange: (p: Project) => void;
}) {
  const set = (patch: Partial<Project>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      {/* Basic */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-2">Temel</h4>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug (URL — boş bırakırsan isimden üretir)">
            <Input value={value.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="atilgan-oasis" />
          </Field>
          <Field label="Marka (TR / EN aynı olabilir)">
            <Input value={value.brandTr} onChange={(e) => set({ brandTr: e.target.value, brandEn: e.target.value })} />
          </Field>
          <Field label="İsim (TR)" required>
            <Input value={value.nameTr} onChange={(e) => set({ nameTr: e.target.value })} />
          </Field>
          <Field label="İsim (EN)" required>
            <Input value={value.nameEn} onChange={(e) => set({ nameEn: e.target.value })} />
          </Field>
          <Field label="Konum (TR)">
            <Input value={value.locationTr} onChange={(e) => set({ locationTr: e.target.value })} placeholder="Mavişehir · Karşıyaka · İzmir" />
          </Field>
          <Field label="Konum (EN)">
            <Input value={value.locationEn} onChange={(e) => set({ locationEn: e.target.value })} placeholder="Mavişehir · Karşıyaka · İzmir" />
          </Field>
        </div>
        <Field label="Tagline (TR) — kart altındaki kısa açıklama">
          <Textarea rows={2} value={value.taglineTr} onChange={(e) => set({ taglineTr: e.target.value })} />
        </Field>
        <Field label="Tagline (EN)">
          <Textarea rows={2} value={value.taglineEn} onChange={(e) => set({ taglineEn: e.target.value })} />
        </Field>
        <Field label="Açıklama (TR) — proje detay sayfası">
          <Textarea rows={4} value={value.descriptionTr} onChange={(e) => set({ descriptionTr: e.target.value })} />
        </Field>
        <Field label="Açıklama (EN)">
          <Textarea rows={4} value={value.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} />
        </Field>
      </section>

      {/* Media */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-2">Görsel & Video</h4>
        <Field label="Hero Görsel URL (kartta poster, detayda fallback)">
          <Input value={value.heroImage} onChange={(e) => set({ heroImage: e.target.value })} placeholder="/sample-apartments/DSC_0276.jpg" />
        </Field>
        <Field label="Hero Video URL (opsiyonel — varsa autoplay)">
          <Input value={value.heroVideo ?? ""} onChange={(e) => set({ heroVideo: e.target.value || null })} placeholder="/showcase/oasis-2026-02-24.mp4" />
        </Field>
        <Field label="Galeri URL'leri (her satıra bir URL)">
          <Textarea
            rows={5}
            value={value.gallery.join("\n")}
            onChange={(e) => set({ gallery: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            placeholder={"/sample-apartments/DSC_0214.jpg\n/sample-apartments/DSC_0241.jpg"}
          />
        </Field>
        <Field label="Broşür / Dış Link (opsiyonel)">
          <Input value={value.brochureUrl ?? ""} onChange={(e) => set({ brochureUrl: e.target.value || null })} placeholder="https://atilganinsaat.com/proje/oasis" />
        </Field>
      </section>

      {/* Specs */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-2 flex items-center justify-between">
          Spec Tablosu (Daire tipleri, m², toplam villa…)
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              set({
                specs: [...value.specs, { labelTr: "", labelEn: "", valueTr: "", valueEn: "" }],
              })
            }
          >
            <Plus className="h-3 w-3" /> Spec Ekle
          </Button>
        </h4>
        {value.specs.length === 0 && (
          <p className="text-xs text-muted-foreground">Henüz spec yok.</p>
        )}
        {value.specs.map((s, idx) => (
          <div key={idx} className="grid grid-cols-9 gap-2 items-end">
            <div className="col-span-2">
              <Label className="text-[10px]">Etiket (TR)</Label>
              <Input
                value={s.labelTr}
                onChange={(e) => {
                  const next = [...value.specs];
                  next[idx] = { ...s, labelTr: e.target.value };
                  set({ specs: next });
                }}
                placeholder="Daire tipleri"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Etiket (EN)</Label>
              <Input
                value={s.labelEn}
                onChange={(e) => {
                  const next = [...value.specs];
                  next[idx] = { ...s, labelEn: e.target.value };
                  set({ specs: next });
                }}
                placeholder="Villa types"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Değer (TR)</Label>
              <Input
                value={s.valueTr}
                onChange={(e) => {
                  const next = [...value.specs];
                  next[idx] = { ...s, valueTr: e.target.value };
                  set({ specs: next });
                }}
                placeholder="4+1 · 5+1 · 8+1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Değer (EN)</Label>
              <Input
                value={s.valueEn}
                onChange={(e) => {
                  const next = [...value.specs];
                  next[idx] = { ...s, valueEn: e.target.value };
                  set({ specs: next });
                }}
                placeholder="4+1 · 5+1 · 8+1"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => set({ specs: value.specs.filter((_, i) => i !== idx) })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-2">Özellikler</h4>
        <Field label="Özellikler (TR) — her satıra bir tane">
          <Textarea
            rows={6}
            value={value.featuresTr.join("\n")}
            onChange={(e) => set({ featuresTr: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            placeholder={"Her villaya özel yüzme havuzu\nAkıllı ev sistemleri\n7/24 güvenlik"}
          />
        </Field>
        <Field label="Özellikler (EN)">
          <Textarea
            rows={6}
            value={value.featuresEn.join("\n")}
            onChange={(e) => set({ featuresEn: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          />
        </Field>
      </section>

      {/* Status */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold border-b pb-2">Durum & Görünüm</h4>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Status (TR)">
            <Input value={value.statusTr} onChange={(e) => set({ statusTr: e.target.value })} placeholder="Satışı devam eden" />
          </Field>
          <Field label="Status (EN)">
            <Input value={value.statusEn} onChange={(e) => set({ statusEn: e.target.value })} placeholder="On sale" />
          </Field>
          <Field label="Status Tarzı">
            <Select value={value.statusTone} onValueChange={(v) => set({ statusTone: v as "live" | "exclusive" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live (altın dolu rozet)</SelectItem>
                <SelectItem value="exclusive">Exclusive (çerçeveli, davet ile)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Sıralama (küçük öncelikli)">
            <Input
              type="number"
              value={value.order}
              onChange={(e) => set({ order: parseInt(e.target.value || "0", 10) })}
            />
          </Field>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.featured}
                onChange={(e) => set({ featured: e.target.checked })}
              />
              Öne çıkan (homepage'de göster)
            </label>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.isPublished}
                onChange={(e) => set({ isPublished: e.target.checked })}
              />
              Yayında
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}
