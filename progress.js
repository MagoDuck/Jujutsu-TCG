function createOwnedCard(cardId, owner) {
    const data = CARD_LIBRARY[cardId];
    if (!data) return null;
    const card = createCard(data.img, data.t, data.r, data.b, data.l, owner, data.power, getCardDisplayName(cardId), data.cardLevel, data.isDomain, data.refino);
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
function getCardDisplayName(cardId) {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.pt;
    if (dict.domainNames && dict.domainNames[cardId]) return dict.domainNames[cardId];
    if (TRANSLATIONS.pt.domainNames && TRANSLATIONS.pt.domainNames[cardId]) return TRANSLATIONS.pt.domainNames[cardId];
    return CARD_NAMES[cardId] || t('cardFallbackName');
}
