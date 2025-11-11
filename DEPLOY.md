# 🚀 Guia de Deploy - Padel Pulse

Este guia explica como fazer deploy do Padel Pulse na Vercel com Supabase.

## 📋 Pré-requisitos

- [x] Conta no Supabase (https://supabase.com)
- [x] Projeto Supabase criado
- [x] Tabela `tournaments` criada (SQL executado)
- [ ] Conta no GitHub
- [ ] Conta na Vercel (https://vercel.com)

---

## 🔧 Passo 1: Preparar Repositório no GitHub

### 1.1 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `padel-pulse` (ou outro nome)
3. Deixe como **Público** ou **Privado**
4. **NÃO** inicialize com README (já temos um)
5. Clique em **"Create repository"**

### 1.2 Conectar repositório local ao GitHub

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/padel-pulse.git

# Enviar código para GitHub
git push -u origin master
```

---

## ☁️ Passo 2: Deploy na Vercel

### 2.1 Importar projeto

1. Acesse https://vercel.com/new
2. Faça login com GitHub (recomendado)
3. Clique em **"Import Git Repository"**
4. Selecione o repositório `padel-pulse`
5. Clique em **"Import"**

### 2.2 Configurar variáveis de ambiente

**IMPORTANTE:** Antes de fazer deploy, adicione as variáveis de ambiente:

1. Na tela de configuração do projeto, encontre **"Environment Variables"**
2. Adicione as seguintes variáveis:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://qotgijzkhkvbhtshflwk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sua chave anon do Supabase |

3. Clique em **"Deploy"**

### 2.3 Aguardar deploy

- O deploy demora ~2 minutos
- Quando terminar, você verá uma URL: `https://seu-projeto.vercel.app`

---

## ✅ Passo 3: Testar o Deploy

### 3.1 Acessar URL

1. Clique na URL fornecida pela Vercel
2. Você deve ver a tela inicial do Padel Pulse

### 3.2 Testar funcionalidades

1. Acesse `/login` (senha padrão: "admin")
2. Vá para `/admin`
3. Crie jogadores
4. Configure rodada
5. Volte para home e veja os dados aparecerem

### 3.3 Testar sincronização

1. Abra a URL em **dois celulares diferentes** (ou computador + celular)
2. No Admin, atualize um placar
3. Na tela pública, os dados devem atualizar em até 5 segundos

---

## 🔄 Atualizações Futuras

Para fazer novas mudanças no código:

```bash
# 1. Fazer alterações no código
# 2. Commitar
git add .
git commit -m "Descrição das mudanças"

# 3. Enviar para GitHub
git push

# 4. Vercel faz deploy automático!
```

A Vercel detecta automaticamente novos commits e faz deploy automático.

---

## 🌐 Domínio Personalizado (Opcional)

Se você tiver um domínio próprio:

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções da Vercel

---

## 📱 URLs Importantes

Após deploy, você terá:

- **URL Pública**: `https://seu-projeto.vercel.app` (para jogadores)
- **Admin**: `https://seu-projeto.vercel.app/admin` (senha: "admin")
- **Login**: `https://seu-projeto.vercel.app/login`

---

## 🔒 Segurança - Próximos Passos (Opcional)

Atualmente, qualquer pessoa pode editar torneios. Para produção, considere:

1. **Autenticação real** com Supabase Auth
2. **Row Level Security (RLS)** mais restritivo
3. **Senha admin forte** ou autenticação OAuth

---

## 🆘 Solução de Problemas

### Erro: "Missing Supabase environment variables"

- Verifique se adicionou as variáveis na Vercel
- Variáveis devem começar com `VITE_`
- Refaça o deploy após adicionar variáveis

### Dados não aparecem

- Verifique se executou o SQL no Supabase
- Teste a conexão: abra DevTools (F12) e veja erros no Console

### Deploy falhou

- Verifique logs na Vercel
- Teste build localmente: `npm run build`

---

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Documentação Vite: https://vitejs.dev/guide/

---

**Pronto!** Seu sistema de torneio está online e acessível para todos! 🎾🎉
