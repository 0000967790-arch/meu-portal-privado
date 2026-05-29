import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { Shield, HeartHandshake, Wallet, Headphones, ArrowRight, Store, CircleDot, DoorOpen, Droplets, Sparkles, MessageCircle, CheckCircle2 } from "lucide-react";
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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Marca d'água */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[480px] max-w-[50%] select-none opacity-[0.04]"
          style={{ filter: "grayscale(1) brightness(10)" }}
        />
        <div className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="text-primary-foreground">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              <Shield className="h-3.5 w-3.5 text-accent" />
              Associação de Proteção Veicular
            </span>

            {/* Título principal */}
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Proteção completa para o seu{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">veículo</span>
                <span className="absolute bottom-1 left-0 z-0 h-2 w-full rounded bg-accent/25" />
              </span>{" "}
              e sua{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">família.</span>
                <span className="absolute bottom-1 left-0 z-0 h-2 w-full rounded bg-accent/25" />
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-6 max-w-xl text-lg font-medium text-white/90 leading-relaxed">
              Na <strong className="font-bold text-white">Top Truck</strong>, segurança,{" "}
              <strong className="font-bold text-white">transparência</strong> e{" "}
              <strong className="font-bold text-white">atendimento humanizado</strong> caminham juntos.
              E agora, com o nosso{" "}
              <strong className="font-bold text-accent">Clube de Benefícios</strong>, você economiza ainda mais.
            </p>

            {/* Bullets rápidos */}
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              {["Cobertura ampla e acessível", "Suporte 24h em todo o Brasil", "Clube com descontos exclusivos"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20realizar%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular%20da%20Top%20Truck."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebd5a] shadow-[var(--shadow-glow)] font-bold text-base px-6">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Realizar Cotação Grátis
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold text-base px-6">
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

      {/* ── Sobre ────────────────────────────────────────────────────────── */}
      <section id="sobre" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Label */}
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            Quem somos
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Muito mais que uma{" "}
            <span className="text-primary">proteção veicular</span>
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Bem-vindo à <strong className="font-bold text-foreground">Top Truck Clube de Benefícios!</strong>{" "}
            Aqui você tem <strong className="font-semibold text-foreground">proteção, segurança e benefícios</strong>{" "}
            que só a Top Truck proporciona.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A Top Truck é uma <strong className="font-semibold text-foreground">associação de proteção veicular</strong>{" "}
            comprometida em oferecer <strong className="font-semibold text-foreground">segurança, tranquilidade e suporte</strong>{" "}
            para quem valoriza seu veículo e sua família. Atuando com{" "}
            <strong className="font-semibold text-foreground">responsabilidade, transparência e atendimento humanizado</strong>,
            a empresa busca garantir proteção completa para seus associados,
            sempre com soluções <strong className="font-semibold text-foreground">acessíveis e eficientes</strong>.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Mais do que proteger veículos, a Top Truck trabalha para criar uma{" "}
            <strong className="font-semibold text-foreground">relação de confiança</strong> com cada associado,
            oferecendo benefícios, assistência e acompanhamento de qualidade em todos os momentos.
            Com uma equipe <strong className="font-semibold text-foreground">humanizada, preparada e com foco na excelência</strong>,
            a associação se destaca pelo compromisso em atender com{" "}
            <strong className="font-semibold text-foreground">agilidade e proximidade</strong>.
          </p>
        </div>

        {/* Cards de diferenciais */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "Proteção Completa", desc: "Cobertura ampla e soluções acessíveis para o dia a dia na estrada.", color: "text-blue-600" },
            { icon: HeartHandshake, title: "Atendimento Humanizado", desc: "Pessoas reais cuidando de você quando mais importa.", color: "text-rose-500" },
            { icon: Headphones, title: "Suporte 24h", desc: "Assistência sempre disponível para qualquer emergência.", color: "text-green-600" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group rounded-2xl border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl shadow-md" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className={`mt-5 text-xl font-bold ${color}`}>{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clube de Benefícios ───────────────────────────────────────────── */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-bold text-accent">
              <Wallet className="h-4 w-4" /> Exclusivo para associados
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Clube de <span className="text-primary">benefícios</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              O <strong className="font-bold text-foreground">Clube de Benefícios da Top Truck</strong> foi criado para
              oferecer ainda mais <strong className="font-semibold text-foreground">vantagens, economia e praticidade</strong> aos associados.
              Através de <strong className="font-semibold text-foreground">parcerias exclusivas</strong>, os membros têm acesso a{" "}
              <strong className="font-semibold text-foreground">descontos, promoções e benefícios especiais</strong> em
              diversos segmentos, como <strong className="font-semibold text-foreground">combustível, manutenção automotiva</strong> e muito mais.
            </p>
            <div className="mt-8">
              <Link to="/login">
                <Button size="lg" className="px-8 text-base font-bold">
                  Entrar no Clube <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Parceiros */}
          <div className="mt-16">
            <h3 className="text-center text-2xl font-extrabold tracking-tight md:text-3xl">
              Nossos <span className="text-primary">parceiros</span>
            </h3>
            <p className="mt-3 text-center text-base text-muted-foreground">
              Descontos e condições especiais para você economizar no dia a dia
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: Store, name: "Armazém Multimarcas", desc: "Descontos exclusivos em autopeças e acessórios multimarcas.", tag: "Peças" },
                { icon: CircleDot, name: "Grid Pneus", desc: "Condições especiais na compra de pneus e serviços de rodagem.", tag: "Pneus" },
                { icon: DoorOpen, name: "Fraga Autoportas", desc: "Benefícios em serviços de autoportas e reparos automotivos.", tag: "Reparos" },
                { icon: Droplets, name: "Fraga Lava Rápido", desc: "Preços reduzidos em lavagem e higienização do veículo.", tag: "Estética" },
                { icon: Sparkles, name: "GM Estética Automotiva", desc: "Vantagens em polimento, vitrificação e cuidados com a pintura.", tag: "Estética" },
              ].map(({ icon: Icon, name, desc, tag }) => (
                <div key={name} className="group relative rounded-2xl border-2 border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-md" style={{ background: "var(--gradient-primary)" }}>
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {tag}
                  </span>
                  <h4 className="mt-5 text-base font-bold text-foreground">{name}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Cotação ──────────────────────────────────────────────────── */}
      <section style={{ background: "var(--gradient-hero)" }} className="relative overflow-hidden py-24">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 select-none opacity-[0.04]"
          style={{ filter: "grayscale(1) brightness(10)" }}
        />
        <div className="container relative mx-auto px-4 text-center text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Atendimento via WhatsApp
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
            Pronto para{" "}
            <span className="text-accent">proteger</span>{" "}
            seu veículo?
          </h2>
          <p className="mt-5 mx-auto max-w-xl text-lg font-medium text-white/85 leading-relaxed">
            Fale agora com nossa equipe e receba uma{" "}
            <strong className="font-bold text-white">cotação gratuita e personalizada</strong>{" "}
            para o seu veículo. Sem compromisso!
          </p>
          <a
            href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20realizar%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular%20da%20Top%20Truck."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#25D366] px-10 py-4 text-lg font-extrabold text-white shadow-[var(--shadow-glow)] transition hover:bg-[#1ebd5a] active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
            Realizar Cotação Gratuita
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="mt-5 text-sm font-medium text-white/70">
            📞 <strong className="text-white">(31) 99693-5587</strong> · Atendimento via WhatsApp
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Top Truck" className="h-8 w-auto opacity-70" />
            <p>© {new Date().getFullYear()} Top Truck — Proteção Veicular.</p>
          </div>
          <p className="font-medium">Segurança e economia para quem vive na estrada.</p>
        </div>
      </footer>
    </div>
  );
}
