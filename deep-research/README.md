# Deep research

Tres herramientas de código abierto para investigar un tema en muchas fuentes y obtener un informe con citas.
Están incluidas como *submódulos* de git: el código es el de cada proyecto original, sin modificar.

| Herramienta | Sirve para | Fuentes | Modelos |
|---|---|---|---|
| [GPT Researcher](https://github.com/assafelovic/gpt-researcher) | Informes con citas (web **y** papers). La más fácil de usar. | DuckDuckGo, arXiv, OpenAlex, Semantic Scholar, PubMed Central, Tavily… | Gemini, OpenAI, Ollama (local) y otros |
| [STORM](https://github.com/stanford-oval/storm) (Stanford) | Artículos largos tipo Wikipedia: pregunta desde varias perspectivas y arma un esquema antes de redactar. | DuckDuckGo, Tavily, Bing… | Gemini, OpenAI, Ollama |
| [Open Deep Research](https://github.com/langchain-ai/open_deep_research) (LangChain) | Agente configurable con interfaz visual (LangGraph Studio). | Tavily u OpenAI/Anthropic web search | OpenAI, Gemini, otros |

## Instalación

Requisitos: `git`, Python 3.11+ y [uv](https://docs.astral.sh/uv/).

```bash
git clone --recurse-submodules https://github.com/kekule91/kekule91.github.io
cd kekule91.github.io
./deep-research/instalar.sh
```

Después abrí `deep-research/.env` y completá **una** de las opciones de modelo:

- **Gemini** (recomendado para empezar, tiene capa gratuita): pegá tu clave de <https://aistudio.google.com/apikey> en `GOOGLE_API_KEY`.
- **OpenAI**: descomentá la opción B y pegá `OPENAI_API_KEY`.
- **Gratis y sin internet para el modelo**: instalá [Ollama](https://ollama.com), corré `ollama pull qwen3:14b` y `ollama pull nomic-embed-text`, y descomentá la opción C. Necesita una compu con bastante memoria (16 GB de RAM o más).

La búsqueda ya viene configurada sin claves: DuckDuckGo para la web y OpenAlex, Semantic Scholar y arXiv para papers.
El archivo `.env` no se sube a GitHub (está en `.gitignore`), así que tus claves quedan sólo en tu compu.

## Uso

**GPT Researcher** (informe en Markdown dentro de `deep-research/outputs/`):

```bash
deep-research/gpt-researcher/.venv/bin/python deep-research/investigar.py "¿Qué evidencia hay sobre el uso de simulaciones en la enseñanza de la estequiometría?"
deep-research/gpt-researcher/.venv/bin/python deep-research/investigar.py "Concepciones alternativas sobre enlace químico" --tipo deep_research
```

Para buscar **sólo en papers**, cambiá en `.env`: `RETRIEVER=openalex,semantic_scholar,arxiv`.

**STORM** (con Gemini y DuckDuckGo):

```bash
cd deep-research/storm
set -a; source ../.env; set +a
.venv/bin/python examples/storm_examples/run_storm_wiki_gemini.py --retriever duckduckgo \
  --output-dir ../outputs/storm --do-research --do-generate-outline --do-generate-article --do-polish-article
```

**Open Deep Research** (abre una interfaz web local):

```bash
cd deep-research/open_deep_research
set -a; source ../.env; set +a
.venv/bin/langgraph dev --allow-blocking
```

En la pantalla de configuración elegí los modelos (por ejemplo `google_genai:gemini-2.5-pro`) y el buscador.
Ojo: esta herramienta necesita `TAVILY_API_KEY` (gratis hasta 1000 búsquedas/mes en <https://tavily.com>) o usar el buscador propio de OpenAI.

## Actualizar las herramientas

```bash
git submodule update --remote --depth 1 deep-research
./deep-research/instalar.sh
```
