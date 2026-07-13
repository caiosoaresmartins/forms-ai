import { NextResponse } from 'next/server';
import { kvKeys, kvGetMany } from '@/lib/kv';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ detail: 'Acesso negado.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_local_dev');
    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ detail: 'Token inválido.' }, { status: 401 });
    }

    // Apenas admins podem acessar
    if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
      return NextResponse.json({ detail: 'Privilégios insuficientes.' }, { status: 403 });
    }

    // Busca todas as chaves de usuários
    const userKeys = await kvKeys('user:*');
    const allUsers = await kvGetMany(userKeys);

    // Mapeamento para o painel de clientes
    const clients = allUsers.map(user => {
      // Simula métricas que ainda não existem no banco para manter o visual
      const quota = Math.floor(Math.random() * 60) + 10;
      const inactiveDays = Math.floor(Math.random() * 10);
      
      return {
        id: `#T-${user.id.substring(0, 4).toUpperCase()}`,
        name: user.tenant_name || user.full_name || 'Empresa Sem Nome',
        plan: 'Starter', // Como ainda não temos campo plan, default para Starter
        quota: quota,
        status: inactiveDays > 7 ? 'Pausado' : 'Ativo',
        inactiveDays: inactiveDays
      };
    });

    // Mapeamento para o painel de equipe (só SUPER_ADMIN)
    let admins: any[] = [];
    if (payload.role === 'SUPER_ADMIN') {
      admins = allUsers
        .filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')
        .map(admin => ({
          id: admin.id,
          name: admin.full_name || admin.email.split('@')[0],
          email: admin.email,
          role: admin.role,
          status: 'Ativo'
        }));
    }

    return NextResponse.json({ clients, admins });
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json({ detail: 'Erro interno do servidor.' }, { status: 500 });
  }
}
