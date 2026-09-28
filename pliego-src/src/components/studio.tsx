import { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  FileImage,
  ImageDown,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { cx } from "@/lib/cn";
import {
  countLabel,
  createPage,
  ECC_LABELS,
  ECC_NOTES,
  fileSlug,
  hostOf,
  INKS,
  INK_IDS,
  loadPages,
  MARGIN_LABELS,
  MARGINS,
  MAX_PAGES,
  normalizeUrl,
  pageTitle,
  parseBatch,
  parseImport,
  STORAGE_KEY,
  type Ecc,
  type InkId,
  type Margin,
  type PageLink,
} from "@/lib/pages";
import { androidBridge, downloadUrl, qrDataUrl, qrSvg } from "@/lib/qr";
import { Mark } from "@/components/mark";
import { QrImage } from "@/components/qr-image";

type View = "studio" | "sheet";

export function Studio() {
  const [pages, setPages] = useState<PageLink[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("studio");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftInk, setDraftInk] = useState<InkId>("tinta");
  const [draftMargin, setDraftMargin] = useState<Margin>(2);
  const [draftEcc, setDraftEcc] = useState<Ecc>("M");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadPages();
    setPages(loaded);
    setSelectedId(loaded[0]?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch {
      setStatus("No hay espacio para guardar más páginas en este navegador.");
    }
  }, [pages, ready]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 2800);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedId]);

  const selected = pages.find((page) => page.id === selectedId) ?? null;
  const name = selected ? selected.name : draftName;
  const url = selected ? selected.url : draftUrl;
  const ink = selected ? selected.ink : draftInk;
  const margin = selected ? selected.margin : draftMargin;
  const ecc = selected ? selected.ecc : draftEcc;
  const encoded = normalizeUrl(url) ?? "";
  const invalid = url.trim().length > 0 && !encoded;
  const cardTitle = name.trim() || hostOf(url) || (url.trim() ? "Sin nombre" : "Tu página");
  const colors = INKS[ink];
  const query = search.trim().toLowerCase();
  const visible = query
    ? pages.filter((page) => `${page.name} ${page.url}`.toLowerCase().includes(query))
    : pages;

  function update(id: string, patch: Partial<Omit<PageLink, "id">>) {
    setPages((prev) => prev.map((page) => (page.id === id ? { ...page, ...patch } : page)));
  }

  function setName(value: string) {
    if (selected) update(selected.id, { name: value });
    else setDraftName(value);
  }

  function setUrl(value: string) {
    if (selected) update(selected.id, { url: value });
    else setDraftUrl(value);
  }

  function setInk(value: InkId) {
    if (selected) update(selected.id, { ink: value });
    else setDraftInk(value);
  }

  function setMargin(value: Margin) {
    if (selected) update(selected.id, { margin: value });
    else setDraftMargin(value);
  }

  function setEcc(value: Ecc) {
    if (selected) update(selected.id, { ecc: value });
    else setDraftEcc(value);
  }

  function saveDraft() {
    if (!encoded) return;
    if (pages.length >= MAX_PAGES) {
      setStatus(`Puedes guardar hasta ${MAX_PAGES} páginas.`);
      return;
    }
    const page = createPage({ name: draftName, url: draftUrl, ink, margin, ecc });
    setPages((prev) => [page, ...prev]);
    setSelectedId(page.id);
    setDraftName("");
    setDraftUrl("");
    setDraftInk("tinta");
    setDraftMargin(2);
    setDraftEcc("M");
    setStatus("Página guardada en este navegador.");
  }

  function remove(id: string) {
    const idx = pages.findIndex((page) => page.id === id);
    const next = pages.filter((page) => page.id !== id);
    setPages(next);
    if (selectedId === id) {
      setSelectedId((next[idx] ?? next[idx - 1])?.id ?? null);
    }
    setStatus("Página eliminada.");
  }

  function addMany(
    rows: Array<{ name: string; url: string; ink?: InkId; margin?: Margin; ecc?: Ecc }>,
    skipped: number,
  ) {
    const room = MAX_PAGES - pages.length;
    if (room <= 0) {
      setStatus(`Puedes guardar hasta ${MAX_PAGES} páginas.`);
      return;
    }
    const seen = new Set(
      pages.map((page) => normalizeUrl(page.url)).filter((value): value is string => !!value),
    );
    const created: PageLink[] = [];
    let duplicates = 0;
    for (const row of rows) {
      const key = normalizeUrl(row.url);
      if (!key || seen.has(key)) {
        duplicates += 1;
        continue;
      }
      if (created.length >= room) break;
      seen.add(key);
      created.push(
        createPage({
          name: row.name,
          url: row.url,
          ink: row.ink,
          margin: row.margin,
          ecc: row.ecc,
        }),
      );
    }
    if (created.length === 0) {
      setStatus(duplicates ? "Esos enlaces ya están en tu biblioteca." : "No encontré enlaces válidos.");
      return;
    }
    setPages((prev) => [...created, ...prev]);
    setSelectedId(created[0]?.id ?? null);
    const notes = [countLabel(created.length, "página añadida", "páginas añadidas")];
    if (skipped) notes.push(countLabel(skipped, "línea omitida", "líneas omitidas"));
    if (duplicates) notes.push(countLabel(duplicates, "repetida", "repetidas"));
    setStatus(notes.join(" · "));
  }

  function loadExamples() {
    const samples = [
      createPage({ name: "Inicio", url: "https://ejemplo.com", ink: "tinta" }),
      createPage({ name: "Tienda", url: "https://ejemplo.com/tienda", ink: "sello" }),
      createPage({ name: "Contacto", url: "https://ejemplo.com/contacto", ink: "mar" }),
    ];
    setPages(samples);
    setSelectedId(samples[0]?.id ?? null);
    setStatus("Ejemplos listos. Cámbialos por tus enlaces.");
  }

  async function onImport(file: File) {
    try {
      const incoming = parseImport(JSON.parse(await file.text()));
      addMany(incoming, 0);
    } catch {
      setStatus("Ese archivo no es una biblioteca de Pliego.");
    }
  }

  function exportLibrary() {
    const blob = new Blob([JSON.stringify({ version: 1, pages }, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    downloadUrl(href, "pliego-paginas.json");
    URL.revokeObjectURL(href);
    setStatus("Biblioteca exportada.");
  }

  async function downloadPng() {
    if (!encoded) return;
    try {
      const href = await qrDataUrl(encoded, { fg: colors.fg, bg: colors.bg, margin, ecc }, 1024);
      downloadUrl(href, `${fileSlug(name, encoded)}.png`);
      setStatus("PNG descargado.");
    } catch {
      setStatus("No se pudo crear el PNG. Prueba con un enlace más corto.");
    }
  }

  async function downloadSvg() {
    if (!encoded) return;
    try {
      const svg = await qrSvg(encoded, { fg: colors.fg, bg: colors.bg, margin, ecc });
      const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      downloadUrl(href, `${fileSlug(name, encoded)}.svg`);
      URL.revokeObjectURL(href);
      setStatus("SVG descargado.");
    } catch {
      setStatus("No se pudo crear el SVG.");
    }
  }

  async function copyImage() {
    if (!encoded) return;
    try {
      const href = await qrDataUrl(encoded, { fg: colors.fg, bg: colors.bg, margin, ecc }, 768);
      const blob = await (await fetch(href)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setStatus("Imagen copiada.");
    } catch {
      setStatus("No se pudo copiar la imagen. Descarga el PNG.");
    }
  }

  async function copyLink() {
    if (!encoded) return;
    try {
      if (androidBridge) androidBridge.copyText(encoded);
      else await navigator.clipboard.writeText(encoded);
      setStatus("Enlace copiado.");
    } catch {
      setStatus("No se pudo copiar el enlace.");
    }
  }

  const printable = pages.filter((page) => normalizeUrl(page.url));

  return (
    <div className="min-h-screen">
      <header className="no-print mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:gap-4 lg:px-8 lg:py-5">
        <div className="flex items-center gap-3">
          <Mark className="size-11" />
          <div>
            <h1 className="display text-3xl leading-tight sm:text-4xl">Pliego</h1>
            <p className="text-sm text-muted">Códigos QR de tus páginas</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="seg" role="group" aria-label="Vista">
            <button type="button" aria-pressed={view === "studio"} onClick={() => setView("studio")}>
              Estudio
            </button>
            <button type="button" aria-pressed={view === "sheet"} onClick={() => setView("sheet")}>
              Hoja
            </button>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Exportar"
            onClick={exportLibrary}
            disabled={!pages.length}
          >
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Importar"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onImport(file);
            }}
          />
        </div>
      </header>

      {view === "studio" ? (
        <main className="no-print mx-auto grid w-full max-w-6xl gap-3 px-4 pb-16 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6 lg:px-8">
          <aside className="order-1 min-w-0 lg:sticky lg:top-6 lg:max-h-screen lg:overflow-y-auto lg:pb-8">
            <div className="mb-3 hidden items-baseline justify-between gap-3 lg:flex">
              <h2 className="text-sm font-medium tracking-wide text-muted uppercase">Tus páginas</h2>
              <p className="text-sm text-muted tabular-nums">{pages.length}</p>
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              <li className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={selectedId === null}
                  onClick={() => setSelectedId(null)}
                  className={cx(
                    "flex h-12 items-center gap-2 rounded-xl border px-3 text-sm font-medium lg:h-11 lg:w-full",
                    selectedId === null
                      ? "border-ink bg-soft text-ink"
                      : "border-line bg-surface text-ink",
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Nueva
                </button>
              </li>
              {visible.map((page) => {
                const active = page.id === selectedId;
                const pageUrl = normalizeUrl(page.url);
                return (
                  <li key={page.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(page.id)}
                      className={cx(
                        "flex h-12 max-w-56 items-center gap-3 rounded-xl border px-3 text-left lg:h-auto lg:w-full lg:max-w-none lg:py-2",
                        active ? "border-ink bg-soft" : "border-line bg-surface",
                      )}
                    >
                      <span
                        className="hidden size-12 shrink-0 overflow-hidden rounded-lg lg:block"
                        style={{ backgroundColor: INKS[page.ink].bg }}
                      >
                        {pageUrl ? (
                          <QrImage
                            text={pageUrl}
                            ink={page.ink}
                            margin={page.margin}
                            ecc={page.ecc}
                            size={128}
                            alt=""
                            className="size-12"
                          />
                        ) : (
                          <span className="grid size-12 place-items-center text-muted">·</span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{pageTitle(page)}</span>
                        <span className="hidden truncate text-sm text-muted lg:block">
                          {page.url.trim() || "Sin enlace"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden lg:block">
            {ready && pages.length === 0 ? (
              <div className="mt-4 hidden rounded-2xl border border-dashed border-line px-4 py-5 lg:block">
                <p className="font-medium">Todavía no hay páginas</p>
                <p className="mt-1 text-sm text-muted">
                  Guarda un enlace y el código queda aquí para descargarlo otra vez.
                </p>
                <button type="button" className="btn btn-secondary mt-4" onClick={loadExamples}>
                  Probar con ejemplos
                </button>
              </div>
            ) : null}
            {query && visible.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Ninguna página coincide.</p>
            ) : null}
            {pages.length > 3 ? (
              <label className="mt-4 grid gap-2 text-sm font-medium">
                Buscar
                <span className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="page-search"
                    className="field pl-10"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre o enlace"
                  />
                </span>
              </label>
            ) : null}
            <p className="mt-4 text-sm text-muted">Se guardan solo en este navegador.</p>
            </div>
          </aside>

          <section className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <form
              className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:grid-flow-dense lg:gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (!selected) saveDraft();
              }}
            >
              <div className="grid min-w-0 gap-4">
                <label className="grid gap-2 text-sm font-medium" htmlFor="page-name">
                  Nombre
                  <input
                    id="page-name"
                    className="field"
                    value={name}
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Mi portafolio"
                    autoComplete="off"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium" htmlFor="page-url">
                  Enlace
                  <input
                    id="page-url"
                    className="field"
                    value={url}
                    maxLength={2000}
                    inputMode="url"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-invalid={invalid}
                    aria-describedby="url-hint"
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://tupagina.com"
                  />
                </label>
                <p id="url-hint" className={cx("text-sm", invalid ? "text-accent" : "text-muted")}>
                  {invalid
                    ? "Usa un enlace http o un dominio, por ejemplo tupagina.com/blog."
                    : encoded && !/^[a-z][a-z0-9+.-]*:/i.test(url.trim())
                      ? `Se codificará como ${encoded}`
                      : "Con o sin https. Solo páginas web."}
                </p>
              </div>

              <div className="min-w-0 lg:row-span-2 lg:self-start lg:sticky lg:top-6">
                <article
                  className="rounded-2xl border border-line p-5 shadow-lift"
                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                >
                  <div className="relative mx-auto w-full max-w-xs">
                    <CornerMarks />
                    <div className="px-4 py-4">
                      {encoded ? (
                        <QrImage
                          text={encoded}
                          ink={ink}
                          margin={margin}
                          ecc={ecc}
                          size={640}
                          alt={`Código QR de ${cardTitle}`}
                          className="aspect-square w-full"
                        />
                      ) : (
                        <div className="grid aspect-square place-items-center px-4 text-center text-sm opacity-80">
                          {invalid
                            ? "Ese enlace no se puede convertir en QR."
                            : "Escribe un enlace para ver el código."}
                        </div>
                      )}
                    </div>
                  </div>
                  <h2 className="display mt-2 text-center text-2xl leading-tight break-words">{cardTitle}</h2>
                  <p className="mt-1 text-center text-sm break-all opacity-70">{encoded || "Sin enlace"}</p>
                </article>
              </div>

              <div className="grid min-w-0 gap-5">
                <fieldset className="grid gap-3">
                  <legend className="text-sm font-medium">Tinta del código</legend>
                  <div className="grid grid-cols-5 gap-2">
                    {INK_IDS.map((id) => {
                      const meta = INKS[id];
                      const pressed = ink === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={pressed}
                          aria-label={meta.label}
                          onClick={() => setInk(id)}
                          className={cx(
                            "grid justify-items-center gap-1 rounded-xl py-1",
                            pressed && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
                          )}
                        >
                          <span
                            className="grid size-11 place-items-center rounded-full border border-line"
                            style={{ backgroundColor: meta.bg }}
                          >
                            <span className="size-5 rounded-sm" style={{ backgroundColor: meta.fg }} />
                          </span>
                          <span className="text-xs text-muted">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {colors.note ? <p className="text-sm text-muted">{colors.note}</p> : null}
                </fieldset>

                <div className="grid gap-4">
                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">Margen</legend>
                    <div className="seg" role="group" aria-label="Margen">
                      {MARGINS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={margin === value}
                          onClick={() => setMargin(value)}
                        >
                          {MARGIN_LABELS[value]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">Resistencia</legend>
                    <div className="seg" role="group" aria-label="Resistencia del código">
                      {(Object.keys(ECC_LABELS) as Ecc[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={ecc === value}
                          onClick={() => setEcc(value)}
                        >
                          {ECC_LABELS[value]}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted">{ECC_NOTES[ecc]}</p>
                  </fieldset>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!selected ? (
                    <button type="submit" className="btn btn-primary" disabled={!ready || !encoded}>
                      Guardar en mis páginas
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={cx("btn", selected ? "btn-primary" : "btn-secondary")}
                    disabled={!encoded}
                    onClick={() => void downloadPng()}
                  >
                    <ImageDown className="size-4" aria-hidden="true" />
                    Descargar PNG
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={!encoded} onClick={() => void downloadSvg()}>
                    <FileImage className="size-4" aria-hidden="true" />
                    SVG
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={!encoded} onClick={() => void copyImage()}>
                    <Copy className="size-4" aria-hidden="true" />
                    Copiar imagen
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={!encoded} onClick={() => void copyLink()}>
                    <Copy className="size-4" aria-hidden="true" />
                    Copiar enlace
                  </button>
                  {encoded ? (
                    <a className="btn btn-secondary" href={encoded} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Abrir
                    </a>
                  ) : null}
                </div>

                {selected ? (
                  confirmDelete ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm">¿Eliminar esta página?</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          remove(selected.id);
                          setConfirmDelete(false);
                        }}
                      >
                        Eliminar
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn btn-quiet w-fit" onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Eliminar
                    </button>
                  )
                ) : ready && pages.length === 0 ? (
                  <button type="button" className="btn btn-quiet w-fit lg:hidden" onClick={loadExamples}>
                    Probar con ejemplos
                  </button>
                ) : null}

                <p className="min-h-5 text-sm text-muted" role="status" aria-live="polite">
                  {status}
                </p>
              </div>
            </form>
          </section>
          <div className="lg:col-start-1 lg:row-start-2">
            <button type="button" className="btn btn-quiet" onClick={() => setBatchOpen((open) => !open)}>
              Pegar varios enlaces
            </button>
            {batchOpen ? (
              <div className="mt-3 grid gap-3">
                <label className="grid gap-2 text-sm font-medium" htmlFor="batch-links">
                  Un enlace por línea. También vale Nombre | enlace
                  <textarea
                    id="batch-links"
                    className="field-area"
                    value={batchText}
                    onChange={(event) => setBatchText(event.target.value)}
                    placeholder={"Portafolio | tupagina.com\nhttps://tupagina.com/blog"}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const parsed = parseBatch(batchText);
                    addMany(parsed.rows, parsed.skipped);
                    if (parsed.rows.length) setBatchText("");
                  }}
                >
                  Añadir enlaces
                </button>
              </div>
            ) : null}
          </div>
        </main>
      ) : null}

      <section
        className={cx(
          "mx-auto w-full max-w-6xl px-4 pb-16 lg:px-8",
          view === "sheet" ? "" : "sheet-preload",
        )}
        aria-hidden={view !== "sheet"}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-4xl leading-tight">Hoja de códigos</h2>
            <p className="mt-1 text-muted">
              {printable.length
                ? `${countLabel(printable.length, "página lista", "páginas listas")} para imprimir o guardar.`
                : "Añade un enlace válido para armar la hoja."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary no-print"
            onClick={() => (androidBridge ? androidBridge.print() : window.print())}
            disabled={!printable.length}
          >
            <Printer className="size-4" aria-hidden="true" />
            Imprimir
          </button>
        </div>
        {printable.length ? (
          <ul className="sheet-grid grid gap-4 sm:grid-cols-2">
            {printable.map((page) => {
              const target = normalizeUrl(page.url) ?? "";
              return (
                <li
                  key={page.id}
                  className="sheet-card rounded-2xl border border-line bg-surface p-4 text-center"
                >
                  <div className="mx-auto w-40">
                    <QrImage
                      text={target}
                      ink={page.ink}
                      margin={page.margin}
                      ecc={page.ecc}
                      size={360}
                      alt={`Código QR de ${pageTitle(page)}`}
                      className="aspect-square w-full"
                    />
                  </div>
                  <h3 className="display mt-3 text-xl leading-tight break-words">{pageTitle(page)}</h3>
                  <p className="mt-1 text-sm break-all text-muted">{target}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Las páginas sin un enlace válido no entran en la hoja.</p>
        )}
      </section>
    </div>
  );
}

function CornerMarks() {
  const arm = "pointer-events-none absolute size-4 border-current opacity-40";
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className={cx(arm, "top-0 left-0 border-t-2 border-l-2")} />
      <span className={cx(arm, "top-0 right-0 border-t-2 border-r-2")} />
      <span className={cx(arm, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cx(arm, "right-0 bottom-0 border-r-2 border-b-2")} />
    </div>
  );
}
