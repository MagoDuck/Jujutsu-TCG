function updateCardDisplay(pos, card) {
    const cell = board.children[pos];
    if (!cell || !card) return;

    const existing = cell.querySelector('.card');
    if (existing) {
        paintCard(existing, card, false);
    } else {
        cell.innerHTML = '';
        cell.appendChild(renderCard(card));
    }
}
 
function handleCellClick(pos) {
    if (pendingSelection) {
        const { pos: sourcePos, targets, resolve } = pendingSelection;
        pendingSelection = null;
        clearValidTargets();
        const hostCard = board.children[sourcePos].querySelector('.card');
        if (hostCard) hostCard.classList.remove('selected');

        if (pos === sourcePos) { resolve(null); return; }
        if (targets.includes(pos)) { resolve(pos); return; }
        resolve(null);
        return;
    }
    placeCard(pos);
}

function placeCard(pos) {
    if (gameEnded) return;
    if (pendingSelection) return;
    if (!selectedCard) return;

    const deck = selectedCard.player === 1 ? playerDeck : opponentDeck;
    const card = deck[selectedCard.index];
    if (!card) return;

    if (card.isDomain) {
        if (pos !== CENTER_CELL) {
            showToast(t('toastDomainCenterOnly'), 'p2');
            return;
        }
        const check = canPlaceDomain(card);
        if (!check.ok) {
            showToast('🌀 ' + check.reason, 'p2');
            return;
        }
        if (check.overriding) {
            const old = check.overriding;
            usedDomainIds.add(old.cardId);
            showToast(t('toastDomainOverridden', old.name, card.name), 'gold');
            boardState[CENTER_CELL] = null;
            const oldCell = board.children[CENTER_CELL];
            if (oldCell) oldCell.innerHTML = '';
        }
    } else if (pos === CENTER_CELL) {
        showToast(t('toastCenterExclusive'), 'p2');
        return;
    }

    if (boardState[pos] !== null) return;

    const cell = board.children[pos];

    boardState[pos] = {
        img: card.img,
        t: card.t,
        r: card.r,
        b: card.b,
        l: card.l,
        original_t: card.original_t !== undefined ? card.original_t : card.t,
        original_r: card.original_r !== undefined ? card.original_r : card.r,
        original_b: card.original_b !== undefined ? card.original_b : card.b,
        original_l: card.original_l !== undefined ? card.original_l : card.l,
        base_t: card.base_t !== undefined ? card.base_t : card.t,
        base_r: card.base_r !== undefined ? card.base_r : card.r,
        base_b: card.base_b !== undefined ? card.base_b : card.b,
        base_l: card.base_l !== undefined ? card.base_l : card.l,
        owner: card.owner,
        power: card.power,
        name: card.name,
        frozen: false,
        cardLevel: card.cardLevel || 1,
        invincible: false,
        hiddenStats: card.hiddenStats || false,
        isDomain: !!card.isDomain,
        refino: card.refino || 0,
        cardId: card.cardId,
        disabledPower: false,
        roundsOnField: 0,
        cordaNegraTargetId: null,
        cordaNegraTargetPos: null
    };

    deck.splice(selectedCard.index, 1);

    const newCardEl = renderCard(boardState[pos]);
    newCardEl.classList.add('just-placed');
    cell.appendChild(newCardEl);
    setTimeout(() => newCardEl.classList.remove('just-placed'), 350);
    playCardPlaceSound();

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(c => c.classList.remove('selected'));

    const placedCard = boardState[pos];
    selectedCard = null;
    clearValidTargets();
    renderHands();

    if (placedCard.power) {
        resolveCardPower(pos, placedCard, () => continueTurn(pos, placedCard));
    } else {
        continueTurn(pos, placedCard);
    }
}

const POST_CAPTURE_POWERS = ['desmantelar', 'determinacao', 'corda_negra'];

function continueTurn(pos, card) {
    recalcAuras();
    destroyZeroAttributeCards();

    let captured = 0;
    if (boardState[pos] === card && !card.isDomain) {
        captured = captureCards(pos, card);
    }

    const finishTurn = () => {
        tickRoundBasedPowers();
        destroyZeroAttributeCards();
        updateScores();
        checkGameEnd();

        if (!gameEnded) {
            currentPlayer = determineNextPlayer(currentPlayer);
            updateTurnBanner();

            if (currentPlayer === 2) {
                updateTurnBanner(true);
                setTimeout(aiMove, 500);
            }
        }

        renderHands();
    };

    if (card.power && POST_CAPTURE_POWERS.includes(card.power) && boardState[pos] === card && !card.isDomain) {
        resolvePostCapturePower(pos, card, captured, finishTurn);
    } else {
        finishTurn();
    }
}

function canCardBePlaced(card) {
    if (card.isDomain) return canPlaceDomain(card).ok;
    return boardState.some((c, i) => c === null && i !== CENTER_CELL);
}

function playerHasValidMove(deck) {
    return !!deck && deck.some(canCardBePlaced);
}

function determineNextPlayer(mover) {
    const other = mover === 1 ? 2 : 1;
    const otherDeck = other === 1 ? playerDeck : opponentDeck;
    const moverDeck = mover === 1 ? playerDeck : opponentDeck;

    if (playerHasValidMove(otherDeck)) return other;
    if (playerHasValidMove(moverDeck)) return mover;
    return mover;
}

function captureCards(pos, card) {
    const sides = {
        [pos - BOARD_COLS]: { side: "t", opposite: "b" },
        [pos + BOARD_COLS]: { side: "b", opposite: "t" },
        [pos - 1]: { side: "l", opposite: "r" },
        [pos + 1]: { side: "r", opposite: "l" }
    };

    let captureCount = 0;

    getNeighborPositions(pos).forEach(n => {
        const { side, opposite } = sides[n];
        const other = boardState[n];
        const isInvincible = other && other.invincible && !other.disabledPower;
        const blockedByDomain = isCaptureBlockedForPair(card, other);
        if (other && !other.isDomain && other.owner !== card.owner && !other.frozen && !isInvincible && !blockedByDomain) {
            if (card[side] > other[opposite]) {
                other.owner = card.owner;
                updateCardDisplay(n, other);
                const capturedEl = board.children[n].querySelector('.card');
                if (capturedEl) capturedEl.classList.add('capturing');
                captureCount++;
            }
        }
    });

    if (captureCount > 0) {
        showToast(captureCount > 1 ? t('toastCardsCaptured', captureCount) : t('toastCardCaptured'), card.owner === 1 ? 'p1' : 'p2');
    }

    return captureCount;
}
 
function checkGameEnd() {
    let nonCenterFilled = 0;
    boardState.forEach((c, i) => {
        if (c && i !== CENTER_CELL) nonCenterFilled++;
    });
    const boardFull = nonCenterFilled >= TOTAL_CELLS - 1;

    // A partida também termina quando os dois lados ficam sem cartas para jogar,
    // mesmo que ainda existam casas vazias no tabuleiro.
    const bothHandsEmpty = playerDeck.length === 0 && opponentDeck.length === 0;

    // ...ou quando nenhum dos dois consegue mais realizar uma jogada válida
    // (ex: só resta um domínio com Refino insuficiente para o que está em campo).
    const noOneCanMove = !playerHasValidMove(playerDeck) && !playerHasValidMove(opponentDeck);

    if (boardFull || bothHandsEmpty || noOneCanMove) {
        declareWinnerAndEndMatch();
    }
}

function declareWinnerAndEndMatch() {
    gameEnded = true;
    let p1 = 0, p2 = 0;

    boardState.forEach(c => {
        if (c) {
            if (c.owner === 1) p1++;
            else if (c.owner === 2) p2++;
        }
    });

    if (p1 > p2) {
        let unlockMsg = '';
        if (currentLevel === highestUnlockedLevel && highestUnlockedLevel < TOTAL_LEVELS) {
            highestUnlockedLevel++;
            savePlayerProgress();
            const newlyUnlocked = Object.keys(CARD_LIBRARY).filter(id => CARD_LIBRARY[id].unlockLevel === highestUnlockedLevel);
            unlockMsg = `<br><span style="font-size:16px;">${t('levelUnlocked', highestUnlockedLevel)}</span>`;
            if (newlyUnlocked.length) {
                showToast(t('newCardUnlocked', getCardDisplayName(newlyUnlocked[0])), 'gold');
            }
        } else if (currentLevel === highestUnlockedLevel && highestUnlockedLevel >= TOTAL_LEVELS) {
            unlockMsg = `<br><span style="font-size:16px;">${t('allLevelsMastered')}</span>`;
        }
        winnerBox.innerHTML = `<span style="color:#ffd700;">${t('levelWon', currentLevel)}</span>${unlockMsg}`;
    } else if (p2 > p1) {
        winnerBox.innerHTML = `<span style="color:#ffd700;">${t('youLost')}</span>`;
    } else {
        winnerBox.innerHTML = `<span style="color:#ffd700;">${t('draw')}</span>`;
    }

    postMatchActions.style.display = 'flex';
    winnerOverlay.classList.add('active');
    clearValidTargets();
}
 
function updateScores() {
    let p1 = 0, p2 = 0;
 
    boardState.forEach(c => {
        if (c) {
            if (c.owner === 1) p1++;
            else if (c.owner === 2) p2++;
        }
    });
 
    document.getElementById("countP1").textContent = p1;
    document.getElementById("countP2").textContent = p2;
}
 
function cloneBoardState(b) {
    return b.map(c => c ? { ...c } : null);
}
 
function simulateCapture(simBoard, pos, card) {
    const neighbors = [
        { pos: pos - BOARD_COLS, side: "t", opposite: "b" },
        { pos: pos + BOARD_COLS, side: "b", opposite: "t" },
        { pos: pos - 1, side: "l", opposite: "r" },
        { pos: pos + 1, side: "r", opposite: "l" }
    ];

    let gained = 0;
    neighbors.forEach(n => {
        if (n.pos < 0 || n.pos >= TOTAL_CELLS) return;
        const currentRow = Math.floor(pos / BOARD_COLS);
        const neighborRow = Math.floor(n.pos / BOARD_COLS);
        if (Math.abs(currentRow - neighborRow) > 1) return;
        if (Math.abs((pos % BOARD_COLS) - (n.pos % BOARD_COLS)) > 1) return;

        const other = simBoard[n.pos];
        const isInvincible = other && other.invincible && !other.disabledPower;
        const blockedByDomain = isCaptureBlockedForPair(card, other);
        if (other && !other.isDomain && other.owner !== card.owner && !other.frozen && !isInvincible && !blockedByDomain) {
            if (card[n.side] > other[n.opposite]) {
                other.owner = card.owner;
                gained++;
            }
        }
    });
    return gained;
}
 
function cardPowerScore(cardId) {
    const d = CARD_LIBRARY[cardId];
    let bonus = 0;
    if (d.power) bonus = 3;
    return d.t + d.r + d.b + d.l + bonus;
}
 
function getAiDeckForLevel(level, owner) {
    const ids = Object.keys(CARD_LIBRARY).filter(id => !CARD_LIBRARY[id].isDomain);
    const sorted = ids.slice().sort((a, b) => cardPowerScore(a) - cardPowerScore(b));
    const windowSize = 10;
    const maxStart = sorted.length - windowSize;
    const startIndex = Math.round(((level - 1) / (TOTAL_LEVELS - 1)) * maxStart);
    return sorted.slice(startIndex, startIndex + windowSize).map(id => createOwnedCard(id, owner));
}
 
function getAiRandomChance(level) {
    return Math.max(0, 0.85 - (level - 1) * (0.85 / (TOTAL_LEVELS - 1)));
}
 
function aiMove() {
    if (gameEnded) return;
    if (opponentDeck.length === 0) return;
 
    const emptyCells = [];
    boardState.forEach((v, i) => {
        if (v === null && i !== CENTER_CELL) emptyCells.push(i);
    });

    if (emptyCells.length === 0) return;
 
    if (Math.random() < getAiRandomChance(currentLevel)) {
        const randomPos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const randomCardIndex = Math.floor(Math.random() * opponentDeck.length);
        selectedCard = { player: 2, index: randomCardIndex };
        placeCard(randomPos);
        return;
    }
 
    const corners = [0, 4, 20, 24];
 
    let bestPos = emptyCells[0];
    let bestCardIndex = 0;
    let bestScore = -Infinity;
 
    const normalOpponentCards = opponentDeck.map((c, idx) => ({ c, idx }));
    const normalPlayerCards = playerDeck;
 
    normalOpponentCards.forEach(({ c: card, idx: cardIndex }) => {
        emptyCells.forEach(pos => {
            const simBoard = cloneBoardState(boardState);
            const placedCard = { ...card, owner: 2, invincible: false };
            simBoard[pos] = placedCard;
 
            const myCaptures = simulateCapture(simBoard, pos, placedCard);
 
            const emptyAfter = [];
            simBoard.forEach((v, i) => { if (v === null && i !== CENTER_CELL) emptyAfter.push(i); });
 
            let opponentBestCaptures = 0;
            normalPlayerCards.forEach(pc => {
                emptyAfter.forEach(epos => {
                    const simBoard2 = cloneBoardState(simBoard);
                    const placed2 = { ...pc, owner: 1, invincible: false };
                    simBoard2[epos] = placed2;
                    const cap = simulateCapture(simBoard2, epos, placed2);
                    if (cap > opponentBestCaptures) opponentBestCaptures = cap;
                });
            });
 
            let score = myCaptures * 3 - opponentBestCaptures * 2;
 
            if (card.power) score += 2;
 
            if (corners.includes(pos)) score += 0.5;
 
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
                bestCardIndex = cardIndex;
            }
        });
    });
 
    selectedCard = { player: 2, index: bestCardIndex };
    placeCard(bestPos);
}
 
