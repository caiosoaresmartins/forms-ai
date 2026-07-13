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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: 'GROQ_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const prompt = `Você é um assistente jurídico especializado em processos de Due Diligence e preenchimento de formulários/contratos.
O documento abaixo é um formulário ou contrato que precisa ser preenchido. 
Sua tarefa é analisar os campos em branco e o contexto do documento para identificar:
1. As partes envolvidas (ex: Proponente, Requerente, Seguradora, Comprador).
2. A lista exata de documentos comprobatórios ou informações que DEVEM ser solicitados de cada parte para que seja possível preencher este documento corretamente. (Ex: Se pede endereço e renda, exija Comprovante de Residência e Holerite).

Extraia os dados EXATAMENTE no seguinte formato JSON puro:
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

--- TEXTO DO DOCUMENTO ---
${pdfText.substring(0, 30000)} // Limite de segurança de caracteres
`;

    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Você é uma API estrita de extração de dados JSON. Retorne apenas JSON válido conforme requisitado, garantindo que a resposta comece e termine com chaves {}."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Groq API error:", res.status, errBody);
      throw new Error(`Erro na API do Groq: ${res.status}`);
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
