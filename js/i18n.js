const LANG_STORAGE_KEY = "tcg-arena-lang";

const TRANSLATIONS = {
    pt: {
        appTitle: 'Jujutsu TCG',
        appSubtitle: 'Arena de Batalha de Cartas',
        metaDescription: 'Arena de batalha de cartas contra a IA com progressão por níveis, deck e suporte PWA.',

        playBtn: 'Jogar',
        deckBtn: 'Deck',
        tutorialBtn: 'Tutorial',
        settingsMenuBtn: 'Configurações',
        installBtn: 'Instalar app',
        backBtn: 'Voltar',

        deckInfo: (count, total, max) => `Deck: ${count} cartas (${total}/${max} nível)`,
        maxLevelInfo: (cur, total) => `Nível máximo: ${cur}/${total}`,
        deckLevelStatus: (total, max) => `Nível do Deck: ${total}/${max}`,

        selectLevelTitle: 'Selecionar Nível',
        editDeckTitle: 'Editar Deck',
        inDeckLabel: '📋 No Deck',
        availableLabel: '📦 Disponíveis',
        lockedLabel: '🔒 Bloqueadas',
        emptyInDeck: 'Nenhuma carta no deck',
        emptyAvailable: 'Todas as cartas disponíveis estão no deck',
        emptyLocked: 'Nenhuma carta bloqueada',
        removeBtn: 'Remover',
        addBtn: 'Adicionar',
        lockTag: (level) => `Nível ${level}`,
        levelCompleted: 'Concluído',
        levelLocked: 'Bloqueado',
        levelTag: (level) => `Nível ${level}`,

        tutorialTitle: 'Tutorial',
        tutorialStep1Title: '🎯 Objetivo',
        tutorialStep1P1: 'Cada partida é disputada num tabuleiro. Você e o oponente se revezam colocando cartas nas casas vazias, tentando capturar as cartas um do outro. Quem terminar a partida controlando mais cartas no tabuleiro vence.',
        tutorialStep2Title: '🃏 Os dois tipos de carta',
        tutorialCharLabel: 'Feiticeiro<br><span>4 atributos (topo, direita, baixo, esquerda) + nível no canto inferior</span>',
        tutorialDomainLabel: 'Expansão de Domínio<br><span>Refino no canto superior + nível no canto inferior</span>',
        tutorialStep2P1: 'Cartas de Feiticeiro são a maioria do seu deck e são elas que capturam e são capturadas. Expansões de Domínio em vez de atributos, têm um número de <strong>Refino</strong> e afetam o tabuleiro inteiro quando jogadas.',
        tutorialStep3Title: '🗺️ O tabuleiro',
        tutorialStep3P1: 'O tabuleiro tem 5×5 casas (25 no total). A casa bem no meio, destacada em dourado, é reservada exclusivamente para Expansões de Domínio, nenhuma carta de Feiticeiro pode ser jogada nela, e nenhuma Expansão de Domínio pode ser jogada em outro lugar.',
        tutorialStep3P2: 'Só pode existir uma Expansão de Domínio em campo por vez. Para jogar outra por cima de uma que já está lá, o <strong>Refino</strong> da nova precisa ser igual ou maior, isso destrói a anterior (que não pode mais ser usada naquela partida) e o efeito da nova passa a valer.',
        tutorialStep4Title: '▶️ Como jogar sua vez',
        tutorialStep4P1: 'Na sua vez, toque numa carta da sua mão para selecioná-la e depois toque numa casa vazia válida do tabuleiro para jogá-la ali. Os jogadores se revezam turno a turno até o fim da partida.',
        tutorialStep4P2: 'Se você ficar sem cartas na mão antes do oponente, ele continua jogando sozinho até a mão dele também esvaziar — você não perde a vez, simplesmente não tem mais nada pra jogar.',
        tutorialStep5Title: '⚔️ Como capturar',
        tutorialStep5P1: 'Toda carta de feiticeiro tem 4 números: um em cima, um embaixo, um à esquerda e um à direita. Ao colocar sua carta ao lado de uma carta inimiga, o número do seu lado voltado para ela é comparado com o número do lado dela voltado para você.',
        tutorialStep5P2: 'Se o seu número for maior, você captura aquela carta, ela passa a ser sua, mesmo continuando na mesma casa do tabuleiro. Uma única jogada pode capturar várias cartas inimigas ao mesmo tempo, se houver mais de uma adjacente.',
        tutorialStep6Title: '💥 Cartas destruídas',
        tutorialStep6P1: 'Alguns efeitos reduzem os atributos de uma carta (como poderes que cortam valores pela metade ou diminuem um atributo). Se os 4 números de uma carta chegarem a zero ao mesmo tempo, ela é <strong>destruída</strong> (sai do tabuleiro imediatamente e não pode ser usada de novo naquela partida, nem por você nem pelo oponente).',
        tutorialStep7Title: '✨ Cartas especiais',
        tutorialStep7P1: 'Muitas cartas de personagem têm poderes únicos que ativam automaticamente (ou pedem uma escolha) assim que entram em campo. Para conhecer o poder de cada carta, toque duas vezes (ou dê um duplo clique) nela para abrir os detalhes.',
        tutorialStep8Title: '🏆 Fim de partida',
        tutorialStep8P1: 'A partida termina quando nenhum dos dois jogadores conseguir realizar jogadas, mesmo com casa vazia sobrando.',
        tutorialStep8P2: 'Quando a partida acaba, vence quem tiver mais cartas suas no tabuleiro naquele momento. Empate é possível.',
        tutorialStep9Title: '🧩 Montando seu deck',
        tutorialStep9P1: 'Na tela de Deck você escolhe quais cartas desbloqueadas vão para o seu baralho. Cada carta tem um nível, e a soma dos níveis do seu deck não pode passar do limite mostrado na tela.',
        tutorialStep9P2: 'Seu deck precisa ter pelo menos 1 carta de personagem para você poder entrar numa partida — um deck só com Expansões de Domínio não é suficiente, já que elas sozinhas não enchem o tabuleiro.',

        youLabel: 'Você',
        opponentLabel: 'Oponente',
        opponentCardsTitle: 'Cartas do Oponente',
        opponentThinking: 'Oponente pensando…',
        yourCardsTitle: 'Suas Cartas',
        yourTurn: 'Sua vez',
        opponentTurn: 'Vez do Oponente',

        gameMenuTitle: 'Menu',
        restartBtn: '↻ Reiniciar',
        mainMenuBtn: 'Menu Principal',
        backToLevelsBtn: 'Voltar aos Níveis',

        powerLabel: 'Poder: ',
        cardFallbackName: 'Carta',
        powerFallbackDesc: 'Poder especial desta carta.',
        viewTenShadowsBtn: '🌑 Ver as Dez Sombras',

        shadowModalDefaultTitle: '🌑 Técnica das Dez Sombras',
        shadowSelectHint: 'Escolha uma sombra para invocar',
        shadowBrowseHint: 'As 10 sombras que pode invocar',
        shadowWarnMahoraga: '⚠ Destrói quem a invocou',
        bodySwapTitle: '🔁 Troca de Corpos',
        bodySwapHint: 'Sacrifique Kenjaku para trazer uma carta destruída de volta, ou cancele',
        bodySwapCancel: '❌ Não sacrificar Kenjaku',

        toastDeckLevelExceeded: (max, cur) => `Nível do deck excederia ${max}! (Atual: ${cur})`,
        toastCardAdded: (name) => `✅ ${name} adicionada ao deck!`,
        toastCardRemoved: (name) => `🗑️ ${name} removida do deck.`,
        toastAddOneCard: 'Adicione ao menos 1 carta ao deck.',
        toastAddCharacterCard: 'Adicione ao menos 1 carta de personagem ao deck (domínios não contam).',

        toastDomainCenterOnly: 'Expansões de Domínio só podem ser jogadas na casa central!',
        toastCenterExclusive: 'A casa central é exclusiva para Expansões de Domínio!',
        toastDomainOverridden: (oldName, newName) => `💥 ${oldName} foi sobreposto(a) e destruído(a) por ${newName}!`,
        domainAlreadyDestroyed: 'Este domínio já foi destruído nesta partida e não pode ser usado novamente.',
        domainInsufficientRefino: (name, refino) => `Refino insuficiente! ${name} (Refino ${refino}) só pode ser sobreposto por um domínio de Refino ${refino} ou maior.`,

        toastCardsCaptured: (count) => `⚡ ${count} cartas capturadas!`,
        toastCardCaptured: '⚡ Carta capturada!',
        toastCardDestroyed: (name) => `💥 ${name} teve todos os atributos zerados e foi destruída!`,

        toastBoogieSelect: '🔄 Escolha uma carta para trocar (ou toque em Todo novamente para cancelar)',
        toastCordaNegraSelect: '⛓️ Escolha uma carta para anular o poder (ou toque em Miguel novamente para cancelar)',

        levelUnlocked: (level) => `🔓 Nível ${level} desbloqueado!`,
        newCardUnlocked: (name) => `Nova carta desbloqueada: ${name}!`,
        allLevelsMastered: '🎉 Você dominou todos os níveis!',
        levelWon: (level) => `🏆 Nível ${level} vencido!`,
        youLost: '💀 Você Perdeu. Tente novamente!',
        draw: '⚖️ Empate!',

        installedStandalone: 'App em modo instalado.',
        installAvailable: 'Instalação disponível neste navegador.',
        installStarted: 'Instalação iniciada.',
        installCancelled: 'Instalação cancelada.',
        installSuccess: 'App instalado com sucesso.',
        updatingNewVersion: '🔄 Atualizando para a nova versão...',

        settingsTitle: 'Configurações',
        settingsLanguage: 'Idioma',
        settingsLangPt: 'Português',
        settingsLangEn: 'English',
        settingsSound: 'Som',
        settingsMusicLabel: 'Música de fundo',
        settingsVolume: 'Volume',
        settingsMuted: 'Mudo',
        settingsMusicHint: '',

        powerNames: {
            jackpot: 'Jackpot',
            boogie_woogie: 'Boogie Woogie',
            copiar: 'Cópia',
            dez_sombras: 'Técnica das Dez Sombras',
            desmantelar: 'Desmantelar',
            infinito: 'Infinito',
            erupcao_vulcanica: 'Erupção Vulcânica',
            transfiguracao_de_alma: 'Transfiguração de Alma',
            vazio_infinito: 'Vazio Infinito',
            santuario_malevolente: 'Santuário Malevolente',
            auto_personificacao: 'Auto-Personificação da Perfeição',
            mar_brilhante: 'Mar Brilhante de Galhos Crescentes',
            troca_de_corpos: 'Troca de Corpos',
            determinacao: 'Determinação',
            adaptacao: 'Adaptação',
            corda_negra: 'Corda Negra',
            besta_mitica_ambar: 'Besta Mítica Âmbar'
        },
        powerDescriptions: {
            jackpot: 'Enquanto estiver na mão, todos os atributos desta carta permanecem ocultos (?). Ao ser colocada em campo, seus atributos são sorteados e ficam fixos até o fim da partida. A chance de vir valores altos é de 90% se for a primeira carta jogada no tabuleiro, caindo 10% a cada carta já em campo. (Esse poder ocorre antes da comparação de pontos)',
            boogie_woogie: 'Ao entrar em campo, você pode escolher qualquer carta em jogo, aliada ou inimiga. Se escolher uma, Todo troca instantaneamente de posição com ela. (Esse poder ocorre antes da comparação de pontos)',
            copiar: 'Ao entrar em campo, copia aleatoriamente a habilidade de uma carta que já esteja em jogo. A habilidade copiada permanece ativa enquanto Yuta permanecer em campo. (Esse poder ocorre antes da comparação de pontos)',
            dez_sombras: 'Ao colocar esta carta em campo, escolha uma das 10 cartas da categoria Sombras para ser invocada imediatamente em um espaço livre. Se a carta escolhida for Mahoraga, a carta invocadora é destruída após a invocação. (Esse poder ocorre antes da comparação de pontos)',
            desmantelar: 'Ao entrar em campo, todas as cartas adjacentes a Sukuna, aliadas ou inimigas, têm todos os seus atributos reduzidos pela metade, permanentemente. (Esse poder ocorre depois da comparação de pontos, funciona apenas uma vez, quando a carta é jogada, e não dura por rodadas)',
            infinito: 'Esta carta não pode ser capturada, convertida ou virada pelo adversário por qualquer efeito ou comparação de atributos.',
            erupcao_vulcanica: 'Ao entrar em campo, todas as cartas adjacentes inimigas recebem -2 em um atributo aleatório. (Esse poder ocorre antes da comparação de pontos)',
            transfiguracao_de_alma: 'Ao entrar em campo, Mahito toca as cartas inimigas adjacentes e troca o valor dos seus atributos de lugar: o de cima vai para baixo, o de baixo vai para cima, e os dois das laterais trocam entre si. (Esse poder ocorre antes da comparação de pontos)',
            vazio_infinito: 'Enquanto esta Expansão de Domínio estiver em campo, nenhuma carta pode mudar de lado: capturas ficam completamente bloqueadas para os dois jogadores.',
            santuario_malevolente: 'Enquanto esta Expansão de Domínio estiver em campo, todas as cartas do tabuleiro perdem metade dos pontos em todos os atributos.',
            auto_personificacao: 'Assim que é jogada, troca a posição dos atributos de todas as cartas em campo: o de cima vai para baixo, o de baixo vai para cima, e os das laterais trocam entre si. (Esse poder ocorre antes da comparação de pontos)',
            mar_brilhante: 'Assim que é jogada, aumenta em +5 um atributo aleatório de cada carta em campo. (Esse poder ocorre antes da comparação de pontos)',
            troca_de_corpos: 'O jogador pode escolher sacrificar esta carta para trazer de volta uma carta que foi destruída (aliada ou inimiga, à escolha, se houver mais de uma). A carta revivida surge no lugar onde Kenjaku estava. (Esse poder ocorre antes da comparação de pontos)',
            determinacao: 'Para cada carta inimiga virada (capturada) nesta jogada, esta carta recebe +2 em todos os atributos. (Esse poder ocorre depois da comparação de pontos)',
            adaptacao: 'Assim que entra em campo, esta carta destrói quem a invocou. A cada rodada, esta carta ganha +2 em todos os atributos.',
            corda_negra: 'Ao entrar em campo, escolha uma carta em jogo, aliada ou inimiga. A habilidade dessa carta é anulada até esta carta sair de campo. (Esse poder ocorre depois da comparação de pontos, e esse poder não pode ser copiado)',
            besta_mitica_ambar: 'Esta carta dura 3 rodadas em campo antes de se autodestruir. Quando isso acontece, todas as cartas adjacentes inimigas perdem 5 pontos em todos os atributos.'
        },
        shadowNames: {
            divine_dogs: 'Cães Divinos',
            nue: 'Nue',
            great_serpent: 'Grande Serpente',
            toad: 'Gama',
            round_deer: 'Cervo Redondo',
            max_elephant: 'Elefante Máximo',
            ox: 'Touro Perfurante',
            rabbit_escape: 'Fuga do Coelho',
            piercing_dog: 'Funeral do Tigre',
            mahoraga: 'Mahoraga'
        },
        domainNames: {
            d1: 'Vazio Infinito',
            d2: 'Santuário Malevolente',
            d3: 'Auto-Personificação da Perfeição',
            d4: 'Mar Brilhante de Galhos Crescentes'
        }
    },

    en: {
        appTitle: 'Jujutsu TCG',
        appSubtitle: 'Card Battle Arena',
        metaDescription: 'A card battle arena against the AI with level progression, deck building and PWA support.',

        playBtn: 'Play',
        deckBtn: 'Deck',
        tutorialBtn: 'Tutorial',
        settingsMenuBtn: 'Settings',
        installBtn: 'Install app',
        backBtn: 'Back',

        deckInfo: (count, total, max) => `Deck: ${count} cards (${total}/${max} level)`,
        maxLevelInfo: (cur, total) => `Highest level: ${cur}/${total}`,
        deckLevelStatus: (total, max) => `Deck Level: ${total}/${max}`,

        selectLevelTitle: 'Select Level',
        editDeckTitle: 'Edit Deck',
        inDeckLabel: '📋 In Deck',
        availableLabel: '📦 Available',
        lockedLabel: '🔒 Locked',
        emptyInDeck: 'No cards in the deck',
        emptyAvailable: 'All available cards are already in the deck',
        emptyLocked: 'No locked cards',
        removeBtn: 'Remove',
        addBtn: 'Add',
        lockTag: (level) => `Level ${level}`,
        levelCompleted: 'Completed',
        levelLocked: 'Locked',
        levelTag: (level) => `Level ${level}`,

        tutorialTitle: 'Tutorial',
        tutorialStep1Title: '🎯 Objective',
        tutorialStep1P1: 'Each match is played on a board. You and the opponent take turns placing cards on empty spaces, trying to capture each other\'s cards. Whoever ends the match controlling the most cards on the board wins.',
        tutorialStep2Title: '🃏 The two card types',
        tutorialCharLabel: 'Sorcerer<br><span>4 attributes (top, right, bottom, left) + level in the bottom corner</span>',
        tutorialDomainLabel: 'Domain Expansion<br><span>Refinement in the top corner + level in the bottom corner</span>',
        tutorialStep2P1: 'Sorcerer cards make up most of your deck and are the ones that capture and get captured. Domain Expansions have a <strong>Refinement</strong> number instead of attributes, and affect the whole board when played.',
        tutorialStep3Title: '🗺️ The board',
        tutorialStep3P1: 'The board has 5×5 spaces (25 total). The space right in the middle, highlighted in gold, is reserved exclusively for Domain Expansions — no Sorcerer card can be played there, and no Domain Expansion can be played anywhere else.',
        tutorialStep3P2: 'Only one Domain Expansion can be on the board at a time. To play another one over an existing one, the new one\'s <strong>Refinement</strong> needs to be equal or higher; this destroys the previous one (which can no longer be used in that match) and the new effect takes over.',
        tutorialStep4Title: '▶️ Taking your turn',
        tutorialStep4P1: 'On your turn, tap a card in your hand to select it, then tap a valid empty space on the board to play it there. Players alternate turn by turn until the match ends.',
        tutorialStep4P2: 'If you run out of cards in hand before the opponent, they keep playing alone until their hand is also empty — you don\'t lose your turn, you simply have nothing left to play.',
        tutorialStep5Title: '⚔️ How to capture',
        tutorialStep5P1: 'Every sorcerer card has 4 numbers: one on top, one at the bottom, one on the left and one on the right. When you place your card next to an enemy card, the number on your side facing it is compared to the number on its side facing you.',
        tutorialStep5P2: 'If your number is higher, you capture that card — it becomes yours, even though it stays in the same board space. A single move can capture multiple enemy cards at once if more than one is adjacent.',
        tutorialStep6Title: '💥 Destroyed cards',
        tutorialStep6P1: 'Some effects reduce a card\'s attributes (like powers that cut values in half or lower an attribute). If a card\'s 4 numbers all reach zero at the same time, it is <strong>destroyed</strong> (it leaves the board immediately and can\'t be used again in that match, by either player).',
        tutorialStep7Title: '✨ Special cards',
        tutorialStep7P1: 'Many character cards have unique powers that trigger automatically (or ask for a choice) as soon as they enter the board. To see each card\'s power, tap it twice (or double-click it) to open its details.',
        tutorialStep8Title: '🏆 End of match',
        tutorialStep8P1: 'The match ends when neither player can make any more moves, even if there are still empty spaces on the board.',
        tutorialStep8P2: 'When the match ends, whoever controls the most of their own cards on the board wins. A draw is possible.',
        tutorialStep9Title: '🧩 Building your deck',
        tutorialStep9P1: 'On the Deck screen you choose which unlocked cards go into your deck. Each card has a level, and the sum of your deck\'s levels can\'t exceed the limit shown on screen.',
        tutorialStep9P2: 'Your deck needs at least 1 character card for you to be able to enter a match — a deck with only Domain Expansions isn\'t enough, since they alone can\'t fill the board.',

        youLabel: 'You',
        opponentLabel: 'Opponent',
        opponentCardsTitle: "Opponent's Cards",
        opponentThinking: 'Opponent thinking…',
        yourCardsTitle: 'Your Cards',
        yourTurn: 'Your turn',
        opponentTurn: "Opponent's turn",

        gameMenuTitle: 'Menu',
        restartBtn: '↻ Restart',
        mainMenuBtn: 'Main Menu',
        backToLevelsBtn: 'Back to Levels',

        powerLabel: 'Power: ',
        cardFallbackName: 'Card',
        powerFallbackDesc: "This card's special power.",
        viewTenShadowsBtn: '🌑 View the Ten Shadows',

        shadowModalDefaultTitle: '🌑 Ten Shadows Technique',
        shadowSelectHint: 'Choose a shadow to summon',
        shadowBrowseHint: 'The 10 shadows you can summon',
        shadowWarnMahoraga: '⚠ Destroys whoever summoned it',
        bodySwapTitle: '🔁 Body Swap',
        bodySwapHint: 'Sacrifice Kenjaku to bring a destroyed card back, or cancel',
        bodySwapCancel: "❌ Don't sacrifice Kenjaku",

        toastDeckLevelExceeded: (max, cur) => `Deck level would exceed ${max}! (Current: ${cur})`,
        toastCardAdded: (name) => `✅ ${name} added to the deck!`,
        toastCardRemoved: (name) => `🗑️ ${name} removed from the deck.`,
        toastAddOneCard: 'Add at least 1 card to the deck.',
        toastAddCharacterCard: 'Add at least 1 character card to the deck (domains don\'t count).',

        toastDomainCenterOnly: 'Domain Expansions can only be played on the center space!',
        toastCenterExclusive: 'The center space is exclusive to Domain Expansions!',
        toastDomainOverridden: (oldName, newName) => `💥 ${oldName} was overridden and destroyed by ${newName}!`,
        domainAlreadyDestroyed: 'This domain has already been destroyed in this match and can\'t be used again.',
        domainInsufficientRefino: (name, refino) => `Not enough Refinement! ${name} (Refinement ${refino}) can only be overridden by a domain with Refinement ${refino} or higher.`,

        toastCardsCaptured: (count) => `⚡ ${count} cards captured!`,
        toastCardCaptured: '⚡ Card captured!',
        toastCardDestroyed: (name) => `💥 ${name} had all attributes reduced to zero and was destroyed!`,

        toastBoogieSelect: '🔄 Choose a card to swap with (or tap Todo again to cancel)',
        toastCordaNegraSelect: '⛓️ Choose a card to nullify the power of (or tap Miguel again to cancel)',

        levelUnlocked: (level) => `🔓 Level ${level} unlocked!`,
        newCardUnlocked: (name) => `New card unlocked: ${name}!`,
        allLevelsMastered: '🎉 You mastered every level!',
        levelWon: (level) => `🏆 Level ${level} won!`,
        youLost: '💀 You Lost. Try again!',
        draw: '⚖️ Draw!',

        installedStandalone: 'App running in installed mode.',
        installAvailable: 'Installation available on this browser.',
        installStarted: 'Installation started.',
        installCancelled: 'Installation cancelled.',
        installSuccess: 'App installed successfully.',
        updatingNewVersion: '🔄 Updating to the new version...',

        settingsTitle: 'Settings',
        settingsLanguage: 'Language',
        settingsLangPt: 'Português',
        settingsLangEn: 'English',
        settingsSound: 'Sound',
        settingsMusicLabel: 'Background music',
        settingsVolume: 'Volume',
        settingsMuted: 'Muted',
        settingsMusicHint: 'Tracks at audio/JK1.mp3, JK2.mp3 and JK4.mp3 play in sequence and repeat.',

        powerNames: {
            jackpot: 'Jackpot',
            boogie_woogie: 'Boogie Woogie',
            copiar: 'Copy',
            dez_sombras: 'Ten Shadows Technique',
            desmantelar: 'Dismantle',
            infinito: 'Infinity',
            erupcao_vulcanica: 'Volcanic Eruption',
            transfiguracao_de_alma: 'Idle Transfiguration',
            vazio_infinito: 'Infinite Void',
            santuario_malevolente: 'Malevolent Shrine',
            auto_personificacao: 'Self-Embodiment of Perfection',
            mar_brilhante: 'Shining Sea of Rising Branches',
            troca_de_corpos: 'Body Swap',
            determinacao: 'Determination',
            adaptacao: 'Adaptation',
            corda_negra: 'Black Cord',
            besta_mitica_ambar: 'Mythical Amber Beast'
        },
        powerDescriptions: {
            jackpot: 'While in hand, all of this card\'s attributes stay hidden (?). Once played, its attributes are rolled and stay fixed for the rest of the match. The odds of rolling high values are 90% if it\'s the first card played on the board, dropping 10% for every card already on the board. (This power happens before the point comparison)',
            boogie_woogie: 'Upon entering the board, you may choose any card in play, ally or enemy. If you choose one, Todo instantly swaps places with it. (This power happens before the point comparison)',
            copiar: 'Upon entering the board, randomly copies the power of a card already in play. The copied power stays active as long as Yuta remains on the board. (This power happens before the point comparison)',
            dez_sombras: 'When this card is played, choose one of the 10 Shadow cards to be summoned immediately in a free space. If the chosen card is Mahoraga, the summoning card is destroyed right after the summon. (This power happens before the point comparison)',
            desmantelar: 'Upon entering the board, every card adjacent to Sukuna, ally or enemy, has all of its attributes permanently cut in half. (This power happens after the point comparison, triggers only once when the card is played, and does not last over rounds)',
            infinito: 'This card cannot be captured, converted, or flipped by the opponent through any effect or attribute comparison.',
            erupcao_vulcanica: 'Upon entering the board, every adjacent enemy card gets -2 on a random attribute. (This power happens before the point comparison)',
            transfiguracao_de_alma: 'Upon entering the board, Mahito touches adjacent enemy cards and swaps their attribute values around: top goes to bottom, bottom goes to top, and the two sides swap with each other. (This power happens before the point comparison)',
            vazio_infinito: 'While this Domain Expansion is on the board, no card can change sides: captures are completely blocked for both players.',
            santuario_malevolente: 'While this Domain Expansion is on the board, every card on the board loses half its points on every attribute.',
            auto_personificacao: 'As soon as it\'s played, it swaps the attribute positions of every card on the board: top goes to bottom, bottom goes to top, and the sides swap with each other. (This power happens before the point comparison)',
            mar_brilhante: 'As soon as it\'s played, it raises a random attribute of every card on the board by +5. (This power happens before the point comparison)',
            troca_de_corpos: 'The player may choose to sacrifice this card to bring back a card that was destroyed (ally or enemy, your choice if more than one is available). The revived card appears where Kenjaku was standing. (This power happens before the point comparison)',
            determinacao: 'For every enemy card flipped (captured) on this move, this card gains +2 on every attribute. (This power happens after the point comparison)',
            adaptacao: 'As soon as it enters the board, this card destroys whoever summoned it. Every round, this card gains +2 on every attribute.',
            corda_negra: 'Upon entering the board, choose a card in play, ally or enemy. That card\'s power is nullified until this card leaves the board. (This power happens after the point comparison, and this power cannot be copied)',
            besta_mitica_ambar: 'This card lasts 3 rounds on the board before self-destructing. When that happens, every adjacent enemy card loses 5 points on every attribute.'
        },
        shadowNames: {
            divine_dogs: 'Divine Dogs',
            nue: 'Nue',
            great_serpent: 'Great Serpent',
            toad: 'Toad',
            round_deer: 'Round Deer',
            max_elephant: 'Max Elephant',
            ox: 'Piercing Ox',
            rabbit_escape: 'Rabbit Escape',
            piercing_dog: "Tiger's Funeral",
            mahoraga: 'Mahoraga'
        },
        domainNames: {
            d1: 'Infinite Void',
            d2: 'Malevolent Shrine',
            d3: 'Self-Embodiment of Perfection',
            d4: 'Shining Sea of Rising Branches'
        }
    }
};

let currentLanguage = 'pt';

function loadLanguagePreference() {
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && TRANSLATIONS[saved]) currentLanguage = saved;
    } catch (error) {
        console.warn('Nao foi possivel carregar o idioma salvo.', error);
    }
}

function saveLanguagePreference() {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, currentLanguage);
    } catch (error) {
        console.warn('Nao foi possivel salvar o idioma.', error);
    }
}

function t(key, ...args) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.pt;
    const value = dict[key] !== undefined ? dict[key] : TRANSLATIONS.pt[key];
    if (typeof value === 'function') return value(...args);
    return value !== undefined ? value : key;
}

function getPowerName(powerKey) {
    if (!powerKey) return '';
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.pt;
    return (dict.powerNames && dict.powerNames[powerKey])
        || (TRANSLATIONS.pt.powerNames && TRANSLATIONS.pt.powerNames[powerKey])
        || powerKey.replace(/_/g, ' ');
}

function getPowerDescription(powerKey) {
    if (!powerKey) return '';
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.pt;
    return (dict.powerDescriptions && dict.powerDescriptions[powerKey])
        || (TRANSLATIONS.pt.powerDescriptions && TRANSLATIONS.pt.powerDescriptions[powerKey])
        || t('powerFallbackDesc');
}

function getShadowDisplayName(shadowId) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.pt;
    return (dict.shadowNames && dict.shadowNames[shadowId])
        || (TRANSLATIONS.pt.shadowNames && TRANSLATIONS.pt.shadowNames[shadowId])
        || (SHADOW_CARDS[shadowId] && SHADOW_CARDS[shadowId].name)
        || shadowId;
}

function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'pt-BR';
    document.title = t('appTitle');

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('metaDescription'));

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = t(key);
        if (value === undefined) return;
        if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });
}

function setLanguage(lang) {
    if (!TRANSLATIONS[lang] || lang === currentLanguage) {
        if (!TRANSLATIONS[lang]) return;
    }
    currentLanguage = lang;
    saveLanguagePreference();
    applyStaticTranslations();
    if (typeof onLanguageChanged === 'function') onLanguageChanged();
}

loadLanguagePreference();
applyStaticTranslations();
