#!/usr/bin/env tsx

/**
 * Diagnóstico rápido de conexão Supabase
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 DIAGNÓSTICO DE CONEXÃO SUPABASE\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!databaseUrl) {
  console.log('❌ DATABASE_URL não encontrada no .env.production\n');
  process.exit(1);
}

// Parse da URL (mascarar senha)
try {
  const url = new URL(databaseUrl);
  const maskedPassword = url.password
    ? `${url.password.slice(0, 3)}***${url.password.slice(-3)}`
    : 'N/A';

  console.log('📋 INFORMAÇÕES DA CONNECTION STRING:\n');
  console.log(`  Protocolo:  ${url.protocol}`);
  console.log(`  Usuário:    ${url.username}`);
  console.log(`  Senha:      ${maskedPassword}`);
  console.log(`  Host:       ${url.hostname}`);
  console.log(`  Porta:      ${url.port}`);
  console.log(`  Database:   ${url.pathname.slice(1)}`);
  console.log(`  Parâmetros: ${url.search || 'nenhum'}`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Validações
  const warnings: string[] = [];

  if (url.port !== '6543') {
    warnings.push(
      `⚠️  ATENÇÃO: Porta ${url.port} detectada. Para Vercel/Next.js, use porta 6543 (Transaction Pooler)`
    );
  }

  if (!url.hostname.includes('pooler.supabase.com')) {
    warnings.push(
      '⚠️  ATENÇÃO: Hostname não parece ser um pooler do Supabase'
    );
  }

  if (warnings.length > 0) {
    console.log('⚠️  AVISOS:\n');
    warnings.forEach(w => console.log(`  ${w}`));
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
} catch (error) {
  console.log('❌ Erro ao fazer parse da DATABASE_URL:');
  console.log(`   ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

// Testar conexão com timeout curto
console.log('🔌 TESTANDO CONEXÃO (timeout: 10s)...\n');

const client = new Client({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000, // 10 segundos
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    const result = await client.query(
      'SELECT version(), current_database(), current_user'
    );
    const row = result.rows[0];

    console.log('📊 INFORMAÇÕES DO BANCO:\n');
    console.log(`  Versão:   ${row.version.split(' ').slice(0, 2).join(' ')}`);
    console.log(`  Database: ${row.current_database}`);
    console.log(`  Usuário:  ${row.current_user}`);
    console.log('');

    await client.end();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ DIAGNÓSTICO COMPLETO - TUDO OK!\n');
    process.exit(0);
  } catch (error: any) {
    console.log('❌ ERRO NA CONEXÃO:\n');
    console.log(`  Tipo:     ${error.code || 'UNKNOWN'}`);
    console.log(`  Mensagem: ${error.message}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 POSSÍVEIS SOLUÇÕES:\n');

    if (error.code === 'ENOTFOUND') {
      console.log('  • O hostname não foi encontrado');
      console.log('  • Verifique se o projeto Supabase está ativo');
      console.log('  • Verifique se a URL está correta\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('  • Timeout de conexão');
      console.log('  • Firewall ou VPN pode estar bloqueando');
      console.log('  • Verifique sua conexão com a internet\n');
    } else if (
      error.code === '28P01' ||
      error.message.includes('password authentication failed')
    ) {
      console.log('  • Senha incorreta');
      console.log('  • Verifique a senha no .env.production');
      console.log('  • Confirme a senha no painel do Supabase\n');
    } else if (error.code === '3D000') {
      console.log('  • Database não existe');
      console.log('  • Verifique o nome do database na URL\n');
    } else {
      console.log(`  • Erro desconhecido: ${error.code}`);
      console.log('  • Verifique os logs do Supabase');
      console.log('  • Entre em contato com o suporte\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      await client.end();
    } catch {}

    process.exit(1);
  }
}

test();
