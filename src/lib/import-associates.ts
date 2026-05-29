/**
 * Utilitário para leitura de planilhas Excel (.xlsx/.xls) e documentos Word (.docx)
 * e extração de dados de associados para cadastro automático.
 *
 * Campos reconhecidos (case-insensitive, com variações em pt-BR):
 *   nome / name / full_name / nome completo
 *   cpf
 *   telefone / phone / celular / tel
 */

export type ParsedAssociate = {
  full_name: string;
  cpf: string;
  phone: string;
  /** linha de origem para feedback visual */
  rowIndex: number;
  /** erros encontrados neste registro */
  errors: string[];
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]/g, "");     // remove não-alfanuméricos
}

const NAME_KEYS = ["nome", "nomecompleto", "fullname", "name", "associado"];
const CPF_KEYS  = ["cpf", "documentocpf", "numerocpf"];
const PHONE_KEYS = ["telefone", "celular", "phone", "cel", "tel", "fone"];

function matchKey(normalized: string, candidates: string[]): boolean {
  return candidates.some((c) => normalized.includes(c));
}

function cleanCpf(raw: string): string {
  return String(raw).replace(/\D/g, "");
}

function cleanPhone(raw: string): string {
  return String(raw ?? "").replace(/[^\d+() -]/g, "").trim();
}

function validateAssociate(a: ParsedAssociate): void {
  if (a.full_name.trim().length < 2) a.errors.push("Nome inválido");
  if (a.cpf.length !== 11)           a.errors.push("CPF inválido (deve ter 11 dígitos)");
}

// ─── Excel (.xlsx / .xls / .csv) ──────────────────────────────────────────────

export async function parseExcelFile(file: File): Promise<ParsedAssociate[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // header: 1 → retorna array de arrays
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (rows.length < 2) return [];

  // detecta cabeçalho na primeira linha
  const headerRow = rows[0] as string[];
  const normHeaders = headerRow.map(normalizeHeader);

  const nameIdx  = normHeaders.findIndex((h) => matchKey(h, NAME_KEYS));
  const cpfIdx   = normHeaders.findIndex((h) => matchKey(h, CPF_KEYS));
  const phoneIdx = normHeaders.findIndex((h) => matchKey(h, PHONE_KEYS));

  const results: ParsedAssociate[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    // ignora linhas completamente vazias
    if (row.every((c) => String(c ?? "").trim() === "")) continue;

    const entry: ParsedAssociate = {
      full_name : nameIdx  >= 0 ? String(row[nameIdx]  ?? "").trim() : "",
      cpf       : cpfIdx   >= 0 ? cleanCpf(String(row[cpfIdx] ?? ""))  : "",
      phone     : phoneIdx >= 0 ? cleanPhone(String(row[phoneIdx] ?? "")) : "",
      rowIndex  : i + 1,  // 1-based para exibição
      errors    : [],
    };

    // fallback: se não encontrou coluna de nome mas tem cpf, tenta ler 1ª coluna
    if (!entry.full_name && nameIdx < 0 && row[0]) {
      entry.full_name = String(row[0]).trim();
    }

    validateAssociate(entry);
    results.push(entry);
  }

  return results;
}

// ─── Word (.docx) ─────────────────────────────────────────────────────────────
// Estratégia: extrai texto plano e tenta detectar tabelas ou linhas com padrão.

export async function parseWordFile(file: File): Promise<ParsedAssociate[]> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();

  // Tenta extrair como HTML (melhor para tabelas) e como texto puro
  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    { includeDefaultStyleMap: false },
  );

  // -- Tenta via tabela HTML --
  const tableResults = extractFromHtmlTable(html);
  if (tableResults.length > 0) return tableResults;

  // -- Fallback: texto linha a linha --
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return extractFromPlainText(rawText);
}

function extractFromHtmlTable(html: string): ParsedAssociate[] {
  // Parse básico de <tr><td>… sem depender do DOM (ambiente servidor/worker)
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  const tableRows: string[][] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    const rowContent = rowMatch[1];
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }
    if (cells.length > 0) tableRows.push(cells);
  }

  if (tableRows.length < 2) return [];

  const headerRow = tableRows[0];
  const normHeaders = headerRow.map(normalizeHeader);
  const nameIdx  = normHeaders.findIndex((h) => matchKey(h, NAME_KEYS));
  const cpfIdx   = normHeaders.findIndex((h) => matchKey(h, CPF_KEYS));
  const phoneIdx = normHeaders.findIndex((h) => matchKey(h, PHONE_KEYS));

  if (nameIdx < 0 && cpfIdx < 0) return [];

  return tableRows.slice(1).map((cells, i) => {
    const entry: ParsedAssociate = {
      full_name : nameIdx  >= 0 ? (cells[nameIdx]  ?? "").trim() : "",
      cpf       : cpfIdx   >= 0 ? cleanCpf(cells[cpfIdx] ?? "")  : "",
      phone     : phoneIdx >= 0 ? cleanPhone(cells[phoneIdx] ?? "") : "",
      rowIndex  : i + 2,
      errors    : [],
    };
    validateAssociate(entry);
    return entry;
  });
}

function extractFromPlainText(text: string): ParsedAssociate[] {
  // Tenta padrão: cada linha contém "Nome: X | CPF: Y | Tel: Z" ou variações
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const results: ParsedAssociate[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // detecta se a linha contém CPF (11 dígitos, possivelmente formatado)
    const cpfMatch = line.match(/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/);
    if (!cpfMatch) continue;

    const cpf = cleanCpf(cpfMatch[1]);

    // Nome: tudo antes do CPF ou campo explícito
    let full_name = "";
    const beforeCpf = line.substring(0, line.indexOf(cpfMatch[0])).trim();
    // remove rótulos tipo "Nome:", "Associado:"
    full_name = beforeCpf.replace(/^(nome|associado|funcionario|socio)\s*[:\-]?\s*/i, "").trim();

    if (!full_name) {
      // tenta linha anterior
      full_name = lines[i - 1]?.replace(/^(nome|associado)\s*[:\-]?\s*/i, "").trim() ?? "";
    }

    // Telefone: mesmo linha ou próxima
    const phoneMatch =
      line.match(/(?:tel|fone|celular|phone)\s*[:\-]?\s*([\d()\s+\-]{7,})/i) ??
      lines[i + 1]?.match(/(?:tel|fone|celular|phone)\s*[:\-]?\s*([\d()\s+\-]{7,})/i);
    const phone = phoneMatch ? cleanPhone(phoneMatch[1]) : "";

    const entry: ParsedAssociate = {
      full_name,
      cpf,
      phone,
      rowIndex: i + 1,
      errors: [],
    };
    validateAssociate(entry);
    results.push(entry);
  }

  return results;
}

// ─── dispatcher ───────────────────────────────────────────────────────────────

export async function parseAssociatesFile(file: File): Promise<ParsedAssociate[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls", "csv"].includes(ext)) return parseExcelFile(file);
  if (["docx", "doc"].includes(ext)) return parseWordFile(file);
  throw new Error(`Formato não suportado: .${ext}. Use .xlsx, .xls, .csv ou .docx`);
}
