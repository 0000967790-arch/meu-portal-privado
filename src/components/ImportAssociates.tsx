import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createAssociate } from "@/lib/associates.functions";
import { parseAssociatesFile, type ParsedAssociate } from "@/lib/import-associates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ImportStatus = "idle" | "parsing" | "previewing" | "importing" | "done";

type RowState = ParsedAssociate & {
  selected: boolean;
  importStatus: "pending" | "success" | "error" | "skipped";
  importError?: string;
};

interface ImportAssociatesProps {
  onImportDone: () => void;
}

export function ImportAssociates({ onImportDone }: ImportAssociatesProps) {
  const createFn = useServerFn(createAssociate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<RowState[]>([]);
  const [expanded, setExpanded] = useState(true);

  // ── drag & drop ──────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  // ── parsing ───────────────────────────────────────────────────────────────
  const processFile = async (file: File) => {
    setStatus("parsing");
    setFileName(file.name);
    try {
      const parsed = await parseAssociatesFile(file);
      if (parsed.length === 0) {
        toast.error("Nenhum dado encontrado no arquivo. Verifique o formato.");
        setStatus("idle");
        return;
      }
      const rowStates: RowState[] = parsed.map((p) => ({
        ...p,
        selected: p.errors.length === 0,
        importStatus: "pending",
      }));
      setRows(rowStates);
      setStatus("previewing");
      setExpanded(true);
      toast.success(`${parsed.length} registro(s) encontrado(s). Revise e confirme.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar arquivo.");
      setStatus("idle");
    }
  };

  // ── row controls ──────────────────────────────────────────────────────────
  const toggleRow = (idx: number) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );

  const toggleAll = () => {
    const validRows = rows.filter((r) => r.errors.length === 0);
    const allSelected = validRows.every((r) => r.selected);
    setRows((prev) =>
      prev.map((r) =>
        r.errors.length === 0 ? { ...r, selected: !allSelected } : r
      )
    );
  };

  // ── import ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    const toImport = rows.filter((r) => r.selected && r.errors.length === 0);
    if (toImport.length === 0) {
      toast.error("Selecione ao menos um registro válido.");
      return;
    }

    setStatus("importing");
    let successCount = 0;
    let errorCount = 0;

    const updatedRows = [...rows];

    for (let i = 0; i < updatedRows.length; i++) {
      const r = updatedRows[i];
      if (!r.selected || r.errors.length > 0) {
        updatedRows[i] = { ...r, importStatus: "skipped" };
        continue;
      }
      try {
        await createFn({
          data: { full_name: r.full_name, cpf: r.cpf, phone: r.phone },
        });
        updatedRows[i] = { ...r, importStatus: "success" };
        successCount++;
      } catch (err) {
        updatedRows[i] = {
          ...r,
          importStatus: "error",
          importError: err instanceof Error ? err.message : "Erro desconhecido",
        };
        errorCount++;
      }
      setRows([...updatedRows]);
    }

    setStatus("done");
    if (successCount > 0) {
      toast.success(`${successCount} associado(s) cadastrado(s) com sucesso!`);
      onImportDone();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} registro(s) com erro. Verifique a tabela.`);
    }
  };

  const reset = () => {
    setStatus("idle");
    setRows([]);
    setFileName("");
  };

  // ── helpers de contagem ───────────────────────────────────────────────────
  const validCount    = rows.filter((r) => r.errors.length === 0).length;
  const invalidCount  = rows.filter((r) => r.errors.length > 0).length;
  const selectedCount = rows.filter((r) => r.selected).length;
  const successCount  = rows.filter((r) => r.importStatus === "success").length;
  const errorCount    = rows.filter((r) => r.importStatus === "error").length;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border bg-card">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between border-b p-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Importar Associados em Lote</h2>
          {fileName && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {fileName}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Drop zone */}
          {(status === "idle" || status === "parsing") && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {status === "parsing" ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <div className="flex gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">
                    Arraste aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suporta <strong>.xlsx</strong>, <strong>.xls</strong>,{" "}
                    <strong>.csv</strong> (Excel) e <strong>.docx</strong> (Word)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Colunas esperadas:{" "}
                    <code className="rounded bg-muted px-1">Nome</code>{" "}
                    <code className="rounded bg-muted px-1">CPF</code>{" "}
                    <code className="rounded bg-muted px-1">Telefone</code>
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.docx,.doc"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Template hint */}
          {status === "idle" && (
            <p className="text-xs text-muted-foreground">
              💡 Dica: sua planilha deve ter uma linha de cabeçalho com as colunas{" "}
              <strong>Nome</strong>, <strong>CPF</strong> e{" "}
              <strong>Telefone</strong> (o nome das colunas pode variar).
            </p>
          )}

          {/* Preview table */}
          {(status === "previewing" || status === "importing" || status === "done") && (
            <>
              {/* Summary bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                    ✓ {validCount} válidos
                  </span>
                  {invalidCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                      ✗ {invalidCount} com erro
                    </span>
                  )}
                  {status === "done" && (
                    <>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                        ↑ {successCount} importados
                      </span>
                      {errorCount > 0 && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
                          ! {errorCount} erros
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {status === "previewing" && (
                    <>
                      <Button variant="outline" size="sm" onClick={toggleAll}>
                        {rows.filter((r) => r.errors.length === 0).every((r) => r.selected)
                          ? "Desmarcar todos"
                          : "Selecionar todos"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleImport}
                        disabled={selectedCount === 0}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importar {selectedCount} selecionado(s)
                      </Button>
                    </>
                  )}
                  {status === "importing" && (
                    <Button size="sm" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando…
                    </Button>
                  )}
                  {status === "done" && (
                    <Button variant="outline" size="sm" onClick={reset}>
                      <X className="mr-2 h-4 w-4" />
                      Nova importação
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium w-8">
                        <input
                          type="checkbox"
                          checked={
                            validCount > 0 &&
                            rows.filter((r) => r.errors.length === 0).every((r) => r.selected)
                          }
                          onChange={toggleAll}
                          disabled={status !== "previewing"}
                          className="cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Linha</th>
                      <th className="px-3 py-2 text-left font-medium">Nome</th>
                      <th className="px-3 py-2 text-left font-medium">CPF</th>
                      <th className="px-3 py-2 text-left font-medium">Telefone</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          r.importStatus === "success"
                            ? "bg-green-50"
                            : r.importStatus === "error"
                            ? "bg-red-50"
                            : r.errors.length > 0
                            ? "bg-yellow-50/50"
                            : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={() => toggleRow(idx)}
                            disabled={r.errors.length > 0 || status !== "previewing"}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.rowIndex}</td>
                        <td className="px-3 py-2 font-medium">{r.full_name || "—"}</td>
                        <td className="px-3 py-2 font-mono">
                          {r.cpf
                            ? r.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{r.phone || "—"}</td>
                        <td className="px-3 py-2">
                          {r.importStatus === "success" ? (
                            <span className="flex items-center gap-1 text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Importado
                            </span>
                          ) : r.importStatus === "error" ? (
                            <span
                              className="flex items-center gap-1 text-red-700"
                              title={r.importError}
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              {r.importError ?? "Erro"}
                            </span>
                          ) : r.importStatus === "skipped" ? (
                            <span className="text-muted-foreground">Ignorado</span>
                          ) : r.errors.length > 0 ? (
                            <span
                              className="flex items-center gap-1 text-yellow-700"
                              title={r.errors.join(", ")}
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              {r.errors.join("; ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Aguardando</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
