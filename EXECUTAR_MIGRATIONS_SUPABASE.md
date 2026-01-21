# 🗄️ Executar Migrations no Supabase

## Instruções

Como há problemas de conexão local com o Supabase (firewall/VPN), vamos executar as migrations diretamente no **SQL Editor** do Supabase.

---

## 📝 Passo a Passo

### 1. Abrir SQL Editor

Você já está no SQL Editor:
- URL: https://supabase.com/dashboard/project/iebgiudqkduvvcrgftmp/sql/new

### 2. Copiar e Colar o SQL

O arquivo completo das migrations está em:
```
/tmp/supabase-full-migration.sql
```

**Ou você pode copiar diretamente daqui abaixo** ⬇️

---

## 📄 SQL Completo das Migrations

Copie TODO o conteúdo abaixo e cole no SQL Editor do Supabase, depois clique em **"Run"** (botão verde).

```sql
-- Arquivo salvo em: /tmp/supabase-full-migration.sql
```

Use o comando abaixo para abrir o arquivo:

```bash
cat /tmp/supabase-full-migration.sql
```

---

## ✅ Após Executar

Depois de rodar as migrations:

1. ✅ Verifique se as tabelas foram criadas
2. ✅ Execute o seeder de desenvolvimento
3. ✅ Teste a aplicação

---

## 🌱 Executar Seeder

Após as migrations, vamos popular o banco com dados de teste.

O seeder está em: `prisma/seed.ts`

**Como executar**:

Devido ao problema de conexão local, teremos que criar um script SQL com os dados do seed e executar no Supabase SQL Editor.

Vou preparar isso para você agora...

