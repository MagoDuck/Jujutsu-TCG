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

function canPlaceDomain(card) {
    if (usedDomainIds.has(card.cardId)) {
        return { ok: false, reason: t('domainAlreadyDestroyed') };
    }
    const existing = boardState[CENTER_CELL];
    if (!existing || !existing.isDomain) return { ok: true };
    if (card.refino >= existing.refino) return { ok: true, overriding: existing };
    return { ok: false, reason: t('domainInsufficientRefino', existing.name, existing.refino) };
}

function isCaptureBlockedByDomain() {
    const domain = boardState[CENTER_CELL];
    return !!(domain && domain.isDomain && domain.power === 'vazio_infinito' && !domain.disabledPower);
}

function isCaptureBlockedForPair(attacker, defender) {
    if (!isCaptureBlockedByDomain()) return false;
    if (attacker && attacker.domainImmune) return false;
    if (defender && defender.domainImmune) return false;
    return true;
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

    playCardClickSound();

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('selected'));
 
    selectedCard = { player, index };
 
    const playerCards = player === 1 ? playerArea.children : opponentArea.children;
    if (playerCards[index]) {
        playerCards[index].classList.add('selected');
    }
    highlightValidTargets();
}
 
function paintCard(div, card, isHidden = false) {
    div.classList.toggle('owner1', card.owner === 1);
    div.classList.toggle('owner2', card.owner === 2);
    div.classList.toggle('opponent-hand', !!(card.owner === 2 && isHidden));
    div.classList.toggle('card-hidden', !!(isHidden && card.owner === 2));
    div.classList.toggle('frozen', !!(card.frozen && !isHidden));

    div.style.backgroundImage = (isHidden && card.owner === 2) ? 'none' : `url('${card.img}')`;
    div.style.cursor = isHidden ? 'default' : '';

    if (card.isDomain) {
        div.classList.add('domain-card');
        paintDomainContent(div, card);
    } else {
        div.classList.remove('domain-card');
        paintCharacterContent(div, card);
    }
}

function paintDomainContent(div, card) {
    const refinoEl = div.querySelector('.domain-refino');
    const levelEl = div.querySelector('.card-level');
    if (!refinoEl || !levelEl || div.querySelector('.values')) {
        div.innerHTML = `
            <div class="domain-refino">${card.refino || 0}</div>
            <div class="card-level"> ${card.cardLevel || 1}</div>
        `;
        return;
    }
    refinoEl.textContent = '' + (card.refino || 0);
    levelEl.textContent = ' ' + (card.cardLevel || 1);
}

function paintCharacterContent(div, card) {
    const hasValueSlots = div.querySelectorAll('.values').length === 4 && div.querySelector('.card-level');
    if (!hasValueSlots || div.querySelector('.domain-refino')) {
        div.innerHTML = `
            <div class="values top"></div>
            <div class="values right"></div>
            <div class="values bottom"></div>
            <div class="values left"></div>
            <div class="card-level"></div>
        `;
    }

    const tSymbol = card.hiddenStats ? '?' : toSymbol(card.t);
    const rSymbol = card.hiddenStats ? '?' : toSymbol(card.r);
    const bSymbol = card.hiddenStats ? '?' : toSymbol(card.b);
    const lSymbol = card.hiddenStats ? '?' : toSymbol(card.l);

    const topColor = getValueColor(card.t, card.original_t, card.frozen);
    const rightColor = getValueColor(card.r, card.original_r, card.frozen);
    const bottomColor = getValueColor(card.b, card.original_b, card.frozen);
    const leftColor = getValueColor(card.l, card.original_l, card.frozen);

    const topEl = div.querySelector('.values.top');
    topEl.className = `values top ${topColor}`;
    topEl.textContent = tSymbol;

    const rightEl = div.querySelector('.values.right');
    rightEl.className = `values right ${rightColor}`;
    rightEl.textContent = rSymbol;

    const bottomEl = div.querySelector('.values.bottom');
    bottomEl.className = `values bottom ${bottomColor}`;
    bottomEl.textContent = bSymbol;

    const leftEl = div.querySelector('.values.left');
    leftEl.className = `values left ${leftColor}`;
    leftEl.textContent = lSymbol;

    div.querySelector('.card-level').textContent = ' ' + (card.cardLevel || 1);
}

function renderCard(card, click, isSelected = false, isHidden = false) {
    const div = document.createElement("div");
    div.classList.add("card");
    paintCard(div, card, isHidden);

    if (isSelected) {
        div.classList.add('selected');
    }

    if (click && !isHidden) {
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            click();
        });
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
