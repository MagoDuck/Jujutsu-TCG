function showScreen(name) {
    mainMenu.classList.toggle('hidden', name !== 'menu');
    deckScreen.classList.toggle('hidden', name !== 'deck');
    levelScreen.classList.toggle('hidden', name !== 'levels');
    tutorialScreen.classList.toggle('hidden', name !== 'tutorial');
    gameScreen.classList.toggle('hidden', name !== 'game');
    renderMenuStats();
}
function renderMenuStats() {
    const totalLevel = getDeckTotalLevel();
    menuDeckInfo.textContent = `Deck: ${playerDeckTemplate.length} cartas (${totalLevel}/${MAX_DECK_LEVEL} nível)`;
    menuLevelInfo.textContent = `Nível máximo: ${highestUnlockedLevel}/${TOTAL_LEVELS}`;
    deckCount.textContent = `Nível do Deck: ${totalLevel}/${MAX_DECK_LEVEL}`;
    deckCount.classList.toggle('deck-status-full', totalLevel >= MAX_DECK_LEVEL);
    const deckIds = new Set(playerDeckTemplate);
    const allIds = Object.keys(CARD_LIBRARY);
    const unlocked = allIds.filter(id => isCardUnlocked(id));
    const locked = allIds.filter(id => !isCardUnlocked(id));
    const inDeck = unlocked.filter(id => deckIds.has(id));
    const available = unlocked.filter(id => !deckIds.has(id));
    inDeckCount.textContent = inDeck.length;
    availableCount.textContent = available.length;
    lockedCount.textContent = locked.length;
}
 
function getValueColor(currentValue, originalValue, frozen) {
    if (frozen) return 'value-frozen';
    if (currentValue < originalValue) return 'value-decreased';
    if (currentValue > originalValue) return 'value-increased';
    return 'value-normal';
}
 
function expandAnyCard(cardData) {
    if (!cardData) return;
    
    cardModalImage.innerHTML = '';
    cardModalImage.style.backgroundImage = `url('${cardData.img}')`;
    cardModalImage.style.borderColor = cardData.owner === 1 ? 'var(--p1)' : 'var(--p2)';
    cardModalImage.style.boxShadow = cardData.owner === 1 ? '0 0 24px var(--p1-glow)' : '0 0 24px var(--p2-glow)';
    
    if (cardData.isDomain) {
        cardModalImage.classList.add('domain-card');
        const refinoEl = document.createElement('div');
        refinoEl.className = 'domain-refino';
        refinoEl.textContent = '' + (cardData.refino || 0);
        cardModalImage.appendChild(refinoEl);
    } else {
        cardModalImage.classList.remove('domain-card');
        const tSymbol = cardData.hiddenStats ? '?' : toSymbol(cardData.t);
        const rSymbol = cardData.hiddenStats ? '?' : toSymbol(cardData.r);
        const bSymbol = cardData.hiddenStats ? '?' : toSymbol(cardData.b);
        const lSymbol = cardData.hiddenStats ? '?' : toSymbol(cardData.l);

        const topColor = getValueColor(cardData.t, cardData.original_t || cardData.t, cardData.frozen || false);
        const rightColor = getValueColor(cardData.r, cardData.original_r || cardData.r, cardData.frozen || false);
        const bottomColor = getValueColor(cardData.b, cardData.original_b || cardData.b, cardData.frozen || false);
        const leftColor = getValueColor(cardData.l, cardData.original_l || cardData.l, cardData.frozen || false);

        const topEl = document.createElement('div');
        topEl.className = `values top ${topColor}`;
        topEl.textContent = tSymbol;

        const rightEl = document.createElement('div');
        rightEl.className = `values right ${rightColor}`;
        rightEl.textContent = rSymbol;

        const bottomEl = document.createElement('div');
        bottomEl.className = `values bottom ${bottomColor}`;
        bottomEl.textContent = bSymbol;

        const leftEl = document.createElement('div');
        leftEl.className = `values left ${leftColor}`;
        leftEl.textContent = lSymbol;

        cardModalImage.appendChild(topEl);
        cardModalImage.appendChild(rightEl);
        cardModalImage.appendChild(bottomEl);
        cardModalImage.appendChild(leftEl);
    }

    if (cardData.cardLevel) {
        const levelEl = document.createElement('div');
        levelEl.className = 'card-level';
        levelEl.textContent = '' + cardData.cardLevel;
        cardModalImage.appendChild(levelEl);
    }
    
    if (cardData.frozen) {
        cardModalImage.style.borderColor = '#4fc3f7';
        cardModalImage.style.boxShadow = '0 0 30px rgba(79,195,247,0.5)';
        const freezeOverlay = document.createElement('div');
        freezeOverlay.style.cssText = `
            position: absolute;
            inset: 0;
            background: rgba(79,195,247,0.15);
            border-radius: 10px;
            pointer-events: none;
            z-index: 2;
        `;
        cardModalImage.appendChild(freezeOverlay);
        const freezeIcon = document.createElement('div');
        freezeIcon.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 40px;
            z-index: 5;
            opacity: 0.4;
            text-shadow: 0 0 30px rgba(79,195,247,0.5);
            pointer-events: none;
        `;
        freezeIcon.textContent = '❄️';
        cardModalImage.appendChild(freezeIcon);
    }
    
    cardModalName.textContent = cardData.name || 'Carta';
    cardModalName.style.color = cardData.owner === 1 ? 'var(--p1)' : 'var(--p2)';
    
    const powerSection = document.getElementById('cardModalPower');
    let shadowBtn = document.getElementById('cardModalShadowBtn');
    if (cardData.power) {
        powerSection.style.display = 'block';
        const powerName = cardData.power.replace(/_/g, ' ');
        cardModalPowerName.textContent = powerName.charAt(0).toUpperCase() + powerName.slice(1);
        cardModalPowerName.style.color = '#6bff6b';
        cardModalPowerDesc.textContent = POWER_DESCRIPTIONS[cardData.power] || 'Poder especial desta carta.';

        if (cardData.power === 'dez_sombras') {
            if (!shadowBtn) {
                shadowBtn = document.createElement('button');
                shadowBtn.id = 'cardModalShadowBtn';
                shadowBtn.type = 'button';
                shadowBtn.className = 'card-action-btn';
                shadowBtn.style.marginTop = '12px';
                shadowBtn.style.width = '100%';
                shadowBtn.onclick = (e) => { e.stopPropagation(); openShadowBrowseModal(); };
                powerSection.appendChild(shadowBtn);
            }
            shadowBtn.textContent = '🌑 Ver as Dez Sombras';
            shadowBtn.style.display = 'block';
        } else if (shadowBtn) {
            shadowBtn.style.display = 'none';
        }

        let domainHint = document.getElementById('cardModalDomainHint');
        if (cardData.isDomain) {
            if (!domainHint) {
                domainHint = document.createElement('div');
                domainHint.id = 'cardModalDomainHint';
                domainHint.className = 'domain-hint';
                powerSection.appendChild(domainHint);
            }
            domainHint.textContent = ``;
            domainHint.style.display = 'block';
        } else if (domainHint) {
            domainHint.style.display = 'none';
        }
    } else {
        powerSection.style.display = 'none';
        if (shadowBtn) shadowBtn.style.display = 'none';
    }

    cardModal.classList.add('active');
}
 
function closeCardModal() {
    cardModal.classList.remove('active');
}

function buildShadowCardPreview(id) {
    const s = SHADOW_CARDS[id];
    return createCard(s.img, s.t, s.r, s.b, s.l, 1, null, s.name, s.cardLevel);
}

function renderShadowGrid(onChoose) {
    shadowGrid.innerHTML = '';
    Object.keys(SHADOW_CARDS).forEach(id => {
        const s = SHADOW_CARDS[id];
        const opt = document.createElement('div');
        opt.className = 'shadow-option' + (id === 'mahoraga' ? ' mahoraga' : '');
        opt.dataset.choosable = onChoose ? 'true' : 'false';

        opt.appendChild(renderCard(buildShadowCardPreview(id), null, false));

        const nameEl = document.createElement('div');
        nameEl.className = 'shadow-name';
        nameEl.textContent = s.name;
        opt.appendChild(nameEl);

        if (id === 'mahoraga') {
            const warn = document.createElement('div');
            warn.className = 'shadow-warn';
            warn.textContent = '⚠ Destrói quem a invocou';
            opt.appendChild(warn);
        }

        if (onChoose) {
            opt.addEventListener('click', () => {
                shadowModal.classList.remove('active');
                onChoose(id);
            });
        }
        shadowGrid.appendChild(opt);
    });
}

function openShadowSelectionModal(onChoose) {
    renderShadowGrid(onChoose);
    shadowModalHint.textContent = 'Escolha uma sombra para invocar';
    shadowModalClose.style.display = 'none';
    shadowModal.classList.add('active');
}

function openShadowBrowseModal() {
    renderShadowGrid(null);
    shadowModalHint.textContent = 'As 10 sombras que Megumi pode invocar';
    shadowModalClose.style.display = 'flex';
    shadowModal.classList.add('active');
}

function closeShadowModal() {
    shadowModal.classList.remove('active');
}

shadowModal.addEventListener('click', (e) => {
    if (e.target === shadowModal && shadowModalClose.style.display !== 'none') {
        closeShadowModal();
    }
});
 
cardModal.addEventListener('click', (e) => {
    if (e.target === cardModal) {
        closeCardModal();
    }
});
 
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (cardModal.classList.contains('active')) closeCardModal();
    if (settingsModal.classList.contains('active')) closeSettingsModal();
    if (shadowModal.classList.contains('active') && shadowModalClose.style.display !== 'none') closeShadowModal();
});
 
function makeManageCard(cardId, actionLabel, actionClass, action, locked) {
    const wrap = document.createElement('div');
    const inDeck = playerDeckTemplate.includes(cardId);
    const isUnlocked = isCardUnlocked(cardId);
    
    wrap.className = 'manage-card';
    if (locked || !isUnlocked) wrap.classList.add('locked');
    if (inDeck && isUnlocked) wrap.classList.add('in-deck');
    else if (!inDeck && isUnlocked) wrap.classList.add('available');
    
    const cardData = CARD_LIBRARY[cardId];
    const card = createOwnedCard(cardId, 1);
    const preview = renderCard(card, null, false);
    
    preview.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        expandAnyCard({
            img: cardData.img,
            t: cardData.t,
            r: cardData.r,
            b: cardData.b,
            l: cardData.l,
            original_t: cardData.t,
            original_r: cardData.r,
            original_b: cardData.b,
            original_l: cardData.l,
            name: getCardDisplayName(cardId),
            power: cardData.power,
            owner: 1,
            frozen: false,
            cardLevel: cardData.cardLevel || 1,
            hiddenStats: (cardData.t === '?' || cardData.r === '?' || cardData.b === '?' || cardData.l === '?'),
            isDomain: !!cardData.isDomain,
            refino: cardData.refino || 0
        });
    });
    
    const name = document.createElement('div');
    name.className = 'manage-card-name';
    name.textContent = getCardDisplayName(cardId);
    wrap.appendChild(preview);
    wrap.appendChild(name);
    
    if (locked || !isUnlocked) {
        const lockTag = document.createElement('div');
        lockTag.className = 'lock-tag';
        lockTag.textContent = `Nível ${CARD_LIBRARY[cardId].unlockLevel}`;
        wrap.appendChild(lockTag);
    } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `card-action-btn ${actionClass || ''}`;
        btn.textContent = actionLabel;
        btn.onclick = action;
        wrap.appendChild(btn);
    }
    return wrap;
}
function renderDeckScreen() {
    activeDeckList.innerHTML = '';
    collectionList.innerHTML = '';
    lockedList.innerHTML = '';
    
    const deckIds = new Set(playerDeckTemplate);
    const allIds = Object.keys(CARD_LIBRARY);
    const unlocked = allIds.filter(id => isCardUnlocked(id));
    const locked = allIds.filter(id => !isCardUnlocked(id));
    const inDeck = unlocked.filter(id => deckIds.has(id));
    const available = unlocked.filter(id => !deckIds.has(id));
 
    inDeckCount.textContent = inDeck.length;
    availableCount.textContent = available.length;
    lockedCount.textContent = locked.length;
    renderMenuStats();
 
    if (inDeck.length === 0) {
        activeDeckEmpty.style.display = 'block';
    } else {
        activeDeckEmpty.style.display = 'none';
        inDeck.forEach(cardId => {
            activeDeckList.appendChild(makeManageCard(cardId, 'Remover', 'remove', () => removeFromDeck(cardId), false));
        });
    }
 
    if (available.length === 0) {
        collectionEmpty.style.display = 'block';
    } else {
        collectionEmpty.style.display = 'none';
        available.forEach(cardId => {
            collectionList.appendChild(makeManageCard(cardId, 'Adicionar', 'add', () => addToDeck(cardId), false));
        });
    }
 
    if (locked.length === 0) {
        lockedEmpty.style.display = 'block';
    } else {
        lockedEmpty.style.display = 'none';
        locked.sort((a, b) => CARD_LIBRARY[a].unlockLevel - CARD_LIBRARY[b].unlockLevel).forEach(cardId => {
            lockedList.appendChild(makeManageCard(cardId, '', '', null, true));
        });
    }
 
    renderMenuStats();
}
function showDeckScreen() { renderDeckScreen(); showScreen('deck'); }

function showTutorialScreen() {
    renderTutorialVisuals();
    showScreen('tutorial');
}

function renderTutorialVisuals() {
    const charSlot = document.getElementById('tutorialCharCardSlot');
    const domainSlot = document.getElementById('tutorialDomainCardSlot');
    const boardSlot = document.getElementById('tutorialBoardPreview');
    if (!charSlot || charSlot.childElementCount > 0) return;

    charSlot.appendChild(renderCard(createOwnedCard('c1', 1), null, false));
    domainSlot.appendChild(renderCard(createOwnedCard('d2', 1), null, false));

    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'tutorial-cell' + (i === CENTER_CELL ? ' center-cell' : '');
        boardSlot.appendChild(cell);
    }
}
function addToDeck(cardId) { 
    const totalLevel = getDeckTotalLevel() + (CARD_LIBRARY[cardId].cardLevel || 1);
    if (totalLevel > MAX_DECK_LEVEL) { 
        showToast(`Nível do deck excederia ${MAX_DECK_LEVEL}! (Atual: ${getDeckTotalLevel()})`, 'gold'); 
        return; 
    } 
    if (!playerDeckTemplate.includes(cardId)) {
        playerDeckTemplate.push(cardId); 
        savePlayerProgress(); 
        renderDeckScreen();
        showToast(`✅ ${getCardDisplayName(cardId)} adicionada ao deck!`, 'p1');
    }
}
function removeFromDeck(cardId) { 
    playerDeckTemplate = playerDeckTemplate.filter(id => id !== cardId); 
    savePlayerProgress(); 
    renderDeckScreen();
    showToast(`🗑️ ${getCardDisplayName(cardId)} removida do deck.`, 'p2');
}
 
function renderLevelScreen() {
    levelGrid.innerHTML = '';
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
        const locked = level > highestUnlockedLevel;
        const completed = level < highestUnlockedLevel;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'level-btn' + (locked ? ' locked' : '') + (completed ? ' completed' : '');
        btn.innerHTML = `<span class="level-num">${locked ? '🔒' : level}</span><span class="level-tag">${completed ? 'Concluído' : (locked ? 'Bloqueado' : 'Nível ' + level)}</span>`;
        if (!locked) btn.onclick = () => selectLevel(level);
        levelGrid.appendChild(btn);
    }
}
function showLevelScreen() {
    if (playerDeckTemplate.length === 0) { showToast('Adicione ao menos 1 carta ao deck.', 'gold'); showDeckScreen(); return; }
    const characterCards = playerDeckTemplate.filter(id => !CARD_LIBRARY[id].isDomain);
    if (characterCards.length === 0) {
        showToast('Adicione ao menos 1 carta de personagem ao deck (domínios não contam).', 'gold');
        showDeckScreen();
        return;
    }
    renderLevelScreen();
    showScreen('levels');
}
function selectLevel(level) {
    currentLevel = level;
    resetGame();
    showScreen('game');
}
 
