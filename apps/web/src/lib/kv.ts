// apps/web/src/lib/kv.ts
/**
 * Biblioteca para interagir com o Vercel KV (Upstash Redis)
 * usando a API REST para máxima compatibilidade Edge.
 */

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

// Função auxiliar genérica para chamar a REST API do Upstash
async function upstash(commands: any[]) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    throw new Error('KV_REST_API_URL ou KV_REST_API_TOKEN não estão definidos.');
  }

  const res = await fetch(`${KV_REST_API_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store', // Sempre pegar os dados frescos
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upstash error ${res.status}: ${txt}`);
  }

  return res.json();
}

/**
 * Retorna o valor de uma chave (ou null se não existir)
 */
export async function kvGet(key: string): Promise<any | null> {
  try {
    const result = await upstash([['GET', key]]);
    const raw = result[0]?.result;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erro ao buscar chave ${key}:`, err);
    return null;
  }
}

/**
 * Define o valor de uma chave
 */
export async function kvSet(key: string, value: any): Promise<boolean> {
  const serialized = JSON.stringify(value);
  const result = await upstash([['SET', key, serialized]]);
  if (result[0]?.error) throw new Error(result[0].error);
  return true;
}
