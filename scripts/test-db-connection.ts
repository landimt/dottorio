#!/usr/bin/env tsx

/**
 * Script para testar conexão com banco de dados
 *
 * Uso:
 *   # Testar ambiente de desenvolvimento
 *   npm run db:test
 *
 *   # Testar ambiente de produção
 *   npm run db:test:prod
 *
 *   # Ou diretamente
 *   tsx scripts/test-db-connection.ts
 *   NODE_ENV=production tsx scripts/test-db-connection.ts
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Determinar qual arquivo .env carregar
const env = process.env.NODE_ENV || 'development';
const envFile =
  env === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(process.cwd(), envFile);

// Carregar variáveis de ambiente
dotenv.config({ path: envPath });

interface ConnectionTest {
  success: boolean;
  message: string;
  details?: {
    database?: string;
    user?: string;
    host?: string;
    port?: number;
    version?: string;
    currentTime?: string;
    tablesCount?: number;
  };
  error?: string;
}

async function testConnection(): Promise<ConnectionTest> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      success: false,
      message: 'DATABASE_URL não encontrada',
      error: `Verifique se o arquivo ${envFile} existe e contém DATABASE_URL`,
    };
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('🔌 Tentando conectar ao banco de dados...');
    console.log(`📁 Ambiente: ${env.toUpperCase()}`);
    console.log(`📄 Arquivo: ${envFile}`);
    console.log('');

    // Conectar ao banco
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Obter informações do banco
    const versionResult = await client.query('SELECT version()');
    const dbVersion = versionResult.rows[0].version;

    const timeResult = await client.query('SELECT NOW()');
    const currentTime = timeResult.rows[0].now;

    const userResult = await client.query('SELECT current_user, current_database()');
    const currentUser = userResult.rows[0].current_user;
    const currentDb = userResult.rows[0].current_database;

    // Contar tabelas
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tablesCount = parseInt(tablesResult.rows[0].count);

    // Parse da URL para mostrar detalhes (sem senha)
    const url = new URL(databaseUrl);

    return {
      success: true,
      message: 'Conexão bem-sucedida',
      details: {
        database: currentDb,
        user: currentUser,
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        version: dbVersion.split(' ').slice(0, 2).join(' '),
        currentTime: new Date(currentTime).toISOString(),
        tablesCount,
      },
    };
  } catch (error) {
    let errorMessage = 'Erro desconhecido';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
    } else {
      errorMessage = String(error);
    }

    return {
      success: false,
      message: 'Falha na conexão',
      error: `${errorMessage}\n\nDetalhes técnicos:\n${errorDetails}`,
    };
  } finally {
    try {
      await client.end();
    } catch {
      // Ignorar erros ao fechar conexão que não foi estabelecida
    }
  }
}

async function main() {
  console.log('┌────────────────────────────────────────────────────────────┐');
  console.log('│  🗄️  TESTE DE CONEXÃO COM BANCO DE DADOS                  │');
  console.log('└────────────────────────────────────────────────────────────┘');
  console.log('');

  const result = await testConnection();

  if (result.success && result.details) {
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│  📊 INFORMAÇÕES DO BANCO                                   │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log(`  🏢 Host:           ${result.details.host}`);
    console.log(`  🔌 Porta:          ${result.details.port}`);
    console.log(`  👤 Usuário:        ${result.details.user}`);
    console.log(`  💾 Banco:          ${result.details.database}`);
    console.log(`  📦 Versão:         ${result.details.version}`);
    console.log(`  🕐 Hora do Banco:  ${new Date(result.details.currentTime!).toLocaleString('pt-BR')}`);
    console.log(`  📋 Tabelas:        ${result.details.tablesCount} tabelas na schema 'public'`);
    console.log('');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│  ✅ CONEXÃO OK                                             │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');

    if (result.details.tablesCount === 0) {
      console.log('⚠️  ATENÇÃO: Nenhuma tabela encontrada!');
      console.log('   Execute as migrations para criar as tabelas:');
      console.log('   → npm run db:push (dev)');
      console.log('   → npm run db:migrate:deploy (prod)');
      console.log('');
    }

    process.exit(0);
  } else {
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│  ❌ ERRO NA CONEXÃO                                        │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log(`  ❌ ${result.message}`);
    if (result.error) {
      console.log(`  📝 Detalhes: ${result.error}`);
    }
    console.log('');
    console.log('💡 Dicas para resolver:');
    console.log('');

    if (env === 'development') {
      console.log('  1. Verifique se o Docker está rodando:');
      console.log('     → docker ps');
      console.log('');
      console.log('  2. Inicie os containers:');
      console.log('     → make docker-up');
      console.log('     → docker compose up -d');
      console.log('');
      console.log('  3. Verifique se o arquivo .env.development existe');
      console.log('');
    } else {
      console.log('  1. Verifique se a DATABASE_URL está correta no .env.production');
      console.log('');
      console.log('  2. Verifique se o Supabase está acessível');
      console.log('');
      console.log('  3. Confirme se a senha está correta');
      console.log('');
    }

    process.exit(1);
  }
}

main();
