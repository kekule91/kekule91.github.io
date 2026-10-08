#!/usr/bin/env bash
# Instala las herramientas de deep research, cada una en su propio entorno virtual.
# Uso: ./deep-research/instalar.sh   (requiere git, Python 3.11+ y uv: https://docs.astral.sh/uv/)
set -euo pipefail
cd "$(dirname "$0")"
git submodule update --init --depth 1 .

# GPT Researcher: investigación web y académica (arXiv, Semantic Scholar, OpenAlex, PubMed)
uv venv --python 3.12 gpt-researcher/.venv
VIRTUAL_ENV=gpt-researcher/.venv uv pip install -e gpt-researcher langchain-google-genai langchain-ollama duckduckgo-search ddgs arxiv

# STORM (Stanford): artículos largos tipo Wikipedia con perspectivas múltiples
uv venv --python 3.12 storm/.venv
VIRTUAL_ENV=storm/.venv uv pip install -e storm duckduckgo-search "huggingface_hub<0.26"

# Open Deep Research (LangChain): agente configurable con LangGraph
(cd open_deep_research && uv venv --python 3.12 && uv pip install -e . langchain-google-genai "langgraph-cli[inmem]")

[ -f .env ] || cp .env.example .env
echo "Listo. Completá deep-research/.env con tus claves."
