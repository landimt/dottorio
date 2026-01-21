#!/usr/bin/env tsx

/**
 * Script para verificar variáveis de ambiente antes do deploy
 *
 * Uso:
 *   npm run check:env
 *   ou
 *   tsx scripts/check-env.ts
 */

const requiredEnvVars = {
  production: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_APP_URL',
    'OPENAI_API_KEY',
  ],
  development: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_APP_URL',
  ],
};

interface EnvCheck {
  name: string;
  exists: boolean;
  value?: string;
  masked: string;
  valid: boolean;
  issue?: string;
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return '***';
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function validateEnvVar(name: string, value: string | undefined): EnvCheck {
  const check: EnvCheck = {
    name,
    exists: !!value,
    value,
    masked: value ? maskValue(value) : 'NOT SET',
    valid: true,
  };

  if (!value) {
    check.valid = false;
    check.issue = 'Variable not set';
    return check;
  }

  // Validações específicas
  switch (name) {
    case 'DATABASE_URL':
      if (!value.startsWith('postgresql://')) {
        check.valid = false;
        check.issue = 'Should start with postgresql://';
      }
      break;

    case 'NEXTAUTH_SECRET':
      if (value.length < 32) {
        check.valid = false;
        check.issue = 'Should be at least 32 characters';
      }
      break;

    case 'NEXTAUTH_URL':
    case 'NEXT_PUBLIC_APP_URL':
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        check.valid = false;
        check.issue = 'Should be a valid URL (http:// or https://)';
      }
      break;

    case 'OPENAI_API_KEY':
      if (!value.startsWith('sk-')) {
        check.valid = false;
        check.issue = 'Should start with sk-';
      }
      break;
  }

  return check;
}

function main() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  console.log('🔍 Verificando variáveis de ambiente...\n');
  console.log(`📦 Ambiente: ${env.toUpperCase()}\n`);

  const varsToCheck = isProduction
    ? requiredEnvVars.production
    : requiredEnvVars.development;

  const checks: EnvCheck[] = varsToCheck.map(name =>
    validateEnvVar(name, process.env[name])
  );

  // Tabela de resultados
  console.log('┌─────────────────────────┬──────────┬────────────────────────┬────────────────────────┐');
  console.log('│ Variável                │ Status   │ Valor                  │ Observação             │');
  console.log('├─────────────────────────┼──────────┼────────────────────────┼────────────────────────┤');

  let hasErrors = false;

  checks.forEach(check => {
    const status = check.valid ? '✅' : '❌';
    const statusText = check.valid ? 'OK' : 'ERRO';
    const issue = check.issue || '-';

    if (!check.valid) {
      hasErrors = true;
    }

    console.log(
      `│ ${check.name.padEnd(23)} │ ${status} ${statusText.padEnd(5)} │ ${check.masked.padEnd(22)} │ ${issue.padEnd(22)} │`
    );
  });

  console.log('└─────────────────────────┴──────────┴────────────────────────┴────────────────────────┘\n');

  // Resumo
  const validCount = checks.filter(c => c.valid).length;
  const totalCount = checks.length;

  console.log(`📊 Resumo: ${validCount}/${totalCount} variáveis válidas\n`);

  if (hasErrors) {
    console.error('❌ Existem problemas com as variáveis de ambiente!');
    console.error('   Corrija os erros acima antes de fazer deploy.\n');
    process.exit(1);
  }

  console.log('✅ Todas as variáveis de ambiente estão configuradas corretamente!\n');

  if (isProduction) {
    console.log('🚀 Pronto para deploy em produção!\n');
  } else {
    console.log('🔧 Ambiente de desenvolvimento configurado!\n');
  }

  process.exit(0);
}

main();
