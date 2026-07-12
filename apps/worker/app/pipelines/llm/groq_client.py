"""
Cliente Groq centralizado.
Usa a variável de ambiente GROQ_API_KEY.
"""
from __future__ import annotations

import os
from groq import Groq

_client: Groq | None = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY não configurada")
        _client = Groq(api_key=api_key)
    return _client


def chat(system: str, user: str, model: str = "llama3-8b-8192", temperature: float = 0.2) -> str:
    """
    Envia uma mensagem ao Groq e devolve o conteúdo da resposta.
    """
    client = get_groq_client()
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return response.choices[0].message.content
