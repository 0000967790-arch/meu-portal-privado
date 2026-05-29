import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyAssociate } from "@/lib/associates.functions";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Store, CircleDot, DoorOpen, Droplets, Sparkles, Loader2, Phone, MapPin, Clock, CheckCircle2, ExternalLink, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/beneficios")({
  head: () => ({
    meta: [{ title: "Clube de Benefícios — Top Truck" }],
  }),
  component: Beneficios,
});

type Partner = {
  icon: typeof Store;
  name: string;
  desc: string;
  tag: string;
  services: string[];
  address: string;
  phone: string;
  hours: string;
  benefit: string;
};

const partners: Partner[] = [
  {
    icon: Store,
    name: "Armazém Multimarcas",
    desc: "Descontos exclusivos em autopeças e acessórios multimarcas.",
    tag: "Peças",
    services: ["Autopeças nacionais e importadas", "Acessórios automotivos", "Filtros, óleos e lubrificantes", "Componentes elétricos"],
    address: "Av. Brasil, 1234 — Centro",
    phone: "(11) 99999-0001",
    hours: "Seg a Sex: 08h às 18h · Sáb: 08h às 13h",
    benefit: "10% de desconto na apresentação do cartão",
  },
  {
    icon: CircleDot,
    name: "Grid Pneus",
    desc: "Condições especiais na compra de pneus e serviços de rodagem.",
    tag: "Pneus",
    services: ["Venda de pneus novos", "Alinhamento e balanceamento", "Cambagem", "Rodízio e calibragem"],
    address: "Rua dos Pneus, 456 — Vila Industrial",
    phone: "(11) 99999-0002",
    hours: "Seg a Sex: 08h às 19h · Sáb: 08h às 14h",
    benefit: "Até 15% off em pneus + alinhamento cortesia",
  },
  {
    icon: DoorOpen,
    name: "Fraga Autoportas",
    desc: "Benefícios em serviços de autoportas e reparos automotivos.",
    tag: "Reparos",
    services: ["Reparo de fechaduras", "Travas elétricas", "Vidros elétricos", "Maçanetas e dobradiças"],
    address: "Rua Fraga, 789 — Jardim Oficina",
    phone: "(11) 99999-0003",
    hours: "Seg a Sex: 08h às 18h",
    benefit: "12% off em serviços + orçamento gratuito",
  },
  {
    icon: Droplets,
    name: "Fraga Lava Rápido",
    desc: "Preços reduzidos em lavagem e higienização do veículo.",
    tag: "Estética",
    services: ["Lavagem simples e completa", "Higienização interna", "Lavagem de motor", "Aspiração detalhada"],
    address: "Rua Fraga, 791 — Jardim Oficina",
    phone: "(11) 99999-0004",
    hours: "Seg a Sáb: 08h às 18h · Dom: 08h às 12h",
    benefit: "A cada 5 lavagens, a 6ª é cortesia",
  },
  {
    icon: Sparkles,
    name: "GM Estética Automotiva",
    desc: "Vantagens em polimento, vitrificação e cuidados com a pintura.",
    tag: "Estética",
    services: ["Polimento técnico", "Vitrificação de pintura", "Cristalização de vidros", "Hidratação de couro"],
    address: "Av. das Estéticas, 321 — Centro",
    phone: "(11) 99999-0005",
    hours: "Seg a Sex: 09h às 18h · Sáb: 09h às 14h",
    benefit: "15% off em polimentos e vitrificações",
  },
];

type Associate = {
  full_name: string;
  email: string;
  cpf: string | null;
  placa: string | null;
  card_number: string;
  active: boolean;
  created_at: string;
};

const formatCpf = (cpf: string | null) => {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "").padStart(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
};

const formatPlaca = (p: string | null) => {
  if (!p) return "—";
  const v = p.toUpperCase();
  return v.length === 7 ? `${v.slice(0, 3)}-${v.slice(3)}` : v;
};

function Beneficios() {
  const fetchMine = useServerFn(getMyAssociate);
  const [loading, setLoading] = useState(true);
  const [associate, setAssociate] = useState<Associate | null>(null);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  useEffect(() => {
    fetchMine()
      .then((res) => setAssociate(res.associate as Associate | null))
      .finally(() => setLoading(false));
  }, [fetchMine]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!associate || !associate.active) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center shadow-[var(--shadow-elegant)]">
            <h1 className="text-2xl font-bold">
              {associate ? "Associação inativa" : "Você ainda não é associado"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {associate
                ? "Entre em contato com a Top Truck para reativar seu cadastro."
                : "Solicite uma cotação no WhatsApp para ter acesso ao Clube de Benefícios."}
            </p>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%21%20Gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20da%20Top%20Truck."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebd5a]"
            >
              <Phone className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </section>
      </div>
    );
  }

  const memberSince = new Date(associate.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section style={{ background: "var(--gradient-hero)" }} className="text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <p className="text-sm uppercase tracking-widest text-white/70">Área do associado</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bem-vindo ao Clube de Benefícios</h1>
          <p className="mt-2 text-white/80">{associate.full_name}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => setCardOpen(true)}
            aria-label="Expandir cartão do associado"
            className="block w-full text-left rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">Cartão do Associado</p>
                <p className="mt-1 font-display text-2xl font-bold">Top Truck Club</p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                Ativo
              </span>
            </div>
            <p className="mt-8 font-mono text-xl tracking-widest">{associate.card_number}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs uppercase tracking-widest opacity-90">
              <div className="col-span-2">
                <p className="opacity-70">Nome</p>
                <p className="mt-1 font-semibold normal-case tracking-normal">{associate.full_name}</p>
              </div>
              <div>
                <p className="opacity-70">CPF</p>
                <p className="mt-1 font-mono font-semibold normal-case tracking-wider">{formatCpf(associate.cpf)}</p>
              </div>
              <div>
                <p className="opacity-70">Placa</p>
                <p className="mt-1 font-mono font-semibold tracking-widest">{formatPlaca(associate.placa)}</p>
              </div>
              <div className="col-span-2 mt-1 text-[10px] opacity-60">
                Toque para expandir
              </div>
            </div>
          </button>
        </div>
      </section>

      {cardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCardOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <button
            type="button"
            onClick={() => setCardOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[90vw] sm:max-w-[760px] aspect-[1.586/1] rounded-3xl p-6 sm:p-10 text-primary-foreground shadow-2xl"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70">Cartão do Associado</p>
                  <p className="mt-1 font-display text-2xl sm:text-4xl font-bold">Top Truck Club</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur">
                  Ativo
                </span>
              </div>

              <p className="font-mono text-xl sm:text-3xl md:text-4xl tracking-widest">
                {associate.card_number}
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-[10px] sm:text-xs uppercase tracking-widest opacity-90">
                <div className="col-span-3 sm:col-span-1">
                  <p className="opacity-70">Nome</p>
                  <p className="mt-1 text-sm sm:text-base font-semibold normal-case tracking-normal">
                    {associate.full_name}
                  </p>
                </div>
                <div>
                  <p className="opacity-70">CPF</p>
                  <p className="mt-1 font-mono text-sm sm:text-base font-semibold normal-case tracking-wider">
                    {formatCpf(associate.cpf)}
                  </p>
                </div>
                <div>
                  <p className="opacity-70">Placa</p>
                  <p className="mt-1 font-mono text-sm sm:text-base font-semibold tracking-widest">
                    {formatPlaca(associate.placa)}
                  </p>
                </div>
                <div className="col-span-3 sm:col-span-1 sm:text-right">
                  <p className="opacity-70">Desde</p>
                  <p className="mt-1 font-semibold">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      <section className="container mx-auto px-4 pb-14">
        <h2 className="text-2xl font-bold">Nossos parceiros</h2>
        <p className="mt-2 text-muted-foreground">
          Clique em um parceiro para ver serviços, localização e como aproveitar o benefício.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelected(p)}
                className="group text-left rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{p.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <p className="mt-4 text-xs font-medium text-primary group-hover:underline">Ver detalhes →</p>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                    <selected.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <DialogDescription>{selected.tag} · Parceiro Top Truck</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
                  <p className="font-semibold text-foreground">Benefício do associado</p>
                  <p className="mt-1 text-muted-foreground">{selected.benefit}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold">Serviços oferecidos</h4>
                  <ul className="mt-2 space-y-1.5">
                    {selected.services.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{selected.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <a href={`tel:${selected.phone.replace(/\D/g, "")}`} className="text-muted-foreground hover:text-foreground">
                      {selected.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{selected.hours}</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name} ${selected.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver no Google Maps
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
