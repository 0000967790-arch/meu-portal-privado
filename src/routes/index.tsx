import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { Shield, HeartHandshake, Wallet, Headphones, ArrowRight, Store, CircleDot, DoorOpen, Droplets, Sparkles, MessageCircle } from "lucide-react";
import hero from "@/assets/hero-truck.jpg";
import logo from "@/assets/logo.png";

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
        {/* Marca d'água Hero */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[480px] max-w-[50%] select-none opacity-[0.04]"
          style={{ filter: "grayscale(1) brightness(10)" }}
        />
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
              <a
                href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20realizar%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular%20da%20Top%20Truck."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebd5a] shadow-[var(--shadow-glow)] font-bold">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Realizar Cotação
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  Acessar Clube de Benefícios <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
            Bem-vindo à Top Truck Clube de Benefícios! Aqui você tem proteção, segurança e benefícios que só a Top Truck proporciona.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            A Top Truck é uma associação de proteção veicular comprometida em oferecer segurança, tranquilidade e suporte para quem valoriza seu veículo e sua família. Atuando com responsabilidade, transparência e atendimento humanizado, a empresa busca garantir proteção completa para seus associados, sempre com soluções acessíveis e eficientes.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Mais do que proteger veículos, a Top Truck trabalha para criar uma relação de confiança com cada associado, oferecendo benefícios, assistência e acompanhamento de qualidade em todos os momentos. Com uma equipe humanizada, preparada e com foco na excelência, a associação se destaca pelo compromisso em atender com agilidade e proximidade, proporcionando mais segurança no dia a dia de seus clientes.
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
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Wallet className="mr-1.5 h-3.5 w-3.5" /> Exclusivo para associados
            </span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Clube de benefícios</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              O Clube de Benefícios da Top Truck foi criado para oferecer ainda mais vantagens, economia e praticidade aos associados. Através de parcerias exclusivas, os membros têm acesso a descontos, promoções e benefícios especiais em diversos segmentos, como combustível, manutenção automotiva e muito mais.
            </p>
            <div className="mt-8">
              <Link to="/login">
                <Button size="lg">
                  Entrar no Clube <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Parceiros */}
          <div className="mt-16">
            <h3 className="text-center text-2xl font-bold md:text-3xl">Nossos parceiros</h3>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: Store, name: "Armazém Multimarcas", desc: "Descontos exclusivos em autopeças e acessórios multimarcas.", tag: "Peças" },
                { icon: CircleDot, name: "Grid Pneus", desc: "Condições especiais na compra de pneus e serviços de rodagem.", tag: "Pneus" },
                { icon: DoorOpen, name: "Fraga Autoportas", desc: "Benefícios em serviços de autoportas e reparos automotivos.", tag: "Reparos" },
                { icon: Droplets, name: "Fraga Lava Rápido", desc: "Preços reduzidos em lavagem e higienização do veículo.", tag: "Estética" },
                { icon: Sparkles, name: "GM Estética Automotiva", desc: "Vantagens em polimento, vitrificação e cuidados com a pintura.", tag: "Estética" },
              ].map(({ icon: Icon, name, desc, tag }) => (
                <div key={name} className="group relative rounded-2xl border bg-card p-6 text-center transition-all hover:shadow-[var(--shadow-elegant)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {tag}
                  </span>
                  <h4 className="mt-5 text-lg font-semibold">{name}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Cotação */}
      <section style={{ background: "var(--gradient-hero)" }} className="py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <MessageCircle className="mx-auto h-12 w-12 text-[#25D366]" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Pronto para proteger seu veículo?</h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Fale agora com nossa equipe pelo WhatsApp e receba uma cotação gratuita e personalizada para o seu veículo.
          </p>
          <a
            href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20realizar%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular%20da%20Top%20Truck."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-[var(--shadow-glow)] transition hover:bg-[#1ebd5a] active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
            Realizar Cotação Gratuita
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-4 text-sm text-white/60">(31) 99693-5587 · Atendimento via WhatsApp</p>
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
