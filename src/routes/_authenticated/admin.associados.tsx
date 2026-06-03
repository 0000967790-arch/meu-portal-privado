import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listAssociates,
  createAssociate,
  setAssociateActive,
  deleteAssociate,
  getIsAdmin,
} from "@/lib/associates.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ShieldOff, ShieldCheck, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

type ParsedRow = { full_name: string; cpf: string; phone: string; placa: string };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

function pickKey(row: Record<string, unknown>, candidates: string[]): string {
  for (const key of Object.keys(row)) {
    const k = norm(key);
    if (candidates.some((c) => k.includes(c))) {
      const v = row[key];
      if (v != null) return String(v);
    }
  }
  return "";
}

function rowsFromRecords(records: Record<string, unknown>[]): ParsedRow[] {
  return records
    .map((r) => {
      const full_name = pickKey(r, ["nome", "name"]).trim();
      const cpf = pickKey(r, ["cpf"]).replace(/\D/g, "");
      const phone = pickKey(r, ["telefone", "phone", "celular", "fone"]).trim();
      const placa = pickKey(r, ["placa", "plate"]).toUpperCase().replace(/[^A-Z0-9]/g, "");
      return { full_name, cpf, phone, placa };
    })
    .filter((r) => r.full_name && r.cpf.length === 11 && r.placa.length === 7);
}

async function parseFile(file: File): Promise<ParsedRow[]> {
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    return rowsFromRecords(json);
  }

  if (name.endsWith(".docx")) {
    const { value: text } = await mammoth.extractRawText({ arrayBuffer: buf });
    // Try to parse as table-like rows: name | cpf | phone | placa per line
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const records: Record<string, unknown>[] = [];
    for (const line of lines) {
      const parts = line.split(/\s*[|;,\t]\s*/);
      if (parts.length >= 3) {
        records.push({ nome: parts[0], cpf: parts[1], telefone: parts[2] ?? "", placa: parts[3] ?? parts[2] });
      }
    }
    return rowsFromRecords(records);
  }

  throw new Error("Formato não suportado. Use .xlsx, .xls, .csv ou .docx");
}

export const Route = createFileRoute("/_authenticated/admin/associados")({
  head: () => ({ meta: [{ title: "Admin — Associados" }] }),
  component: AdminAssociados,
});

type Associate = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  card_number: string;
  active: boolean;
  created_at: string;
  user_id: string | null;
};

function AdminAssociados() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchList = useServerFn(listAssociates);
  const createFn = useServerFn(createAssociate);
  const toggleFn = useServerFn(setAssociateActive);
  const deleteFn = useServerFn(deleteAssociate);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [placa, setPlaca] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchList();
      setItems(res.associates as Associate[]);
    } catch {
      toast.error("Erro ao carregar associados");
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  useEffect(() => {
    checkAdmin().then((res) => {
      if (!res.isAdmin) {
        toast.error("Acesso restrito ao administrador.");
        navigate({ to: "/beneficios" });
        setAuthorized(false);
      } else {
        setAuthorized(true);
        refresh();
      }
    });
  }, [checkAdmin, navigate, refresh]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanCpf.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }
    if (cleanPlaca.length !== 7) {
      toast.error("Placa deve ter 7 caracteres (letras e números)");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Informe o nome completo");
      return;
    }
    setSubmitting(true);
    try {
      await createFn({ data: { full_name: name.trim(), cpf: cleanCpf, phone: phone.trim(), placa: cleanPlaca } });
      toast.success("Associado cadastrado!");
      setName(""); setCpf(""); setPhone(""); setPlaca("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggle = async (a: Associate) => {
    try {
      await toggleFn({ data: { id: a.id, active: !a.active } });
      refresh();
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const onDelete = async (a: Associate) => {
    if (!confirm(`Excluir ${a.full_name}?`)) return;
    try {
      await deleteFn({ data: { id: a.id } });
      toast.success("Associado excluído");
      refresh();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  if (authorized !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">Administração de Associados</h1>
        <p className="mt-2 text-muted-foreground">
          Cadastre, ative ou remova associados do Clube de Benefícios.
        </p>

        <form onSubmit={onCreate} className="mt-8 grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
          </div>
          <div>
            <Label htmlFor="cpf">CPF (somente números)</Label>
            <Input
              id="cpf"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
              required
            />
          </div>
          <div>
            <Label htmlFor="placa">Placa do veículo (senha)</Label>
            <Input
              id="placa"
              placeholder="Ex: ABC1D23"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))}
              maxLength={7}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Cadastrar associado</>}
            </Button>
          </div>
        </form>

        <div className="mt-10 rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Associados ({items.length})</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="divide-y">
            {items.length === 0 && !loading && (
              <p className="p-6 text-sm text-muted-foreground">Nenhum associado cadastrado ainda.</p>
            )}
            {items.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.card_number} · {a.email} {a.phone ? `· ${a.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {a.active ? "Ativo" : "Inativo"}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => onToggle(a)}>
                    {a.active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(a)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
