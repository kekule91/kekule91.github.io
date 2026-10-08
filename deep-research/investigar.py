"""Genera un informe de deep research con GPT Researcher usando la configuración de .env.

Uso:
    deep-research/gpt-researcher/.venv/bin/python deep-research/investigar.py "tu pregunta"
    ... --tipo deep_research     (más profundo y lento; por defecto: research_report)
"""
import argparse
import asyncio
from pathlib import Path

from dotenv import load_dotenv

AQUI = Path(__file__).parent
load_dotenv(AQUI / ".env")

from gpt_researcher import GPTResearcher  # noqa: E402  (después de cargar .env)


async def main(pregunta: str, tipo: str) -> None:
    investigador = GPTResearcher(query=pregunta, report_type=tipo)
    await investigador.conduct_research()
    informe = await investigador.write_report()

    salida = AQUI / "outputs"
    salida.mkdir(exist_ok=True)
    nombre = "".join(c if c.isalnum() else "_" for c in pregunta)[:60]
    archivo = salida / f"{nombre}.md"
    archivo.write_text(informe, encoding="utf-8")
    print(f"\nInforme guardado en {archivo}")
    print("Fuentes consultadas:", len(investigador.get_source_urls()))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("pregunta")
    p.add_argument("--tipo", default="research_report",
                   choices=["research_report", "detailed_report", "deep_research"])
    a = p.parse_args()
    asyncio.run(main(a.pregunta, a.tipo))
