export const INK_IDS = ["tinta", "noche", "sello", "bosque", "mar"] as const;
export type InkId = (typeof INK_IDS)[number];

export const MARGINS = [1, 2, 3, 4] as const;
export type Margin = (typeof MARGINS)[number];

export const ECCS = ["L", "M", "Q", "H"] as const;
export type Ecc = (typeof ECCS)[number];

export type PageLink = {
  id: string;
  name: string;
  url: string;
  ink: InkId;
  margin: Margin;
  ecc: Ecc;
};

export const MAX_PAGES = 100;
export const STORAGE_KEY = "pliego.pages.v1";

export const INKS: Record<InkId, { label: string; fg: string; bg: string; note?: string }> = {
  tinta: { label: "Tinta", fg: "#1c1915", bg: "#ffffff" },
  noche: {
    label: "Noche",
    fg: "#f3efe6",
    bg: "#1c1915",
    note: "Invertido. Algunos lectores antiguos no lo abren.",
  },
  sello: { label: "Sello", fg: "#9a1f18", bg: "#ffffff" },
  bosque: { label: "Bosque", fg: "#1e4d3a", bg: "#f4f7f2" },
  mar: { label: "Mar", fg: "#123f52", bg: "#f3f7f8" },
};

export const MARGIN_LABELS: Record<Margin, string> = {
  1: "Estrecho",
  2: "Normal",
  3: "Amplio",
  4: "Holgado",
};

export const ECC_LABELS: Record<Ecc, string> = {
  L: "Baja",
  M: "Media",
  Q: "Alta",
  H: "Máxima",
};

export const ECC_NOTES: Record<Ecc, string> = {
  L: "Más compacto. Útil si el enlace es muy largo.",
  M: "Equilibrado para casi cualquier página.",
  Q: "Aguanta un poco de desgaste al imprimir.",
  H: "El más robusto si el código va a ser pequeño.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isInk(value: unknown): value is InkId {
  return typeof value === "string" && (INK_IDS as readonly string[]).includes(value);
}

function isMargin(value: unknown): value is Margin {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function isEcc(value: unknown): value is Ecc {
  return value === "L" || value === "M" || value === "Q" || value === "H";
}

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const withProto = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProto);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname.includes(".")) return null;
  if (url.username || url.password) return null;
  return url.href;
}

export function hostOf(input: string): string {
  const normalized = normalizeUrl(input);
  if (!normalized) return "";
  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function pageTitle(page: Pick<PageLink, "name" | "url">): string {
  return page.name.trim() || hostOf(page.url) || "Sin nombre";
}

export function fileSlug(name: string, url: string): string {
  const base = (name.trim() || hostOf(url) || "pagina")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "pagina";
}

export function createPage(input: {
  name: string;
  url: string;
  ink?: InkId;
  margin?: Margin;
  ecc?: Ecc;
  id?: string;
}): PageLink {
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.slice(0, 80),
    url: input.url.slice(0, 2000),
    ink: input.ink ?? "tinta",
    margin: input.margin ?? 2,
    ecc: input.ecc ?? "M",
  };
}

export function sanitizePage(raw: unknown, requireUrl: boolean): PageLink | null {
  if (!isRecord(raw)) return null;
  const url = typeof raw.url === "string" ? raw.url.slice(0, 2000) : "";
  const name = typeof raw.name === "string" ? raw.name.slice(0, 80) : "";
  if (requireUrl && !normalizeUrl(url)) return null;
  if (!requireUrl && !name && !url) return null;
  const id =
    typeof raw.id === "string" && raw.id.length > 0 && raw.id.length < 80
      ? raw.id
      : crypto.randomUUID();
  return {
    id,
    name,
    url,
    ink: isInk(raw.ink) ? raw.ink : "tinta",
    margin: isMargin(raw.margin) ? raw.margin : 2,
    ecc: isEcc(raw.ecc) ? raw.ecc : "M",
  };
}

function takePages(items: unknown[], requireUrl: boolean): PageLink[] {
  const pages: PageLink[] = [];
  const ids = new Set<string>();
  for (const item of items) {
    const page = sanitizePage(item, requireUrl);
    if (!page) continue;
    if (ids.has(page.id)) page.id = crypto.randomUUID();
    ids.add(page.id);
    pages.push(page);
    if (pages.length >= MAX_PAGES) break;
  }
  return pages;
}

export function parseStored(data: unknown): PageLink[] {
  return Array.isArray(data) ? takePages(data, false) : [];
}

export function parseImport(data: unknown): PageLink[] {
  if (Array.isArray(data)) return takePages(data, true);
  if (isRecord(data) && Array.isArray(data.pages)) return takePages(data.pages, true);
  return [];
}

export function loadPages(): PageLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return parseStored(JSON.parse(raw));
  } catch {
    return [];
  }
}

export type BatchRow = { name: string; url: string };

export function parseBatch(text: string): { rows: BatchRow[]; skipped: number } {
  const rows: BatchRow[] = [];
  let skipped = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    let name = "";
    let urlPart = line;
    const sep = line.includes("|") ? "|" : line.includes("\t") ? "\t" : null;
    if (sep) {
      const pieces = line.split(sep);
      const right = pieces.slice(1).join(sep).trim();
      if (right) {
        name = pieces[0]?.trim() ?? "";
        urlPart = right;
      }
    }
    if (!normalizeUrl(urlPart)) {
      skipped += 1;
      continue;
    }
    if (!name) name = hostOf(urlPart);
    rows.push({ name: name.slice(0, 80), url: urlPart.trim().slice(0, 2000) });
  }
  return { rows, skipped };
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
