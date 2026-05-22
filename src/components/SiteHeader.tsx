import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";

export function SiteHeader() {
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Shield className="h-6 w-6 text-accent" />
          <span>Top Truck</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
            Início
          </Link>
          {isAuthed ? (
            <>
              <Link to="/beneficios">
                <Button variant="secondary" size="sm">Clube de Benefícios</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Acessar Clube</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
