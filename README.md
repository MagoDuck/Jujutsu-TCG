# Jujutsu Kaisen TCG

Jogo de cartas no navegador inspirado em Jujutsu Kaisen, no estilo Triple Triad: você e a IA se revezam colocando cartas num tabuleiro 5×5 e capturam as cartas do adversário comparando os atributos (topo, direita, baixo, esquerda). Tem progressão por níveis, deck personalizável, cartas com poderes especiais e suporte a PWA (instalável e funciona offline).

## Como jogar

Abra o [index.html](index.html) num navegador (ou instale como app pelo menu). Na tela inicial dá pra montar seu deck, ver o tutorial ou escolher um nível e batalhar contra a IA. Progresso e deck ficam salvos no `localStorage` do navegador.

## Estrutura do projeto

```
index.html          # estrutura HTML das telas (menu, deck, níveis, tutorial, jogo)
css/style.css        # estilos visuais
js/
  state.js           # referências DOM e constantes globais
  app.js             # bindings de botões, save/load do progresso, instalação PWA
  cards-data.js       # banco de cartas, sombras invocáveis e poderes
  progress.js         # progresso e desbloqueio de cartas do jogador
  screens.js          # navegação entre telas (menu, deck, níveis, tutorial)
  board.js            # tabuleiro e renderização das cartas
  powers.js           # poderes e auras das cartas especiais
  turns.js            # jogadas, capturas, pontuação e lógica da IA
  main.js             # inicialização do jogo
Img/                 # artes das cartas
icons/               # ícones do PWA
manifest.webmanifest  # metadados do PWA
sw.js                # service worker (cache offline)
```

Os arquivos JS são carregados em sequência pelo `index.html` via `<script src="...">` (sem módulos ES), então todas as funções e variáveis continuam globais e acessíveis entre os arquivos, como no script único original.
