# Hard Eletric — site institucional

Site estático da Hard Eletric (eletricista em Maringá e Sarandi, PR), publicado na Vercel.

## Estrutura

Todos os arquivos ficam na **raiz do repositório** — é isso que a Vercel serve.

```
home.dc.html        → /
servicos.dc.html    → /servicos
projetos.dc.html    → /projetos
sobre.dc.html       → /sobre
contato.dc.html     → /contato
404.html            → página de erro
support.js          → runtime das páginas (Claude Design)
arcos.js            → animação dos arcos
uploads/            → imagens
vendor/             → React 18.3.1 (UMD), servido pelo próprio domínio
vercel.json         → rotas, cabeçalhos e URLs limpas
robots.txt, sitemap.xml
```

As páginas são artboards `.dc.html` do Claude Design. O `vercel.json` mapeia cada
uma para uma URL limpa (`/servicos` em vez de `/servicos.dc.html`), e o acesso
direto ao `.dc.html` redireciona (308) para a URL limpa.

## Configuração na Vercel

Projeto: `hardeletric` · Domínio de produção: `hardeletric.vercel.app`

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `./` (raiz) |
| Build Command | vazio |
| Output Directory | vazio |
| Install Command | vazio |

Não há build: a Vercel publica os arquivos da raiz como estáticos.

## Rodando localmente

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/home.dc.html`. As URLs limpas (`/servicos`) só existem
na Vercel, porque vêm dos rewrites do `vercel.json`; localmente use o nome do arquivo.

## Fotos pendentes

Home, Projetos e Sobre têm slots de foto vazios (aparecem como `FOTO — ... · 16:9`).
São `<img>` sem `src` e com `display:none` dentro do slot — basta colocar a imagem em
`uploads/` e preencher o `src` (absoluto, começando com `/uploads/`) para o slot virar foto.

## Editando

- Cores, tipografia e espaçamento ficam no bloco `:root` dentro de `<helmet>` em
  cada página. A regra do projeto é não usar hexadecimal fora desse bloco.
- Links internos são absolutos (`/servicos`, `/uploads/...`). Mantenha assim: caminhos
  relativos quebram nas URLs limpas.
- O React vem de `vendor/` (cópia exata dos arquivos UMD do npm, conferida por SRI).
  Se esses arquivos sumirem, o `support.js` volta sozinho a buscar no unpkg.
- Ao trocar de domínio, atualize `canonical`/`og:url` no `<head>` das cinco páginas,
  o `sitemap.xml` e o `robots.txt`.
