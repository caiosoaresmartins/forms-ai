import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/kv';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const userKey = `user:${email.toLowerCase()}`;
    const user = await kvGet(userKey);

    if (!user) {
      return NextResponse.json({ detail: 'Credenciais inválidas.' }, { status: 401 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password !== passwordHash) {
      return NextResponse.json({ detail: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Gerando um token simples para a sessão
    const accessToken = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        email: user.email,
        name: user.full_name,
        tenant: user.tenant_name,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Erro no Login:', error);
    return NextResponse.json({ detail: 'Erro interno ao processar login.' }, { status: 500 });
  }
}
