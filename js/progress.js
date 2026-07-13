function createOwnedCard(cardId, owner) {
    const data = CARD_LIBRARY[cardId];
    if (!data) return null;
    const card = createCard(data.img, data.t, data.r, data.b, data.l, owner, data.power, CARD_NAMES[cardId], data.cardLevel, data.isDomain, data.refino);
    card.cardId = cardId;
    return card;
}
function isCardUnlocked(cardId) {
    const data = CARD_LIBRARY[cardId];
    return !!data && data.unlockLevel <= highestUnlockedLevel;
}
function initializePlayerProgress() {
    if (loadPlayerProgress()) {
        renderMenuStats();
        return;
    }
    playerDeckTemplate = STARTING_DECK.slice(0, MAX_DECK_SIZE);
    renderMenuStats();
    savePlayerProgress();
}
function getCardDisplayName(cardId) { return CARD_NAMES[cardId] || 'Carta'; }
