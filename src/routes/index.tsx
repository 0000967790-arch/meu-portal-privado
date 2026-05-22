import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { Shield, HeartHandshake, Wallet, Headphones, ArrowRight, CheckCircle2 } from "lucide-react";
import hero from "@/assets/hero-truck.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Top Truck — Proteção Veicular & Clube de Benefícios" },
      { name: "description", content: "Proteção veicular com atendimento humanizado e clube de benefícios exclusivo: descontos em combustível, manutenção e mais." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              Associação de Proteção Veicular
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Proteção completa para o seu veículo e sua família.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Na Top Truck, segurança, transparência e atendimento humanizado caminham juntos. E agora, com o nosso Clube de Benefícios, você economiza ainda mais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-glow)]">
                  Acessar Clube de Benefícios <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#sobre">
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  Saiba mais
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Caminhão Top Truck em estrada ao amanhecer"
              width={1600}
              height={1000}
              className="rounded-2xl shadow-[var(--shadow-elegant)] ring-1 ring-white/10"
            />
          </div>
        </div>
      </section>

      <PhotoMarquee />

      {/* Sobre */}
      <section id="sobre" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Quem somos</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A Top Truck é uma associação de proteção veicular comprometida em oferecer segurança, tranquilidade e suporte para quem valoriza seu veículo e sua família — com responsabilidade, transparência e atendimento humanizado.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "Proteção Completa", desc: "Cobertura ampla e soluções acessíveis para o dia a dia na estrada." },
            { icon: HeartHandshake, title: "Atendimento Humanizado", desc: "Pessoas reais cuidando de você quando mais importa." },
            { icon: Headphones, title: "Suporte 24h", desc: "Assistência sempre disponível para qualquer emergência." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-[var(--shadow-elegant)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clube de benefícios */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Wallet className="mr-1.5 h-3.5 w-3.5" /> Exclusivo para associados
            </span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Clube de Benefícios Top Truck</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mais vantagens, economia e praticidade. Através de parcerias exclusivas, os membros têm acesso a descontos e promoções em diversos segmentos.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Descontos em combustível",
                "Promoções em manutenção automotiva",
                "Parcerias exclusivas em diversos segmentos",
                "Acesso simples com CPF e placa do veículo",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/login">
                <Button size="lg">
                  Entrar no Clube <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-elegant)]">
            <div className="rounded-xl p-6 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <p className="text-sm opacity-80">Cartão do Associado</p>
              <p className="mt-2 font-display text-2xl font-bold">Top Truck Club</p>
              <p className="mt-8 text-xs uppercase tracking-widest opacity-70">Membro</p>
              <p className="font-mono text-lg">•••• •••• •••• 2026</p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              O acesso é restrito a associados. Use seu CPF e a placa do seu veículo cadastrada para entrar.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Top Truck — Proteção Veicular.</p>
          <p>Segurança e economia para quem vive na estrada.</p>
        </div>
      </footer>
    </div>
  );
}
