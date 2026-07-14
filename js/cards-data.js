function createCard(img, t, r, b, l, owner, power = null, name = null, cardLevel = 1, isDomain = false, refino = 0) {
    const hiddenStats = (t === '?' || r === '?' || b === '?' || l === '?');
    const tNum = hiddenStats ? 0 : (Number(t) || 0);
    const rNum = hiddenStats ? 0 : (Number(r) || 0);
    const bNum = hiddenStats ? 0 : (Number(b) || 0);
    const lNum = hiddenStats ? 0 : (Number(l) || 0);

    return {
        img,
        t: tNum, r: rNum, b: bNum, l: lNum,
        original_t: tNum,
        original_r: rNum,
        original_b: bNum,
        original_l: lNum,
        base_t: tNum,
        base_r: rNum,
        base_b: bNum,
        base_l: lNum,
        owner,
        power,
        name: name || `Carta ${img.replace('.jpg', '')}`,
        frozen: false,
        cardLevel: cardLevel || 1,
        hiddenStats,
        isDomain: !!isDomain,
        refino: refino || 0,
        disabledPower: false,
        roundsOnField: 0,
        cordaNegraTargetId: null,
        cordaNegraTargetPos: null
    };
}
 
const POWER_SYMBOLS = {
    'jackpot': '🎰',
    'boogie_woogie': '🔄',
    'copiar': '📋',
    'dez_sombras': '🌑',
    'desmantelar': '👹',
    'infinito': '♾️',
    'erupcao_vulcanica': '🌋',
    'transfiguracao_de_alma': '🤚',
    'vazio_infinito': '🕳️',
    'santuario_malevolente': '🩸',
    'auto_personificacao': '🎭',
    'mar_brilhante': '🌊',
    'troca_de_corpos': '🔁',
    'determinacao': '💪',
    'adaptacao': '🐺',
    'corda_negra': '⛓️',
    'besta_mitica_ambar': '🐴'
};

const CARD_NAMES = {
    c1: 'Ryomen Sukuna', c2: 'Satoro Gojo', c3: 'Yuji Itadori', c4: 'Mahito', c5: 'Dagon',
    c6: 'Jogo', c7: 'Toji Fushiguro', c8: 'Yuta Okkotsu', c9: 'Choso', c10: 'Aoi Todo',
    c11: 'Fumihiko Takaba', c12: 'Hajime Kashimo', c13: 'Hanami', c14: 'Kenjaku', c15: 'Kento Nanami',
    c16: 'Kinji Hakari', c17: 'Maki Zenin', c18: 'Megumi Fushiguro', c19: 'Miguel Oduol', c20: 'Naoya Zenin',
    c21: 'Panda', c22: 'Reggie Star', c23: 'Toge Inumaki', c24: 'Uraume', c25: 'Yuki Tsukumo',
    c26: 'Yorozu', c27: 'Suguro Geto', c28: 'Noritoshi Kamo', c29: 'Naobito Zenin', c30: 'Kurourushi', c31: 'Yuka Okkotsu',
    d1: 'Vazio Infinito', d2: 'Santuário Malevolente', d3: 'Auto-Personificação da Perfeição', d4: 'Mar Brilhante de Galhos Crescentes'
};
 
const SHADOW_CARDS = {
    divine_dogs:   { name: 'Cães Divinos',           img: 'Img/Caes.jpg',  t: 8,  r: 9,  b: 7,  l: 8,  cardLevel: 3 },
    nue:           { name: 'Nue',                    img: 'Img/2.jpg',  t: 9,  r: 7,  b: 8,  l: 6,  cardLevel: 3 },
    great_serpent: { name: 'Grande Serpente',         img: 'Img/3.jpg',  t: 7,  r: 10, b: 6,  l: 9,  cardLevel: 3 },
    toad:          { name: 'Gama',                    img: 'Img/4.jpg',  t: 6,  r: 7,  b: 10, l: 7,  cardLevel: 2 },
    round_deer:    { name: 'Cervo Redondo',           img: 'Img/cervo.jpg',  t: 9,  r: 8,  b: 9,  l: 8,  cardLevel: 3 },
    max_elephant:  { name: 'Elefante Máximo',         img: 'Img/6.jpg',  t: 12, r: 9,  b: 8,  l: 7,  cardLevel: 4 },
    ox:            { name: 'Touro Perfurante',                   img: 'Img/Touro.jpg',  t: 9,  r: 12, b: 7,  l: 8,  cardLevel: 4 },
    rabbit_escape: { name: 'Fuga do Coelho',          img: 'Img/10.jpg', t: 6,  r: 6,  b: 6,  l: 14, cardLevel: 3 },
    piercing_dog:  { name: 'Funeral do Tigre',   img: 'Img/tigre.jpg', t: 11, r: 13, b: 8,  l: 9,  cardLevel: 4 },
    mahoraga:      { name: 'Mahoraga',                img: 'Img/Mahoraga.jpg', t: 1, r: 1, b: 1, l: 1, cardLevel: 5, power: 'adaptacao' }
};

const MAX_DECK_SIZE = 99;
const CARD_LIBRARY = {
    c1:  { img: 'Img/Sukuna.jpg',  t: 10,  r: 8, b: 10,  l: 8,  power: 'desmantelar',  unlockLevel: 1, cardLevel: 4 },
    c2:  { img: 'Img/Satoro.jpeg',  t: 8,  r: 9,  b: 7,  l: 12, power: 'infinito',   unlockLevel: 1, cardLevel: 2 },
    c3:  { img: 'Img/itadori yuuji.jpg',  t: 13, r: 5,  b: 10, l: 2,  power: 'determinacao', unlockLevel: 1, cardLevel: 3 },
    c4:  { img: 'Img/Mahito.jpg',  t: 7,  r: 13, b: 8,  l: 7,  power: 'transfiguracao_de_alma',  unlockLevel: 1, cardLevel: 2 },
    c5:  { img: 'Img/Dagon.jpg',  t: 15, r: 15, b: 0,  l: 15, power: null, unlockLevel: 1, cardLevel: 1 },
    c6:  { img: 'Img/Jogo.jpg',  t: 9,  r: 8,  b: 14, l: 6,  power: 'erupcao_vulcanica', unlockLevel: 1, cardLevel: 3 },
    c7:  { img: 'Img/Toji fushiguro.jpg',  t: 15, r: 14, b: 10, l: 9,  power: null,   unlockLevel: 1, cardLevel: 1 },
    c8:  { img: 'Img/Yuta.jpg', t: 10, r: 3,  b: 8,  l: 6,  power: 'copiar',   unlockLevel: 1, cardLevel: 2 },
    c9:  { img: 'Img/Choso.jpg', t: 14, r: 9,  b: 9,  l: 15, power: null, unlockLevel: 1, cardLevel: 4 },
    c10: { img: 'Img/Aoi Todo.jpg', t: 6,  r: 9,  b: 4,  l: 11, power: 'boogie_woogie',   unlockLevel: 1, cardLevel: 2 },
    c11: { img: 'Img/Takaba.jpg',  t: 10, r: 9,  b: 8,  l: 9,  power: null, unlockLevel: 2, cardLevel: 3 },
    c12: { img: 'Img/Hajime.jpg',  t: 9,  r: 10, b: 9,  l: 8,  power: 'besta_mitica_ambar', unlockLevel: 2, cardLevel: 3 },
    c13: { img: 'Img/Hanami.jpg',  t: 8,  r: 9,  b: 10, l: 9,  power: null, unlockLevel: 3, cardLevel: 3 },
    c14: { img: 'Img/Kenjaku.jpg',  t: 10, r: 10, b: 8,  l: 8,  power: 'troca_de_corpos', unlockLevel: 3, cardLevel: 3 },
    c15: { img: 'Img/Nanami.jpg',  t: 9,  r: 8,  b: 11, l: 10, power: null, unlockLevel: 4, cardLevel: 3 },
    c16: { img: 'Img/Hakari.jpg',  t: '?', r: '?', b: '?',  l: '?',  power: 'jackpot', unlockLevel: 4, cardLevel: 3 },
    c17: { img: 'Img/Zenin maki.jpg', t: 10, r: 11, b: 10, l: 9,  power: null,  unlockLevel: 5, cardLevel: 4 },
    c18: { img: 'Img/Megumi.jpg', t: 9,  r: 10, b: 11, l: 10, power: 'dez_sombras', unlockLevel: 5, cardLevel: 4 },
    c19: { img: 'Img/Migue.jpg', t: 11, r: 11, b: 9,  l: 9,  power: 'corda_negra', unlockLevel: 6, cardLevel: 4 },
    c20: { img: 'Img/Nao.jpg',  t: 10, r: 9,  b: 12, l: 11, power: null, unlockLevel: 6, cardLevel: 4 },
    c21: { img: 'Img/Panda.jpg',  t: 11, r: 12, b: 10, l: 9,  power: null,  unlockLevel: 7, cardLevel: 4 },
    c22: { img: 'Img/Star.jpg',  t: 10, r: 11, b: 12, l: 10, power: null, unlockLevel: 7, cardLevel: 4 },
    c23: { img: 'Img/6.jpg',  t: 12, r: 11, b: 10, l: 11, power: null, unlockLevel: 8, cardLevel: 5 },
    c24: { img: 'Img/1.jpg',  t: 11, r: 12, b: 13, l: 10, power: null, unlockLevel: 8, cardLevel: 5 },
    c25: { img: 'Img/3.jpg',  t: 13, r: 12, b: 11, l: 11, power: null,  unlockLevel: 9, cardLevel: 5 },
    c26: { img: 'Img/7.jpg',  t: 12, r: 13, b: 12, l: 11, power: null, unlockLevel: 9, cardLevel: 5 },
    c27: { img: 'Img/10.jpg', t: 13, r: 13, b: 12, l: 12, power: null, unlockLevel: 10, cardLevel: 5 },
    c28: { img: 'Img/12.jpg', t: 14, r: 13, b: 13, l: 12, power: null, unlockLevel: 10, cardLevel: 5 },
    c29: { img: 'Img/11.jpg', t: 15, r: 14, b: 14, l: 13, power: null,  unlockLevel: 11, cardLevel: 5 },
    c30: { img: 'Img/5.jpg',  t: 16, r: 16, b: 15, l: 15, power: null, unlockLevel: 12, cardLevel: 5 },
    c31: { img: 'Img/5.jpg',  t: 16, r: 16, b: 15, l: 15, power: 'dez_sombras', unlockLevel: 1, cardLevel: 1 },

    d1: { img: 'Img/eds.jpg',     t: 0, r: 0, b: 0, l: 0, power: 'vazio_infinito',        isDomain: true, refino: 10, unlockLevel: 1, cardLevel: 5 },
    d2: { img: 'Img/ede.jpg', t: 0, r: 0, b: 0, l: 0, power: 'santuario_malevolente', isDomain: true, refino: 10, unlockLevel: 1, cardLevel: 5 },
    d3: { img: 'Img/AutoPersonificacao.jpg', t: 0, r: 0, b: 0, l: 0, power: 'auto_personificacao',   isDomain: true, refino: 7,  unlockLevel: 1, cardLevel: 3 },
    d4: { img: 'Img/MarBrilhante.jpg',      t: 0, r: 0, b: 0, l: 0, power: 'mar_brilhante',          isDomain: true, refino: 3,  unlockLevel: 1, cardLevel: 2 }
};
const STARTING_DECK = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];
const BOARD_COLS = 5;
const TOTAL_CELLS = 25;
const CENTER_CELL = Math.floor(TOTAL_CELLS / 2);
let usedDomainIds = new Set();
let destroyedCardIds = new Set();
let destroyedCardsLog = [];
let boardState = Array(TOTAL_CELLS).fill(null);
let currentPlayer = 1;
let selectedCard = null;
let playerDeck = [];
let opponentDeck = [];
let gameEnded = false;
let pendingSelection = null;

