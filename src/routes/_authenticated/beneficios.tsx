import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Store, CircleDot, DoorOpen, Droplets, Sparkles } from "lucide-react";

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

// Gera um número de cartão determinístico (16 dígitos) a partir do user id
function generateCardNumber(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let digits = "";
  let x = hash || 1;
  while (digits.length < 16) {
    x = (x * 1103515245 + 12345) >>> 0;
    digits += (x % 10).toString();
  }
  return digits.match(/.{1,4}/g)!.join(" ");
}

function Beneficios() {
  const [email, setEmail] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("•••• •••• •••• ••••");
  const [memberName, setMemberName] = useState<string>("Associado");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      setEmail(user.email ?? "");
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const name =
        (meta.full_name as string) ||
        (meta.name as string) ||
        (user.email ? user.email.split("@")[0] : "Associado");
      setMemberName(name);
      setCardNumber(generateCardNumber(user.id));
    });
  }, []);

  const memberSince = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section style={{ background: "var(--gradient-hero)" }} className="text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <p className="text-sm uppercase tracking-widest text-white/70">Área do associado</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bem-vindo ao Clube de Benefícios</h1>
          <p className="mt-2 text-white/80">{email}</p>
        </div>
      </section>

      {/* Cartão do Associado */}
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
            <p className="mt-8 font-mono text-xl tracking-widest">{cardNumber}</p>
            <div className="mt-6 flex items-end justify-between text-xs uppercase tracking-widest opacity-80">
              <div>
                <p className="opacity-70">Membro</p>
                <p className="mt-1 font-semibold normal-case tracking-normal">{memberName}</p>
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
