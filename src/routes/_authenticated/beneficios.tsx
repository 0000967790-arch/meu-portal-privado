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

function Beneficios() {
  const [cpf, setCpf] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? "";
      setCpf(email.split("@")[0] ?? "");
    });
  }, []);

  const maskedCpf = cpf.length === 11 ? `${cpf.slice(0, 3)}.***.***-${cpf.slice(-2)}` : cpf;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section style={{ background: "var(--gradient-hero)" }} className="text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <p className="text-sm uppercase tracking-widest text-white/70">Área do associado</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bem-vindo ao Clube de Benefícios</h1>
          <p className="mt-2 text-white/80">CPF: {maskedCpf || "—"}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold">Vantagens exclusivas</h2>
        <p className="mt-2 text-muted-foreground">
          Aproveite descontos e condições especiais em parceiros selecionados.
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
