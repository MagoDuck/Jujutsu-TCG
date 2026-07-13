function buildBoard() {
    board.innerHTML = "";
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if (i === CENTER_CELL) cell.classList.add("center-cell");
        cell.onclick = () => handleCellClick(i);
        board.appendChild(cell);
    }
}

function clearValidTargets() {
    document.querySelectorAll('.cell.valid-target').forEach(c => c.classList.remove('valid-target'));
    document.querySelectorAll('.cell.valid-target-override').forEach(c => c.classList.remove('valid-target-override'));
}

function highlightValidTargets() {
    clearValidTargets();
    if (!selectedCard) return;

    const deck = selectedCard.player === 1 ? playerDeck : opponentDeck;
    const card = deck[selectedCard.index];
    if (!card) return;

    if (card.isDomain) {
        const check = canPlaceDomain(card);
        if (check.ok) {
            board.children[CENTER_CELL].classList.add(check.overriding ? 'valid-target-override' : 'valid-target');
        }
        return;
    }

    boardState.forEach((c, i) => {
        if (c === null && i !== CENTER_CELL) board.children[i].classList.add('valid-target');
    });
}

// Só pode haver uma Expansão de Domínio em campo por vez. Se a casa central já tem
// um domínio, só é possível jogar outro por cima se o refino do novo for >= o do atual
// (isso destrói o domínio anterior e ele não pode ser reutilizado nesta partida).
function canPlaceDomain(card) {
    if (usedDomainIds.has(card.cardId)) {
        return { ok: false, reason: 'Este domínio já foi destruído nesta partida e não pode ser usado novamente.' };
    }
    const existing = boardState[CENTER_CELL];
    if (!existing || !existing.isDomain) return { ok: true };
    if (card.refino >= existing.refino) return { ok: true, overriding: existing };
    return { ok: false, reason: `Refino insuficiente! ${existing.name} (Refino ${existing.refino}) só pode ser sobreposto por um domínio de Refino ${existing.refino} ou maior.` };
}

function isCaptureBlockedByDomain() {
    const domain = boardState[CENTER_CELL];
    return !!(domain && domain.isDomain && domain.power === 'vazio_infinito');
}
 
function renderHands() {
    playerArea.innerHTML = "";
    opponentArea.innerHTML = "";
 
    playerDeck.forEach((c, i) => {
        playerArea.appendChild(renderCard(c, () => selectCard(1, i), selectedCard && selectedCard.player === 1 && selectedCard.index === i));
    });
 
    opponentDeck.forEach((c, i) => {
        opponentArea.appendChild(renderCard(c, null, false, true));
    });
 
    highlightValidTargets();
}
 
function selectCard(player, index) {
    if (currentPlayer !== player) return;
    if (gameEnded) return;
    if (pendingSelection) return;

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('selected'));
 
    selectedCard = { player, index };
 
    const playerCards = player === 1 ? playerArea.children : opponentArea.children;
    if (playerCards[index]) {
        playerCards[index].classList.add('selected');
    }
    highlightValidTargets();
}
 
function renderCard(card, click, isSelected = false, isHidden = false) {
    const div = document.createElement("div");
    div.classList.add("card");
    div.style.backgroundImage = `url('${card.img}')`;
    div.classList.add(card.owner === 1 ? "owner1" : "owner2");
 
    if (card.owner === 2 && isHidden) {
        div.classList.add('opponent-hand');
    }
 
    if (isSelected) {
        div.classList.add('selected');
    }
    
    if (isHidden && card.owner === 2) {
        div.classList.add('card-hidden');
        div.style.backgroundImage = 'none';
    }
 
    if (card.frozen && !isHidden) {
        div.classList.add('frozen');
    }

    if (card.isDomain) {
        // Expansões de Domínio não têm atributos: só refino (canto sup. esquerdo) e nível.
        div.classList.add('domain-card');
        div.innerHTML = `
            <div class="domain-refino">${card.refino || 0}</div>
            <div class="card-level"> ${card.cardLevel || 1}</div>
        `;
    } else {
        const tSymbol = card.hiddenStats ? '?' : toSymbol(card.t);
        const rSymbol = card.hiddenStats ? '?' : toSymbol(card.r);
        const bSymbol = card.hiddenStats ? '?' : toSymbol(card.b);
        const lSymbol = card.hiddenStats ? '?' : toSymbol(card.l);

        const topColor = getValueColor(card.t, card.original_t, card.frozen);
        const rightColor = getValueColor(card.r, card.original_r, card.frozen);
        const bottomColor = getValueColor(card.b, card.original_b, card.frozen);
        const leftColor = getValueColor(card.l, card.original_l, card.frozen);

        div.innerHTML = `
            <div class="values top ${topColor}">${tSymbol}</div>
            <div class="values right ${rightColor}">${rSymbol}</div>
            <div class="values bottom ${bottomColor}">${bSymbol}</div>
            <div class="values left ${leftColor}">${lSymbol}</div>
            <div class="card-level"> ${card.cardLevel || 1}</div>
        `;
    }

    if (click && !isHidden) {
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            click();
        });
    }
 
    if (isHidden) {
        div.style.cursor = 'default';
    }
 
    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (isHidden) return;
        expandAnyCard({
            img: card.img,
            t: card.t,
            r: card.r,
            b: card.b,
            l: card.l,
            original_t: card.original_t,
            original_r: card.original_r,
            original_b: card.original_b,
            original_l: card.original_l,
            name: card.name || 'Carta',
            power: card.power,
            owner: card.owner,
            frozen: card.frozen || false,
            cardLevel: card.cardLevel || 1,
            hiddenStats: card.hiddenStats || false,
            isDomain: card.isDomain || false,
            refino: card.refino || 0
        });
    });

    return div;
}
 
function spawnPowerRing(pos, type) {
    const cell = board.children[pos];
    if (!cell) return;
    const cardEl = cell.querySelector('.card');
    const host = cardEl || cell;
    const ring = document.createElement('div');
    ring.className = 'power-ring ' + type;
    host.style.position = host.style.position || 'relative';
    host.appendChild(ring);
    setTimeout(() => ring.remove(), 750);
}
 
function spawnFloatNumber(pos, text, positive, type = '') {
    const cell = board.children[pos];
    if (!cell) return;
    const num = document.createElement('div');
    num.className = 'float-num ' + (positive ? 'pos' : 'neg') + (type === 'freeze' ? ' freeze-float' : '');
    num.textContent = text;
    num.style.left = '50%';
    num.style.top = '38%';
    num.style.transform = 'translateX(-50%)';
    cell.appendChild(num);
    setTimeout(() => num.remove(), 950);
}
 
function getNeighborPositions(pos) {
    const candidates = [pos - BOARD_COLS, pos + BOARD_COLS, pos - 1, pos + 1];
    const currentRow = Math.floor(pos / BOARD_COLS);
    return candidates.filter(n => {
        if (n < 0 || n >= TOTAL_CELLS) return false;
        if (Math.abs(currentRow - Math.floor(n / BOARD_COLS)) > 1) return false;
        if (Math.abs((pos % BOARD_COLS) - (n % BOARD_COLS)) > 1) return false;
        return true;
    });
}

function halveAttributes(target) {
    target.t = Math.floor(target.t / 2);
    target.r = Math.floor(target.r / 2);
    target.b = Math.floor(target.b / 2);
    target.l = Math.floor(target.l / 2);
}
