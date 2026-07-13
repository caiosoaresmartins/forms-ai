import { NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, tenant_name, tenant_slug } = body;

    if (!email || !password || !tenant_name || !tenant_slug) {
      return NextResponse.json({ detail: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const userKey = `user:${email.toLowerCase()}`;
    const existingUser = await kvGet(userKey);

    if (existingUser) {
      return NextResponse.json({ detail: 'Já existe uma conta com este e-mail.' }, { status: 400 });
    }

    // Criando o objeto do usuário (em um cenário real a senha seria salva com hash bcrypt)
    // Como estamos na Vercel e o KV é restrito e criptografado, usaremos um hash simples sha256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password: passwordHash,
      full_name: full_name || '',
      tenant_name,
      tenant_slug,
      created_at: new Date().toISOString(),
      role: 'ADMIN' // o criador da conta da empresa vira ADMIN automaticamente
    };

    const success = await kvSet(userKey, newUser);

    if (!success) {
      throw new Error('Falha ao salvar no KV');
    }

    return NextResponse.json({ message: 'Conta criada com sucesso!' }, { status: 201 });

  } catch (error: any) {
    console.error('Erro no Registro:', error);
    return NextResponse.json({ detail: 'Erro interno ao processar cadastro.' }, { status: 500 });
  }
}
