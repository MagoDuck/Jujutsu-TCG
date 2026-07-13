function updateCardDisplay(pos, card) {
    const cell = board.children[pos];
    if (cell && card) {
        cell.innerHTML = '';
        cell.appendChild(renderCard(card));
    }
}
 
function handleCellClick(pos) {
    if (pendingSelection && pendingSelection.type === 'boogie') {
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
            showToast('🌀 Expansões de Domínio só podem ser jogadas na casa central!', 'p2');
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
            showToast(`💥 ${old.name} foi sobreposto(a) e destruído(a) por ${card.name}!`, 'gold');
            boardState[CENTER_CELL] = null;
            const oldCell = board.children[CENTER_CELL];
            if (oldCell) oldCell.innerHTML = '';
        }
    } else if (pos === CENTER_CELL) {
        showToast('🌀 A casa central é exclusiva para Expansões de Domínio!', 'p2');
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
        cardId: card.cardId
    };

    deck.splice(selectedCard.index, 1);

    const newCardEl = renderCard(boardState[pos]);
    newCardEl.classList.add('just-placed');
    cell.appendChild(newCardEl);
    setTimeout(() => newCardEl.classList.remove('just-placed'), 350);

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

function continueTurn(pos, card) {
    recalcAuras();
    destroyZeroAttributeCards();

    if (boardState[pos] === card && !card.isDomain) {
        captureCards(pos, card);
    }

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
}

function determineNextPlayer(mover) {
    const other = mover === 1 ? 2 : 1;
    const otherDeck = other === 1 ? playerDeck : opponentDeck;
    return otherDeck.length > 0 ? other : mover;
}

function captureCards(pos, card) {
    if (isCaptureBlockedByDomain()) {
        showToast('🕳️ Vazio Infinito impede qualquer captura!', 'p2');
        return;
    }

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
        if (other && !other.isDomain && other.owner !== card.owner && !other.frozen && !other.invincible) {
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
        showToast(captureCount > 1 ? `⚡ ${captureCount} cartas capturadas!` : '⚡ Carta capturada!', card.owner === 1 ? 'p1' : 'p2');
    }
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

    if (boardFull || bothHandsEmpty) {
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
            unlockMsg = `<br><span style="font-size:16px;">🔓 Nível ${highestUnlockedLevel} desbloqueado!</span>`;
            if (newlyUnlocked.length) {
                showToast(`Nova carta desbloqueada: ${getCardDisplayName(newlyUnlocked[0])}!`, 'gold');
            }
        } else if (currentLevel === highestUnlockedLevel && highestUnlockedLevel >= TOTAL_LEVELS) {
            unlockMsg = `<br><span style="font-size:16px;">🎉 Você dominou todos os níveis!</span>`;
        }
        winnerBox.innerHTML = `<span style="color:#ffd700;">🏆 Nível ${currentLevel} vencido!</span>${unlockMsg}`;
    } else if (p2 > p1) {
        winnerBox.innerHTML = `<span style="color:#ffd700;">💀 Você Perdeu. Tente novamente!</span>`;
    } else {
        winnerBox.innerHTML = `<span style="color:#ffd700;">⚖️ Empate!</span>`;
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
    if (isCaptureBlockedByDomain()) return 0;

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
        if (other && !other.isDomain && other.owner !== card.owner && !other.frozen && !other.invincible) {
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
 
