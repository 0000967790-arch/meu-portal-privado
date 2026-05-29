import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyAssociate } from "@/lib/associates.functions";
import { useScreenshotProtection } from "@/hooks/use-screenshot-protection";
import { SiteHeader } from "@/components/SiteHeader";
import { Store, CircleDot, DoorOpen, Droplets, Sparkles, Loader2, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/beneficios")({
  head: () => ({
    meta: [{ title: "Clube de Benefícios — Top Truck" }],
  }),
  component: Beneficios,
});

const partners = [
  { icon: Store, name: "Armazém Multimarcas", desc: "Descontos exclusivos em autopeças e acessórios multimarcas.", tag: "Peças" },
  { icon: CircleDot, name: "Grid Pneus", desc: "Condições especiais na compra de pneus e serviços de rodagem.", tag: "Pneus" },
  { icon: DoorOpen, name: "Fraga Autoportas", desc: "Benefícios em serviços de autoportas e reparos automotivos.", tag: "Reparos" },
  { icon: Droplets, name: "Fraga Lava Rápido", desc: "Preços reduzidos em lavagem e higienização do veículo.", tag: "Estética" },
  { icon: Sparkles, name: "GM Estética Automotiva", desc: "Vantagens em polimento, vitrificação e cuidados com a pintura.", tag: "Estética" },
];

type Associate = {
  full_name: string;
  email: string;
  card_number: string;
  active: boolean;
  created_at: string;
};

function Beneficios() {
  const fetchMine = useServerFn(getMyAssociate);
  const [loading, setLoading] = useState(true);
  const [associate, setAssociate] = useState<Associate | null>(null);

  useScreenshotProtection();

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
              href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20da%20Top%20Truck."
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
          <div
            className="rounded-2xl p-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
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
            <div className="mt-6 flex items-end justify-between text-xs uppercase tracking-widest opacity-80">
              <div>
                <p className="opacity-70">Membro</p>
                <p className="mt-1 font-semibold normal-case tracking-normal">{associate.full_name}</p>
              </div>
              <div className="text-right">
                <p className="opacity-70">Desde</p>
                <p className="mt-1 font-semibold">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-14">
        <h2 className="text-2xl font-bold">Nossos parceiros</h2>
        <p className="mt-2 text-muted-foreground">
          Aproveite descontos e condições exclusivas nos parceiros do Clube de Benefícios Top Truck.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {partners.map(({ icon: Icon, name, desc, tag }) => (
            <article key={name} className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{tag}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
