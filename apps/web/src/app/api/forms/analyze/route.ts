import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ detail: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Lê o conteúdo do PDF como Buffer (necessário para o pdf-parse no Node.js)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = '';
    try {
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch (parseError: any) {
      console.error('Erro ao fazer parse do PDF:', parseError);
      return NextResponse.json({ detail: 'Erro ao extrair texto do PDF. Certifique-se que o arquivo não está corrompido ou protegido.' }, { status: 400 });
    }

    if (!pdfText.trim()) {
       return NextResponse.json({ detail: 'Nenhum texto encontrado no PDF. Pode ser um documento escaneado sem OCR.' }, { status: 400 });
    }

    // Configura o Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ detail: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const prompt = `
Você é um assistente jurídico especializado em Due Diligence e análise de contratos e formulários imobiliários/jurídicos.
Sua tarefa é analisar o texto do documento fornecido e extrair as partes envolvidas (clientes, empresas, requerentes, etc.) e identificar a lista de documentos necessários para cada uma dessas partes, com base no contexto do contrato.

Extraia os dados EXATAMENTE no seguinte formato JSON, sem marcações markdown como \`\`\`json:
{
  "parties": [
    {
      "id": "gerar_um_id_unico_ex_party_1",
      "partyName": "Nome da Parte Extratada",
      "role": "Papel da Parte (ex: Requerente, Vendedor, Empresa Parceira)",
      "documents": [
        { 
          "id": "gerar_um_id_unico_ex_doc_1", 
          "name": "Nome do Documento (ex: RG, Matrícula do Imóvel)", 
          "status": "pending", 
          "reason": "Explicação jurídica do porquê este documento é exigido pelo contrato ou pela lei." 
        }
      ]
    }
  ]
}

Se o texto do documento não mencionar partes claras, crie uma estrutura baseada no que conseguir inferir.
Retorne SOMENTE o objeto JSON puro e válido.

TEXTO DO DOCUMENTO:
${pdfText}
`;

    // Função auxiliar para tentar modelos diferentes
    const callGemini = async (modelName: string) => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        })
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} (${modelName})`);
      }
      return await res.json();
    };

    let resultData;
    try {
      resultData = await callGemini("gemini-1.5-flash");
    } catch (e) {
      console.warn("Falha no gemini-1.5-flash, tentando gemini-pro...", e);
      try {
        resultData = await callGemini("gemini-pro");
      } catch (e2: any) {
        throw new Error("Ambos os modelos falharam. Erro final: " + e2.message);
      }
    }

    const responseText = resultData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Limpar markdown caso o modelo retorne com ```json
    let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData, { status: 200 });
    } catch (e) {
      console.error("Falha ao fazer parse do JSON retornado pelo Gemini:", cleanJson);
      return NextResponse.json({ detail: 'O modelo de IA retornou um formato inválido.', raw: cleanJson }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na análise de IA:', error);
    return NextResponse.json({ detail: error.message || 'Erro interno no processamento de IA.' }, { status: 500 });
  }
}
