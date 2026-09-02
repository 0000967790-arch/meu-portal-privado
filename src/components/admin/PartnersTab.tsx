import { useEffect, useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listPartnersAdmin,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/lib/partners.functions";
import { uploadImageAndGetUrl, trimLogoFile } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Upload, Store } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  discount: string | null;
  benefit: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  services: string[];
  logo_url: string | null;
  active: boolean;
  sort_order: number;
};

const emptyDraft = {
  name: "", category: "", description: "", discount: "", benefit: "",
  address: "", phone: "", website: "", hours: "", services: "", logo_url: "",
  active: true, sort_order: 0,
};

type Draft = typeof emptyDraft;

function toDraft(p: Partner): Draft {
  return {
    name: p.name,
    category: p.category ?? "",
    description: p.description ?? "",
    discount: p.discount ?? "",
    benefit: p.benefit ?? "",
    address: p.address ?? "",
    phone: p.phone ?? "",
    website: p.website ?? "",
    hours: p.hours ?? "",
    services: (p.services ?? []).join("\n"),
    logo_url: p.logo_url ?? "",
    active: p.active,
    sort_order: p.sort_order,
  };
}

function draftToPayload(d: Draft) {
  return {
    name: d.name.trim(),
    category: d.category.trim(),
    description: d.description.trim(),
    discount: d.discount.trim(),
    benefit: d.benefit.trim(),
    address: d.address.trim(),
    phone: d.phone.trim(),
    website: d.website.trim(),
    hours: d.hours.trim(),
    services: d.services.split("\n").map((s) => s.trim()).filter(Boolean),
    logo_url: d.logo_url.trim(),
    active: d.active,
    sort_order: Number.isFinite(d.sort_order) ? d.sort_order : 0,
  };
}

export function PartnersTab() {
  const fetchList = useServerFn(listPartnersAdmin);
  const createFn = useServerFn(createPartner);
  const updateFn = useServerFn(updatePartner);
  const deleteFn = useServerFn(deletePartner);

  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const newFileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchList();
      setItems(res.partners as Partner[]);
    } catch { toast.error("Erro ao carregar parceiros"); }
    finally { setLoading(false); }
  }, [fetchList]);

  useEffect(() => { refresh(); }, [refresh]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = draftToPayload(draft);
    if (payload.name.length < 2) return toast.error("Informe o nome do parceiro");
    setSubmitting(true);
    try {
      await createFn({ data: payload });
      toast.success("Parceiro cadastrado!");
      setDraft(emptyDraft);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally { setSubmitting(false); }
  };

  const onNewLogoPick = async (file: File) => {
    setUploadingNew(true);
    try {
      const trimmed = await trimLogoFile(file);
      const url = await uploadImageAndGetUrl("partner-logos", trimmed);
      setDraft((d) => ({ ...d, logo_url: url }));
      toast.success("Logo carregada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar logo");
    } finally {
      setUploadingNew(false);
      if (newFileRef.current) newFileRef.current.value = "";
    }
  };

  return (
    <div>
      <form onSubmit={onCreate} className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <h2 className="col-span-full text-lg font-semibold flex items-center gap-2">
          <Store className="h-5 w-5" /> Novo parceiro
        </h2>

        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-[auto,1fr] items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {draft.logo_url ? (
                <img src={draft.logo_url} alt="Prévia da logo" className="h-full w-full object-contain" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <input ref={newFileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onNewLogoPick(f); }} />
            <Button type="button" size="sm" variant="outline" disabled={uploadingNew}
              onClick={() => newFileRef.current?.click()}>
              {uploadingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="mr-1.5 h-4 w-4" /> Logo</>}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={120} required />
            </div>
            <div>
              <Label>Categoria (tag)</Label>
              <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} maxLength={60} placeholder="Ex: Peças, Pneus…" />
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição curta</Label>
              <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={500} />
            </div>
          </div>
        </div>

        <div>
          <Label>Benefício (destaque)</Label>
          <Input value={draft.benefit} onChange={(e) => setDraft({ ...draft, benefit: e.target.value })} maxLength={200} placeholder="Ex: 10% off na apresentação do cartão" />
        </div>
        <div>
          <Label>Desconto</Label>
          <Input value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: e.target.value })} maxLength={120} placeholder="Ex: Até 15%" />
        </div>
        <div className="sm:col-span-2">
          <Label>Endereço</Label>
          <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} maxLength={200} />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} maxLength={30} />
        </div>
        <div>
          <Label>Site</Label>
          <Input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} maxLength={200} placeholder="https://" />
        </div>
        <div>
          <Label>Horários</Label>
          <Input value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} maxLength={120} />
        </div>
        <div>
          <Label>Ordem</Label>
          <Input type="number" value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} />
        </div>
        <div className="sm:col-span-2">
          <Label>Serviços (um por linha)</Label>
          <Textarea rows={4} value={draft.services}
            onChange={(e) => setDraft({ ...draft, services: e.target.value })}
            placeholder={"Alinhamento e balanceamento\nRodízio de pneus"} />
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
            Ativo (visível no site)
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Cadastrar parceiro</>}
          </Button>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Parceiros ({items.length})</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="divide-y">
          {items.length === 0 && !loading && (
            <p className="p-6 text-sm text-muted-foreground">Nenhum parceiro cadastrado.</p>
          )}
          {items.map((p) => (
            <PartnerRow key={p.id} partner={p} onSaved={refresh} deleteFn={deleteFn} updateFn={updateFn} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerRow({
  partner, onSaved, deleteFn, updateFn,
}: {
  partner: Partner;
  onSaved: () => void;
  deleteFn: (args: { data: { id: string } }) => Promise<unknown>;
  updateFn: (args: { data: { id: string; values: ReturnType<typeof draftToPayload> } }) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(partner));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateFn({ data: { id: partner.id, values: draftToPayload(draft) } });
      toast.success("Parceiro atualizado");
      onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!confirm(`Excluir parceiro "${partner.name}"?`)) return;
    try { await deleteFn({ data: { id: partner.id } }); toast.success("Excluído"); onSaved(); }
    catch { toast.error("Erro ao excluir"); }
  };

  const onLogoPick = async (file: File) => {
    setUploading(true);
    try {
      const trimmed = await trimLogoFile(file);
      const url = await uploadImageAndGetUrl("partner-logos", trimmed);
      setDraft((d) => ({ ...d, logo_url: url }));
      toast.success("Logo atualizada — clique em Salvar para confirmar");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Erro ao enviar"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {partner.logo_url ? <img src={partner.logo_url} alt="" className="h-full w-full object-contain" /> : <Store className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{partner.name}</p>
          <p className="text-xs text-muted-foreground">
            {partner.category || "—"} {partner.address ? `· ${partner.address}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${partner.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
          {partner.active ? "Ativo" : "Inativo"}
        </span>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Fechar" : "Editar"}
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-background">
              {draft.logo_url ? <img src={draft.logo_url} alt="" className="h-full w-full object-contain" /> : <Store className="h-6 w-6 text-muted-foreground" />}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoPick(f); }} />
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="mr-1.5 h-4 w-4" /> Trocar logo</>}
            </Button>
          </div>
          <div><Label>Nome</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div><Label>Categoria</Label><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Descrição</Label><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
          <div><Label>Benefício</Label><Input value={draft.benefit} onChange={(e) => setDraft({ ...draft, benefit: e.target.value })} /></div>
          <div><Label>Desconto</Label><Input value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Endereço</Label><Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
          <div><Label>Site</Label><Input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /></div>
          <div><Label>Horários</Label><Input value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} /></div>
          <div><Label>Ordem</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })} /></div>
          <div className="sm:col-span-2"><Label>Serviços (um por linha)</Label>
            <Textarea rows={4} value={draft.services} onChange={(e) => setDraft({ ...draft, services: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              Ativo
            </label>
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
