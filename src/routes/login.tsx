import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { checkAssociateByEmail } from "@/lib/associates.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Phone, ArrowRight } from "lucide-react";
import logo from "@/assets/toptruck-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acessar Clube — Top Truck" },
      { name: "description", content: "Acesse o Clube de Benefícios Top Truck com seu CPF e a placa do seu veículo." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  placa: z.string().regex(/^[A-Z0-9]{7}$/, "Placa deve ter 7 caracteres (letras e números)"),
});

const cpfToEmail = (cpf: string) => `${cpf}@associado.toptruck.app`;

function LoginPage() {
  const navigate = useNavigate();
  const checkAssociate = useServerFn(checkAssociateByEmail);
  const [cpf, setCpf] = useState("");
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/beneficios" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    const parsed = schema.safeParse({ cpf: cleanCpf, placa: cleanPlaca });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const email = cpfToEmail(cleanCpf);
    const password = cleanPlaca;

    // Block anyone who is not a registered associate
    try {
      const check = await checkAssociate({ data: { email } });
      if (!check.exists) {
        toast.error("CPF não cadastrado no Clube. Solicite sua cotação pelo WhatsApp.");
        setLoading(false);
        return;
      }
      if (!check.active) {
        toast.error("Sua associação está inativa. Entre em contato com a Top Truck.");
        setLoading(false);
        return;
      }
    } catch {
      toast.error("Não foi possível validar seu cadastro. Tente novamente.");
      setLoading(false);
      return;
    }

    // Try sign in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      if (signInErr.message.toLowerCase().includes("invalid")) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/beneficios` },
        });
        if (signUpErr) {
          toast.error(signUpErr.message);
          setLoading(false);
          return;
        }
        toast.success("Cadastro realizado! Bem-vindo ao Clube.");
        navigate({ to: "/beneficios" });
        setLoading(false);
        return;
      }
      toast.error(signInErr.message);
      setLoading(false);
      return;
    }

    toast.success("Login realizado!");
    navigate({ to: "/beneficios" });
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12" style={{ background: "var(--gradient-hero)" }}>
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(120vw,900px)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.07] blur-[1px] select-none"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-8 flex items-center justify-center" aria-label="Top Truck — Início">
          <img src={logo} alt="Top Truck Clube de Benefícios" className="h-16 w-auto rounded-lg bg-white/95 px-4 py-2 shadow-lg" />
        </Link>

        <div className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="text-2xl font-bold">Clube de Benefícios</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com seu CPF e a placa do seu veículo cadastrada. Se for seu primeiro acesso, sua conta será criada automaticamente.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="Somente números"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa do veículo</Label>
              <Input
                id="placa"
                placeholder="Ex: ABC1D23"
                maxLength={7}
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ainda não é associado?
            </p>
            <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Quer proteger seu veículo?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Solicite uma cotação gratuita e conheça os planos da Top Truck.
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/5531996935587?text=Ol%C3%A1%21%20Gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular%20da%20Top%20Truck."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebd5a]"
              >
                <Phone className="h-4 w-4" />
                Solicitar cotação no WhatsApp
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao entrar, você concorda com os termos de uso da Top Truck.
          </p>
        </div>

        <Link to="/" className="mt-6 text-center text-sm text-white/70 hover:text-white">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
