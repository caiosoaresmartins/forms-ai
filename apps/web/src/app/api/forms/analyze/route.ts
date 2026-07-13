import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ detail: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Converte o arquivo para Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Pdf = buffer.toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
Você é um assistente jurídico especializado em Due Diligence e análise de contratos e formulários imobiliários/jurídicos.
Sua tarefa é analisar o documento PDF anexado (mesmo que seja escaneado, use sua visão computacional para ler) e extrair as partes envolvidas (clientes, empresas, requerentes, etc.) e identificar a lista de documentos necessários para cada uma dessas partes.

Extraia os dados EXATAMENTE no seguinte formato JSON puro, sem marcações markdown como \`\`\`json:
{
  "parties": [
    {
      "id": "gerar_um_id_unico_ex_party_1",
      "partyName": "Nome da Parte Extraída",
      "role": "Papel da Parte (ex: Requerente, Vendedor, Empresa)",
      "documents": [
        { 
          "id": "gerar_um_id_unico_ex_doc_1", 
          "name": "Nome do Documento (ex: RG, Matrícula)", 
          "status": "pending", 
          "reason": "Explicação jurídica do porquê este documento é exigido." 
        }
      ]
    }
  ]
}

Retorne SOMENTE o objeto JSON puro e válido. Não adicione nenhum outro texto.
`;

    const pdfPart = {
      inlineData: {
        data: base64Pdf,
        mimeType: "application/pdf"
      }
    };

    let responseText = "";

    try {
      // Modelo principal: Gemini 2.5 Flash (rápido, multimodal, suporta PDF nativo)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([prompt, pdfPart]);
      responseText = result.response.text();
    } catch (e: any) {
      console.warn("Falha no gemini-2.5-flash, tentando gemini-2.0-flash...", e.message);
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await fallbackModel.generateContent([prompt, pdfPart]);
        responseText = result.response.text();
      } catch (e2: any) {
        console.error("Erro Flash 2.5:", e.message, " | Erro Flash 2.0:", e2.message);
        throw new Error(`Nenhum modelo Gemini disponível. Verifique sua GEMINI_API_KEY. (${e.message})`);
      }
    }

    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData, { status: 200 });
    } catch (e) {
      console.error("Falha ao fazer parse do JSON retornado pelo Gemini:", cleanJson);
      return NextResponse.json({ detail: 'O modelo de IA não retornou um formato JSON válido.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return NextResponse.json({ detail: error.message || 'Erro interno no processamento de IA.' }, { status: 500 });
  }
}
