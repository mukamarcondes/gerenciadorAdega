# Gerenciador de Adega

Sistema web para controle de estoque de adega/tabacaria com frontend estatico em `HTML + CSS + JS`, conectado diretamente ao Supabase.

## Recursos atuais

- login e cadastro com autenticacao da aplicacao
- perfis de acesso `admin`, `manager` e `attendant`
- painel de usuarios com cadastro, edicao, status e perfil
- dashboard com indicadores de estoque, vendas e lucro diario
- cadastro, edicao, exclusao e busca de produtos
- cadastro, edicao e exportacao CSV de fornecedores
- controle de estoque minimo
- movimentacoes de entrada, saida e ajuste
- vendas com carrinho, desconto e forma de pagamento
- abertura e fechamento de caixa
- relatorios com filtros por periodo e forma de pagamento
- exportacao de relatorios em Excel/CSV
- exportacao de relatorios em modo de impressao para PDF
- exportacao do banco atual para SQL compativel com Supabase/Postgres

## Como usar

Voce pode abrir o projeto em qualquer hospedagem estatica, por exemplo:

- Vercel
- GitHub Pages
- Netlify

Durante o desenvolvimento local, prefira abrir por um servidor estatico simples da sua IDE, como Live Server.

## Primeiro acesso

- e-mail: `admin@stylenarguille.com`
- senha: `123456`

Se a tabela `app_users` estiver vazia no Supabase, use a tela de cadastro para criar o primeiro usuario. O primeiro cadastro entra como `admin`.

## Estrutura

- `index.html`: interface principal
- `styles.css`: visual e responsividade
- `app.js`: frontend integrado diretamente ao Supabase
- `supabase/schema.sql`: estrutura base do banco

## Supabase

- Na tela de relatorios, use `Exportar Excel` para baixar um CSV compativel com Excel.
- Use `Exportar PDF` para abrir a versao imprimivel do relatorio e salvar em PDF pelo navegador.
- Use `Baixar SQL Supabase` para gerar um arquivo `supabase-import.sql` com estrutura e dados atuais.
- No Supabase, execute o arquivo `supabase/schema.sql` no `SQL Editor`.
- Garanta que as tabelas usadas pelo sistema estejam acessiveis para a chave publishable/anon do projeto.

## Deploy na Vercel

1. Suba o projeto para um repositorio no GitHub.
2. Importe o repositorio na Vercel.
3. Se quiser centralizar a configuracao, deixe a URL e a publishable key sincronizadas com o projeto Supabase usado no `app.js`.
4. Faca o deploy.

## Observacoes

- Os dados ficam no Supabase.
- A sessao do usuario fica salva no `localStorage` do navegador.
- Os arquivos `server.ps1`, `api/` e `data/` podem ser mantidos como historico, mas o fluxo principal agora esta no frontend conectado ao Supabase.
- Para habilitar fornecedores, rode novamente o [schema.sql](/c:/Users/Conectel/Desktop/gerenciador%20adega/supabase/schema.sql) no projeto Supabase atual.
