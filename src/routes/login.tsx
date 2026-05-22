import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, Phone, ArrowRight } from "lucide-react";

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

    // Try sign in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      // If invalid credentials, attempt signup (first-time associate)
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--gradient-hero)" }}>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-primary-foreground">
          <Shield className="h-6 w-6 text-accent" />
          <span className="font-display text-xl font-bold">Top Truck</span>
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
