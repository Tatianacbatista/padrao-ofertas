# padrao-ofertas
MVP do gerador de nome padrão de oferta (HTML + CSS + JS, sem dependências).

Fórmula: `[Ação]-[Origem].[Segmento].[Vigência].[Detalhe].[Abrangência]-[Id]-[Observação]`

## Rodar localmente
Abra `index.html` no navegador.

## Publicar no GitHub Pages
git add . && git commit -m "MVP padrao-ofertas" && git branch -M main
git remote add origin https://github.com/<usuario>/padrao-ofertas.git && git push -u origin main
No GitHub: Settings > Pages > Branch main, pasta /(root).

## Atualizar códigos
Edite `dados.js` com os códigos da planilha oficial.

## Limite do MVP
O Id sequencial fica no navegador (localStorage); não é compartilhado entre usuários.
Para Id único global é preciso um back-end ou planilha/ERP central.
