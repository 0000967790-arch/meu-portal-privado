import { useEffect, useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listCarouselImagesAdmin,
  createCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
} from "@/lib/carousel.functions";
import { uploadImageAndGetUrl } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, ImageIcon } from "lucide-react";

type CarouselImage = {
  id: string;
  image_url: string;
  alt_text: string;
  active: boolean;
  sort_order: number;
};

export function CarouselTab() {
  const fetchList = useServerFn(listCarouselImagesAdmin);
  const createFn = useServerFn(createCarouselImage);
  const updateFn = useServerFn(updateCarouselImage);
  const deleteFn = useServerFn(deleteCarouselImage);

  const [items, setItems] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchList();
      setItems(res.images as CarouselImage[]);
    } catch { toast.error("Erro ao carregar imagens"); }
    finally { setLoading(false); }
  }, [fetchList]);

  useEffect(() => { refresh(); }, [refresh]);

  const onAdd = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImageAndGetUrl("carousel-images", file);
      await createFn({
        data: {
          image_url: url,
          alt_text: alt.trim() || "Foto do carrossel Top Truck",
          active: true,
          sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
        },
      });
      toast.success("Imagem adicionada");
      setAlt("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDelete = async (img: CarouselImage) => {
    if (!confirm("Remover essa imagem do carrossel?")) return;
    try { await deleteFn({ data: { id: img.id } }); toast.success("Removida"); refresh(); }
    catch { toast.error("Erro ao remover"); }
  };

  const onToggle = async (img: CarouselImage) => {
    try { await updateFn({ data: { id: img.id, values: { active: !img.active } } }); refresh(); }
    catch { toast.error("Erro ao atualizar"); }
  };

  const onEditAlt = async (img: CarouselImage, newAlt: string) => {
    try { await updateFn({ data: { id: img.id, values: { alt_text: newAlt } } }); toast.success("Descrição atualizada"); refresh(); }
    catch { toast.error("Erro ao atualizar"); }
  };

  const onReorder = async (img: CarouselImage, delta: number) => {
    try { await updateFn({ data: { id: img.id, values: { sort_order: img.sort_order + delta } } }); refresh(); }
    catch { toast.error("Erro ao reordenar"); }
  };

  return (
    <div>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ImageIcon className="h-5 w-5" /> Adicionar imagem ao carrossel
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          As imagens ativas aparecem no carrossel da página inicial.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
          <div>
            <Label>Descrição da imagem (alt)</Label>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex: Caminhão Top Truck na estrada" maxLength={200} />
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); }} />
            <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Enviar imagem</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Imagens ({items.length})</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && !loading && (
            <p className="col-span-full p-4 text-sm text-muted-foreground">Nenhuma imagem cadastrada.</p>
          )}
          {items.map((img) => (
            <CarouselCard key={img.id} img={img}
              onDelete={() => onDelete(img)}
              onToggle={() => onToggle(img)}
              onEditAlt={(v) => onEditAlt(img, v)}
              onReorder={(d) => onReorder(img, d)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CarouselCard({
  img, onDelete, onToggle, onEditAlt, onReorder,
}: {
  img: CarouselImage;
  onDelete: () => void;
  onToggle: () => void;
  onEditAlt: (v: string) => void;
  onReorder: (delta: number) => void;
}) {
  const [alt, setAlt] = useState(img.alt_text);
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <img src={img.image_url} alt={img.alt_text} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 space-y-2">
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} onBlur={() => alt !== img.alt_text && onEditAlt(alt)} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={img.active} onCheckedChange={onToggle} />
            {img.active ? "Ativa" : "Oculta"}
          </label>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => onReorder(-1)}>↑</Button>
            <Button size="sm" variant="outline" onClick={() => onReorder(1)}>↓</Button>
            <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
