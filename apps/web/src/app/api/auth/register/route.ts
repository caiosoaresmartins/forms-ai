import { NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, tenant_name, tenant_slug, termsAccepted } = body;

    if (!email || !password || !tenant_name || !tenant_slug || !termsAccepted) {
      return NextResponse.json({ detail: 'Preencha todos os campos obrigatórios e aceite os termos.' }, { status: 400 });
    }

    const userKey = `user:${email.toLowerCase()}`;
    const existingUser = await kvGet(userKey);

    if (existingUser) {
      return NextResponse.json({ detail: 'Já existe uma conta com este e-mail.' }, { status: 400 });
    }

    // Criando um Salt (tempero criptográfico) para blindar a senha contra Rainbow Tables
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const newUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password: passwordHash,
      salt: salt,
      full_name: full_name || '',
      tenant_name,
      tenant_slug,
      created_at: new Date().toISOString(),
      terms_accepted_at: new Date().toISOString(), // Grava a aceitação jurídica
      role: 'ADMIN' // o criador da conta da empresa vira ADMIN automaticamente
    };

    const success = await kvSet(userKey, newUser);

    if (!success) {
      throw new Error('Falha ao salvar no KV');
    }

    return NextResponse.json({ message: 'Conta criada com sucesso!' }, { status: 201 });

  } catch (error: any) {
    console.error('Erro no Registro:', error);
    return NextResponse.json({ detail: error.message || 'Erro interno ao processar cadastro.' }, { status: 500 });
  }
}
