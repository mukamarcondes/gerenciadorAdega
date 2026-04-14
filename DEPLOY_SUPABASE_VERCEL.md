# Publicacao Com Supabase E Vercel

Este projeto agora funciona como frontend estatico em `HTML + CSS + JS`, conectado direto ao Supabase.

## O Que Voce Vai Precisar

- conta no GitHub
- conta na Vercel
- conta no Supabase

## Passo 1. Criar O Projeto No Supabase

1. Entre no painel do Supabase.
2. Clique em `New project`.
3. Escolha nome, senha e regiao.
4. Espere o ambiente terminar de criar.

Depois disso, copie em `Project Settings > API`:

- `Project URL`
- `Publishable key`

## Passo 2. Criar As Tabelas

1. No Supabase, abra `SQL Editor`.
2. Execute o arquivo [schema.sql](/c:/Users/Conectel/Desktop/gerenciador%20adega/supabase/schema.sql).

Isso cria:

- `app_users`
- `products`
- `suppliers`
- `cash_sessions`
- `sales`
- `sale_items`
- `stock_movements`

## Passo 3. Ajustar O Frontend

No arquivo [app.js](/c:/Users/Conectel/Desktop/gerenciador%20adega/app.js), confirme:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Eles precisam apontar para o mesmo projeto Supabase.

## Passo 4. Subir Para O GitHub

1. Crie ou atualize o repositorio.
2. Envie os arquivos do projeto.
3. Confirme que `.env.local`, `.vercel` e `node_modules` nao foram enviados.

## Passo 5. Publicar Na Vercel

1. Entre na Vercel.
2. Clique em `Add New > Project`.
3. Importe o repositorio.
4. Faça o deploy.

Como o projeto e estatico, nao precisa configurar API serverless para o fluxo principal.

## Passo 6. Validar

Depois do deploy, teste:

- login
- produtos
- fornecedores
- vendas
- caixa
- relatorios

## Observacoes

- Se aparecer `invalid api key`, a URL e a chave publica estao de projetos diferentes.
- Se algo salvar no sistema mas nao refletir no banco, confira RLS/policies no Supabase.
- Se adicionar novas colunas no banco, pode ser necessario rodar `notify pgrst, 'reload schema';`.
