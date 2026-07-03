import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/associates.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssociatesTab } from "@/components/admin/AssociatesTab";
import { PartnersTab } from "@/components/admin/PartnersTab";
import { CarouselTab } from "@/components/admin/CarouselTab";
import { toast } from "sonner";
import { Loader2, Users, Store, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Top Truck" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdmin().then((res) => {
      if (!res.isAdmin) {
        toast.error("Acesso restrito ao administrador.");
        navigate({ to: "/beneficios" });
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    });
  }, [checkAdmin, navigate]);

  if (authorized !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie associados, parceiros e o carrossel de fotos do site.
        </p>

        <Tabs defaultValue="associados" className="mt-8">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="associados"><Users className="mr-2 h-4 w-4" /> Associados</TabsTrigger>
            <TabsTrigger value="parceiros"><Store className="mr-2 h-4 w-4" /> Parceiros</TabsTrigger>
            <TabsTrigger value="carrossel"><ImageIcon className="mr-2 h-4 w-4" /> Carrossel</TabsTrigger>
          </TabsList>

          <TabsContent value="associados" className="mt-6"><AssociatesTab /></TabsContent>
          <TabsContent value="parceiros" className="mt-6"><PartnersTab /></TabsContent>
          <TabsContent value="carrossel" className="mt-6"><CarouselTab /></TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
