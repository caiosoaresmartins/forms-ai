import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'original' | 'supporting';
    const formId = formData.get('formId') as string;

    if (!file) {
      return NextResponse.json({ detail: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    if (type === 'original') {
      // 1. Upload do formulário original para 'forms_gerados'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('forms_gerados')
        .upload(`originais/${fileName}`, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      // 2. Criar registro na tabela 'forms'
      const { data: formDataDb, error: formError } = await supabase
        .from('forms')
        .insert([
          { 
            nome_do_cliente: 'Cliente Forms AI', 
            pdf_original_url: uploadData.path,
            status: 'pendente'
          }
        ])
        .select()
        .single();

      if (formError) throw new Error(`Erro no DB: ${formError.message}`);

      return NextResponse.json({ 
        success: true, 
        formId: formDataDb.id, 
        path: uploadData.path 
      });
      
    } else if (type === 'supporting') {
      if (!formId) {
        return NextResponse.json({ detail: 'formId é obrigatório para anexos.' }, { status: 400 });
      }

      // 1. Upload do anexo para 'uploads_clientes'
      const filePath = `${formId}/${fileName}`;
      const { data, error } = await supabase.storage
        .from('uploads_clientes')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (error) throw new Error(`Erro no upload do anexo: ${error.message}`);

      return NextResponse.json({ 
        success: true, 
        path: data.path 
      });
    }

    return NextResponse.json({ detail: 'Tipo de upload inválido.' }, { status: 400 });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
