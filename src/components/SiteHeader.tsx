import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getIsAdmin } from "@/lib/associates.functions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logo from "@/assets/toptruck-logo.png";

export function SiteHeader() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);

  useEffect(() => {
    const apply = (authed: boolean) => {
      setIsAuthed(authed);
      if (authed) {
        checkAdmin().then((r) => setIsAdmin(r.isAdmin)).catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(false);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => apply(!!session));
    supabase.auth.getSession().then(({ data }) => apply(!!data.session));
    return () => subscription.unsubscribe();
  }, [checkAdmin]);

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
              {isAdmin && (
                <Link to="/admin/associados">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
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
