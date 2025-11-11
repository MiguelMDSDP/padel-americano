# 🔐 Setup de Autenticação - Supabase Auth

Este guia explica como configurar a autenticação no sistema.

---

## 📋 O QUE FOI IMPLEMENTADO

- ✅ Login com email/senha (Supabase Auth)
- ✅ Sessão persistente (localStorage)
- ✅ Rota /admin protegida
- ✅ Logout funcional
- ✅ RLS: apenas autenticados editam torneios

---

## 🚀 SETUP NECESSÁRIO (3 PASSOS)

### **PASSO 1: Executar Migração is_active** ⏱️ ~30 segundos

Esta migração adiciona o campo `is_active` ao banco.

1. Acesse: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql/new

2. Abra o arquivo: `supabase-migration-add-is-active.sql`

3. **Copie TODO o conteúdo** e cole no SQL Editor

4. Clique em **"Run"** (ou Ctrl+Enter)

5. ✅ Deve ver: **"Success"**

---

### **PASSO 2: Atualizar Políticas de Segurança (RLS)** ⏱️ ~30 segundos

Esta migração protege o banco para apenas usuários autenticados editarem.

1. Acesse: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/sql/new

2. Abra o arquivo: `supabase-auth-rls-policies.sql`

3. **Copie TODO o conteúdo** e cole no SQL Editor

4. Clique em **"Run"** (ou Ctrl+Enter)

5. ✅ Deve ver: **"Success"**

**O que isso faz:**
- ✅ Qualquer um pode VER torneios (tela pública)
- 🔒 Apenas AUTENTICADOS podem criar/editar/deletar torneios

---

### **PASSO 3: Criar Conta de Admin** ⏱️ ~1 minuto

Agora você precisa criar sua conta de administrador.

**Opção A: Via Dashboard do Supabase (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/qotgijzkhkvbhtshflwk/auth/users

2. Clique em **"Add user"** (botão verde no canto superior direito)

3. Selecione **"Create new user"**

4. Preencha:
   - **Email**: Seu email pessoal (ex: `miguel@email.com`)
   - **Password**: Crie uma senha forte (mínimo 6 caracteres)
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (importante!)

5. Clique em **"Create user"**

6. ✅ Usuário criado! Você já pode fazer login

**Opção B: Via SQL (Alternativa)**

```sql
-- Execute este SQL no Supabase SQL Editor
-- Substitua os valores pelo seu email e senha

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'SEU_EMAIL@AQUI.com', -- TROQUE AQUI
  crypt('SUA_SENHA_AQUI', gen_salt('bf')), -- TROQUE AQUI
  NOW(),
  '',
  '',
  NOW(),
  NOW()
);
```

---

## ✅ TESTAR A AUTENTICAÇÃO

### **Teste Local:**

```bash
npm run dev
```

1. **Acesse:** `http://localhost:5173/login`

2. **Faça login** com o email/senha que você criou

3. **Você será redirecionado** para `/admin`

4. **Teste o logout:** Clique em "Sair" no Admin

5. **Você será redirecionado** para `/login`

6. **Tente acessar `/admin` sem login:**
   - Acesse `http://localhost:5173/admin` diretamente
   - Você deve ser redirecionado para `/login` automaticamente

---

## 🔒 COMO FUNCIONA A SEGURANÇA

### **Telas Públicas (sem login):**
- `/` - Home (visualização do torneio ativo)
- `/historico` - Lista de todos os torneios
- `/historico/:id` - Detalhes de qualquer torneio

### **Telas Protegidas (requer login):**
- `/admin` - Painel administrativo completo
  - Criar/editar jogadores
  - Configurar rodadas
  - Atualizar placares
  - Gerenciar torneios
  - Finalizar torneios

### **No Banco de Dados (RLS):**
- ✅ **SELECT** (ler): Qualquer um pode ler
- 🔒 **INSERT** (criar): Apenas autenticados
- 🔒 **UPDATE** (editar): Apenas autenticados
- 🔒 **DELETE** (deletar): Apenas autenticados

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### **Erro: "Missing Supabase environment variables"**
- Verifique se o arquivo `.env.local` existe
- Verifique se contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### **Erro: "Invalid login credentials"**
- Verifique se criou o usuário no Supabase
- Verifique se marcou "Auto Confirm User"
- Tente resetar a senha no dashboard do Supabase

### **Erro: "Row level security policy violation"**
- Execute o SQL de políticas (Passo 2)
- Verifique se está logado ao tentar editar

### **Login funciona mas não consegue editar torneios:**
- Execute o SQL de políticas RLS (Passo 2)
- Faça logout e login novamente

---

## 📱 ADICIONAR MAIS ADMINS (FUTURO)

Para adicionar mais administradores:

1. Repita o **Passo 3** com o email da nova pessoa

2. Compartilhe as credenciais com segurança

3. Cada admin terá sua própria conta

---

## 🔐 SEGURANÇA EM PRODUÇÃO

Quando fizer deploy na Vercel:

1. **NÃO** adicione senhas no código
2. Senhas ficam apenas no Supabase
3. Tokens JWT são gerenciados automaticamente
4. Sessões expiram em 1 hora (auto-refresh)
5. RLS protege o banco automaticamente

---

## 📞 RESUMO

1. ✅ Execute SQL 1: `supabase-migration-add-is-active.sql`
2. ✅ Execute SQL 2: `supabase-auth-rls-policies.sql`
3. ✅ Crie conta admin no Supabase Dashboard
4. ✅ Teste login em `http://localhost:5173/login`
5. 🎉 Pronto! Autenticação funcionando

---

**Pronto para testar!** 🚀
