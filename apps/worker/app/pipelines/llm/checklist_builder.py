"""
Gera uma checklist de documentos por parte (comprador, vendedor, etc.)
a partir do JSON de partes extraídas, usando o Groq LLM.
"""
from __future__ import annotations

import json
from .groq_client import chat

SYSTEM_PROMPT = """
Você é um especialista em documentação imobiliária brasileira.
Dada uma lista de partes de um contrato (comprador, vendedor, testemunha, etc.),
você deve gerar uma checklist de documentos necessários para cada parte.

Regras:
- Responda SOMENTE com JSON válido, sem markdown, sem explicações.
- O JSON deve seguir exatamente este schema:
{
  "checklist": [
    {
      "party_type": "buyer",
      "party_index": 1,
      "party_name": "Nome da parte",
      "documents": [
        {
          "name": "RG ou CNH",
          "required": true,
          "notes": "Cópia autenticada"
        }
      ]
    }
  ]
}
- party_type deve ser um dos valores: buyer, seller, witness, procurator, spouse
- required é booleano
- notes é opcional (omita se não houver observação)
- Inclua no mínimo 4 documentos por parte
- Para pessoa jurídica inclua: contrato social, CNPJ, procuração se necessário
"""


def build_checklist(parties: dict) -> dict:
    """
    Recebe o dict de partes extraídas e retorna a checklist gerada pelo LLM.

    Args:
        parties: dict com a estrutura {"parties": {"buyer": [...], "seller": [...], ...}}

    Returns:
        dict com a estrutura {"checklist": [...]}
    """
    user_message = f"Gere a checklist para as seguintes partes:\n{json.dumps(parties, ensure_ascii=False, indent=2)}"

    raw = chat(system=SYSTEM_PROMPT, user=user_message)

    # Remove possíveis blocos de markdown antes de parsear
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM retornou JSON inválido: {exc}\nConteúdo: {raw[:500]}") from exc

    if "checklist" not in result:
        raise ValueError(f"JSON sem chave 'checklist': {result}")

    return result
