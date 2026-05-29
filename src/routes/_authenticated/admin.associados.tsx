import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listAssociates,
  createAssociate,
  setAssociateActive,
  deleteAssociate,
  updateAssociatePlaca,
} from "@/lib/associates.functions";
import { getIsAdmin } from "@/lib/associates.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { ImportAssociates } from "@/components/ImportAssociates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2, Plus, Trash2, ShieldOff, ShieldCheck,
  KeyRound, Car, User, Phone, CreditCard, Search,
} from "lucide-react";

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
  cpf: string | null;
  placa: string | null;
};

function AdminAssociados() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);
  const fetchList = useServerFn(listAssociates);
  const createFn = useServerFn(createAssociate);
  const toggleFn = useServerFn(setAssociateActive);
  const deleteFn = useServerFn(deleteAssociate);
  const updatePlacaFn = useServerFn(updateAssociatePlaca);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [placa, setPlaca] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edição de placa inline
  const [editingPlaca, setEditingPlaca] = useState<string | null>(null); // id do associado
  const [newPlaca, setNewPlaca] = useState("");
  const [savingPlaca, setSavingPlaca] = useState(false);

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

    if (cleanCpf.length !== 11) { toast.error("CPF deve ter 11 dígitos"); return; }
    if (name.trim().length < 2) { toast.error("Informe o nome completo"); return; }
    if (cleanPlaca.length !== 7) { toast.error("Placa deve ter 7 caracteres (ex: ABC1D23)"); return; }

    setSubmitting(true);
    try {
      await createFn({ data: { full_name: name.trim(), cpf: cleanCpf, phone: phone.trim(), placa: cleanPlaca } });
      toast.success(`Associado cadastrado! Login: CPF ${cleanCpf} | Senha: ${cleanPlaca}`);
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
    if (!confirm(`Excluir ${a.full_name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteFn({ data: { id: a.id } });
      toast.success("Associado excluído");
      refresh();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const onSavePlaca = async (id: string) => {
    const clean = newPlaca.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (clean.length !== 7) { toast.error("Placa deve ter 7 caracteres"); return; }
    setSavingPlaca(true);
    try {
      await updatePlacaFn({ data: { id, placa: clean } });
      toast.success("Placa/senha atualizada!");
      setEditingPlaca(null);
      setNewPlaca("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar placa");
    } finally {
      setSavingPlaca(false);
    }
  };

  // Filtro de busca
  const filtered = items.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.full_name.toLowerCase().includes(q) ||
      (a.cpf ?? "").includes(q) ||
      a.card_number.toLowerCase().includes(q) ||
      (a.phone ?? "").includes(q)
    );
  });

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
          O associado faz login com o <strong>CPF</strong> e a senha é a <strong>placa do veículo</strong>.
        </p>

        {/* ── Importação em lote ── */}
        <div className="mt-8">
          <ImportAssociates onImportDone={refresh} />
        </div>

        {/* ── Cadastro manual ── */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Cadastrar novo associado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados. A placa será a senha de acesso do associado.
          </p>
        </div>

        <form onSubmit={onCreate} className="mt-3 rounded-2xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Nome */}
            <div className="lg:col-span-2">
              <Label htmlFor="name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Nome completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="Nome do associado"
                required
              />
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf" className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> CPF
              </Label>
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="Somente números"
                value={cpf}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Telefone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Placa */}
            <div>
              <Label htmlFor="placa" className="flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5" /> Placa do veículo{" "}
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">= SENHA</span>
              </Label>
              <Input
                id="placa"
                placeholder="Ex: ABC1D23"
                maxLength={7}
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                A placa é a senha de login do associado
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Button type="submit" disabled={submitting} className="font-semibold">
              {submitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Plus className="mr-2 h-4 w-4" /> Cadastrar associado</>
              }
            </Button>
          </div>
        </form>

        {/* ── Lista de associados ── */}
        <div className="mt-10 rounded-2xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <h2 className="text-lg font-semibold">
              Associados ({filtered.length}{filtered.length !== items.length ? ` de ${items.length}` : ""})
            </h2>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 text-sm w-52"
                  placeholder="Buscar por nome, CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="divide-y">
            {filtered.length === 0 && !loading && (
              <p className="p-6 text-sm text-muted-foreground">
                {search ? "Nenhum resultado encontrado." : "Nenhum associado cadastrado ainda."}
              </p>
            )}

            {filtered.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.full_name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      CPF: {a.cpf ? a.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {a.card_number}
                    </span>
                    {a.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {a.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      Placa:{" "}
                      {editingPlaca === a.id ? (
                        <span className="flex items-center gap-1">
                          <Input
                            className="h-5 w-24 px-1 py-0 text-xs font-mono"
                            value={newPlaca}
                            maxLength={7}
                            onChange={(e) => setNewPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs text-green-600"
                            onClick={() => onSavePlaca(a.id)}
                            disabled={savingPlaca}
                          >
                            {savingPlaca ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs text-muted-foreground"
                            onClick={() => { setEditingPlaca(null); setNewPlaca(""); }}
                          >
                            Cancelar
                          </Button>
                        </span>
                      ) : (
                        <span
                          className="cursor-pointer font-mono font-semibold text-foreground hover:text-primary"
                          title="Clique para editar a placa/senha"
                          onClick={() => { setEditingPlaca(a.id); setNewPlaca(a.placa ?? ""); }}
                        >
                          {a.placa ?? "—"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {a.active ? "Ativo" : "Inativo"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Alterar placa/senha"
                    onClick={() => { setEditingPlaca(a.id); setNewPlaca(a.placa ?? ""); }}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" title={a.active ? "Inativar" : "Ativar"} onClick={() => onToggle(a)}>
                    {a.active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" title="Excluir" onClick={() => onDelete(a)}>
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
