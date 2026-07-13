import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ detail: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Extrai texto do PDF usando pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = "";
    try {
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text.trim();
    } catch (err: any) {
      console.error("Erro no pdf-parse:", err.message);
      return NextResponse.json({ detail: 'Erro ao tentar ler as palavras do PDF. Certifique-se de que não é um arquivo escaneado (imagem).' }, { status: 400 });
    }

    if (!pdfText) {
      return NextResponse.json({ detail: 'Nenhum texto encontrado no PDF. O Perplexity não suporta PDFs de imagens/scanners.' }, { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: 'PERPLEXITY_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const prompt = `Você é um assistente jurídico especializado em Due Diligence e análise de contratos e formulários imobiliários/jurídicos.
Sua tarefa é analisar o texto extraído do documento abaixo e extrair as partes envolvidas (clientes, empresas, requerentes, etc.) e identificar a lista de documentos necessários para cada uma dessas partes.

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

Retorne SOMENTE o objeto JSON puro e válido. Não adicione nenhum outro texto, nem markdown.

--- TEXTO DO DOCUMENTO ---
${pdfText.substring(0, 30000)} // Limite de segurança de caracteres
`;

    const requestBody = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "Você é uma API estrita de extração de dados JSON. Retorne apenas JSON válido conforme requisitado, sem absolutamente nenhum texto extra."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    };

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Perplexity API error:", res.status, errBody);
      throw new Error(`Erro na API do Perplexity: ${res.status}`);
    }

    const data = await res.json();
    const responseText = data?.choices?.[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("O modelo do Perplexity não retornou texto.");
    }

    // Limpa possíveis marcações markdown da resposta
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData, { status: 200 });
    } catch {
      console.error("JSON inválido retornado pelo Perplexity:", cleanJson.substring(0, 500));
      return NextResponse.json({ detail: 'O modelo de IA não retornou um JSON válido. Tente novamente.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return NextResponse.json({ detail: error.message || 'Erro interno no processamento.' }, { status: 500 });
  }
}
