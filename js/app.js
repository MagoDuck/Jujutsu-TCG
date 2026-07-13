document.getElementById("restartBtn").onclick = () => { closeSettingsModal(); resetGame(); };
document.getElementById("playBtn").onclick = () => showLevelScreen();
document.getElementById("deckBtn").onclick = () => showDeckScreen();
document.getElementById("deckBackBtn").onclick = () => showScreen("menu");
document.getElementById("levelBackBtn").onclick = () => showScreen("menu");
document.getElementById("tutorialBtn").onclick = () => showTutorialScreen();
document.getElementById("tutorialBackBtn").onclick = () => showScreen("menu");
document.getElementById("gameMenuBtn").onclick = () => { closeSettingsModal(); showScreen("menu"); };
document.getElementById("backToLevelsBtn").onclick = () => { closeWinnerOverlay(); showLevelScreen(); };
 
settingsBtn.onclick = () => settingsModal.classList.add('active');
function closeSettingsModal(){ settingsModal.classList.remove('active'); }
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
});
 
function closeWinnerOverlay(){ winnerOverlay.classList.remove('active'); }
 
function savePlayerProgress() {
    try {
        const payload = { playerDeckTemplate, highestUnlockedLevel };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn("Nao foi possivel salvar o progresso localmente.", error);
    }
}
 
function loadPlayerProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
 
        const parsed = JSON.parse(raw);
 
        highestUnlockedLevel = typeof parsed.highestUnlockedLevel === "number"
            ? Math.min(Math.max(parsed.highestUnlockedLevel, 1), TOTAL_LEVELS)
            : 1;
 
        const unlockedIds = new Set(Object.keys(CARD_LIBRARY).filter(id => CARD_LIBRARY[id].unlockLevel <= highestUnlockedLevel));
        playerDeckTemplate = Array.isArray(parsed.playerDeckTemplate)
            ? parsed.playerDeckTemplate.filter(id => unlockedIds.has(id))
            : [];
 
        return true;
    } catch (error) {
        console.warn("Nao foi possivel carregar o progresso salvo.", error);
        return false;
    }
}
 
function getDeckTotalLevel() {
    let total = 0;
    playerDeckTemplate.forEach(id => {
        if (CARD_LIBRARY[id]) total += CARD_LIBRARY[id].cardLevel || 1;
    });
    return total;
}
 
function updateInstallStatus(message = "") {
    installStatus.textContent = message;
}
 
function initInstallExperience() {
    const runningStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (runningStandalone) {
        updateInstallStatus("App em modo instalado.");
    }
 
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        installBtn.classList.remove("hidden");
        updateInstallStatus("Instalação disponível neste navegador.");
    });
 
    installBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;
 
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") {
            updateInstallStatus("Instalação iniciada.");
        } else {
            updateInstallStatus("Instalação cancelada.");
        }
 
        deferredInstallPrompt = null;
        installBtn.classList.add("hidden");
    });
 
    window.addEventListener("appinstalled", () => {
        deferredInstallPrompt = null;
        installBtn.classList.add("hidden");
        updateInstallStatus("App instalado com sucesso.");
    });
}
 
async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloadedForUpdate) return;
        reloadedForUpdate = true;
        showToast("🔄 Atualizando para a nova versão...", "gold");
        setTimeout(() => window.location.reload(), 600);
    });

    try {
        const registration = await navigator.serviceWorker.register("./sw.js");

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") registration.update();
        });
        window.addEventListener("focus", () => registration.update());
    } catch (error) {
        console.warn("Falha ao registrar o service worker.", error);
    }
}
 
function showToast(text, cls) {
    const t = document.createElement("div");
    t.className = "toast" + (cls ? " " + cls : "");
    t.textContent = text;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 1900);
}
 
function updateTurnBanner(thinking) {
    turnBanner.classList.remove("p1-turn", "p2-turn", "thinking");
    if (currentPlayer === 1) {
        turnBanner.classList.add("p1-turn");
        turnBannerText.textContent = "Sua vez";
    } else {
        turnBanner.classList.add("p2-turn");
        turnBannerText.textContent = "Vez do Oponente";
    }
    if (thinking) turnBanner.classList.add("thinking");
 
    handSection1.classList.toggle("inactive", currentPlayer !== 1);
    handSection2.classList.toggle("inactive", currentPlayer !== 2);
    waitingTag.style.display = (currentPlayer === 2) ? "inline-block" : "none";
}
 
