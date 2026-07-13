import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ detail: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Converte o arquivo para Base64 para envio direto ao Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Pdf = buffer.toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const prompt = `Você é um assistente jurídico especializado em Due Diligence e análise de contratos e formulários imobiliários/jurídicos.
Sua tarefa é analisar o documento PDF anexado (mesmo que seja escaneado, use sua visão computacional para ler) e extrair as partes envolvidas (clientes, empresas, requerentes, etc.) e identificar a lista de documentos necessários para cada uma dessas partes.

Extraia os dados EXATAMENTE no seguinte formato JSON puro, sem marcações markdown:
{
  "parties": [
    {
      "id": "party_1",
      "partyName": "Nome da Parte Extraída",
      "role": "Papel da Parte (ex: Requerente, Vendedor, Empresa)",
      "documents": [
        { 
          "id": "doc_1", 
          "name": "Nome do Documento (ex: RG, Matrícula)", 
          "status": "pending", 
          "reason": "Explicação jurídica do porquê este documento é exigido." 
        }
      ]
    }
  ]
}

Retorne SOMENTE o objeto JSON puro e válido. Não adicione nenhum outro texto, nem markdown.`;

    // Modelos confirmados como disponíveis para esta API Key (testados via REST)
    const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

    const requestBody = {
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "application/pdf", data: base64Pdf } }
        ]
      }]
    };

    let responseText = "";
    let lastError = "";

    for (const modelName of MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          const errBody = await res.text();
          lastError = `${modelName}: ${res.status} - ${errBody.substring(0, 200)}`;
          console.warn(`Modelo ${modelName} falhou: ${res.status}`);
          continue; // tenta o próximo modelo
        }

        const data = await res.json();
        responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (responseText) {
          console.log(`Modelo ${modelName} respondeu com sucesso.`);
          break; // sucesso, sai do loop
        }
      } catch (e: any) {
        lastError = `${modelName}: ${e.message}`;
        console.warn(`Exceção no modelo ${modelName}:`, e.message);
        continue;
      }
    }

    if (!responseText) {
      throw new Error(`Nenhum modelo conseguiu processar o PDF. Último erro: ${lastError}`);
    }

    // Limpa possíveis marcações markdown da resposta
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData, { status: 200 });
    } catch {
      console.error("JSON inválido retornado pelo Gemini:", cleanJson.substring(0, 500));
      return NextResponse.json({ detail: 'O modelo de IA não retornou um JSON válido. Tente novamente.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return NextResponse.json({ detail: error.message || 'Erro interno no processamento.' }, { status: 500 });
  }
}
