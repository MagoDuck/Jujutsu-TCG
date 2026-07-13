function resetGame() {
    boardState = Array(TOTAL_CELLS).fill(null);
    currentPlayer = 1;
    selectedCard = null;
    pendingSelection = null;
    usedDomainIds = new Set();
    destroyedCardIds = new Set();
    winnerBox.textContent = "";
    gameEnded = false;
    toastContainer.innerHTML = "";
    postMatchActions.style.display = 'none';
    closeWinnerOverlay();
    closeSettingsModal();
    closeShadowModal();
 
    playerDeck = playerDeckTemplate.map(id => createOwnedCard(id, 1)).filter(Boolean);
    opponentDeck = getAiDeckForLevel(currentLevel, 2);
 
    buildBoard();
    renderHands();
    updateScores();
    updateTurnBanner();
    renderMenuStats();
}
 
initializePlayerProgress();
resetGame();
showScreen('menu');
initInstallExperience();
registerServiceWorker();
