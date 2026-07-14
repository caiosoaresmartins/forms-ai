import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import { supabase } from '@/lib/supabase';

const groqApiKey = process.env.GROQ_API_KEY!;

export async function POST(request: Request) {
  try {
    const { formId, parties } = await request.json();

    if (!formId || !parties) {
      return NextResponse.json({ detail: 'Faltam parâmetros.' }, { status: 400 });
    }

    // 1. Buscar metadados do formulário original
    const { data: formDataDb, error: formError } = await supabase
      .from('forms')
      .select('pdf_original_url')
      .eq('id', formId)
      .single();

    if (formError || !formDataDb?.pdf_original_url) {
      throw new Error('Formulário original não encontrado no banco de dados.');
    }

    // 2. Extrair dados dos anexos
    let mergedFacts: Record<string, string> = {};
    
    // Coletar todos os paths de arquivos anexados
    const supportingPaths: string[] = [];
    for (const party of parties) {
      if (party.documents) {
        for (const doc of party.documents) {
          if (doc.status === 'uploaded' && doc.path) {
            supportingPaths.push(doc.path);
          }
        }
      }
    }

    for (const path of supportingPaths) {
      // Baixar do Supabase
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('uploads_clientes')
        .download(path);
        
      if (downloadError || !fileData) {
        console.warn(`Falha ao baixar anexo: ${path}`);
        continue;
      }

      // Extrair texto usando pdfjs-dist
      const arrayBuffer = await fileData.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      let text = "";
      try {
        const pdf = await getDocument({ data: typedArray }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } catch (err) {
        console.warn(`Erro ao ler anexo ${path}`);
      }
      
      if (!text.trim()) continue;

      // Chamada Groq para extrair fatos chave deste documento
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente de extração de dados. Extraia todos os fatos úteis (nome, cpf, rg, endereço, cnh, empresa, cnpj, placa, etc) do documento. Retorne EXATAMENTE um JSON plano de chaves e valores string. Exemplo: {"nome": "João da Silva", "cpf": "12345678900"}'
            },
            {
              role: 'user',
              content: text.substring(0, 4000) // Limite de segurança para 1 página
            }
          ]
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        try {
          const facts = JSON.parse(groqData.choices[0].message.content);
          mergedFacts = { ...mergedFacts, ...facts };
        } catch (e) {
          console.warn('Erro ao fazer parse do JSON do Groq');
        }
      }
    }

    // 3. Baixar formulário original
    const { data: originalBlob, error: origError } = await supabase.storage
      .from('forms_gerados')
      .download(formDataDb.pdf_original_url);

    if (origError || !originalBlob) {
      throw new Error('Falha ao baixar o arquivo original do storage.');
    }

    const originalArrayBuffer = await originalBlob.arrayBuffer();
    
    // 4. Preencher AcroForm
    const pdfDoc = await PDFDocument.load(originalArrayBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldNames = fields.map(f => f.getName());
    
    // Pedir para a IA mapear mergedFacts para fieldNames
    const mappingRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Você mapeia valores para campos de formulário. Retorne um JSON onde as chaves são EXATAMENTE os nomes dos campos disponíveis, e os valores são as informações correspondentes extraídas dos Fatos.\nCampos disponíveis: ${JSON.stringify(fieldNames)}\nFatos: ${JSON.stringify(mergedFacts)}`
          }
        ]
      })
    });

    if (mappingRes.ok) {
      const mappingData = await mappingRes.json();
      try {
        const mapping = JSON.parse(mappingData.choices[0].message.content);
        for (const [fieldName, value] of Object.entries(mapping)) {
          if (value && typeof value === 'string' && value.trim() !== '') {
            try {
              const field = form.getTextField(fieldName);
              if (field) {
                field.setText(value);
              }
            } catch (e) {
              // Ignore if field is not a text field or doesn't exist
            }
          }
        }
      } catch (e) {
        console.warn('Falha ao aplicar mapeamento no PDF');
      }
    }

    // 5. Salvar PDF Preenchido
    const pdfBytes = await pdfDoc.save();
    const filledFileName = `preenchidos/${formId}_filled.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('forms_gerados')
      .upload(filledFileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw new Error(`Erro ao salvar PDF preenchido: ${uploadError.message}`);

    // 6. Atualizar Banco de Dados
    await supabase
      .from('forms')
      .update({ 
        status: 'preenchido', 
        pdf_preenchido_url: uploadData.path 
      })
      .eq('id', formId);

    // 7. Retornar URL para download (Usando createSignedUrl para gerar um link temporário se o bucket for privado, ou retornar o path para o front tratar)
    const { data: urlData } = await supabase.storage
      .from('forms_gerados')
      .createSignedUrl(uploadData.path, 60 * 60); // Válido por 1 hora

    return NextResponse.json({ 
      success: true, 
      downloadUrl: urlData?.signedUrl 
    });

  } catch (error: any) {
    console.error('API Generate Error:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
