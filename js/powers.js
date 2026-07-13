// Recalcula continuamente os efeitos de auras/domínios contínuos: parte sempre da
// linha de base (base_*, que já inclui reduções permanentes como Erupção Vulcânica),
// reaplica Desmantelar (halving por adjacência a Sukuna) e, por cima, o Santuário
// Malevolente (halving no campo inteiro, se essa Expansão de Domínio estiver ativa),
// restaurando qualquer carta que deixou de estar sob esses efeitos.
function recalcAuras() {
    const before = boardState.map(c => c ? { t: c.t, r: c.r, b: c.b, l: c.l } : null);

    for (let i = 0; i < TOTAL_CELLS; i++) {
        const c = boardState[i];
        if (!c || c.frozen || c.isDomain) continue;
        c.t = c.base_t;
        c.r = c.base_r;
        c.b = c.base_b;
        c.l = c.base_l;
    }

    for (let i = 0; i < TOTAL_CELLS; i++) {
        const c = boardState[i];
        if (!c || c.power !== 'desmantelar') continue;
        getNeighborPositions(i).forEach(n => {
            const target = boardState[n];
            if (target && !target.frozen && !target.isDomain) halveAttributes(target);
        });
    }

    const domain = boardState[CENTER_CELL];
    if (domain && domain.isDomain && domain.power === 'santuario_malevolente') {
        for (let i = 0; i < TOTAL_CELLS; i++) {
            const c = boardState[i];
            if (!c || c.isDomain || c.frozen) continue;
            halveAttributes(c);
        }
    }

    for (let i = 0; i < TOTAL_CELLS; i++) {
        const c = boardState[i];
        const prev = before[i];
        if (!c) continue;
        if (!prev || prev.t !== c.t || prev.r !== c.r || prev.b !== c.b || prev.l !== c.l) {
            updateCardDisplay(i, c);
        }
    }
}

// Cartas de personagem cujos 4 atributos chegam a zero (por Desmantelar, Santuário
// Malevolente, Erupção Vulcânica etc.) são destruídas: saem do campo e ficam banidas
// pelo resto da partida. Domínios não têm atributos e nunca são afetados por isso.
function destroyZeroAttributeCards() {
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const c = boardState[i];
        if (!c || c.isDomain) continue;
        if (c.t === 0 && c.r === 0 && c.b === 0 && c.l === 0) {
            if (c.cardId) destroyedCardIds.add(c.cardId);
            boardState[i] = null;

            const cell = board.children[i];
            const cardEl = cell ? cell.querySelector('.card') : null;
            if (cardEl) {
                cardEl.classList.add('destroyed-zero');
                setTimeout(() => { cell.innerHTML = ''; }, 500);
            } else if (cell) {
                cell.innerHTML = '';
            }

            showToast(`💥 ${c.name} teve todos os atributos zerados e foi destruída!`, 'p2');
        }
    }
}

// Ponto único de entrada para resolver o poder de uma carta recém-colocada (ou copiada).
// Poderes interativos (boogie_woogie, dez_sombras) abrem uma UI e só chamam onDone
// quando o jogador decide; os demais resolvem na hora.
function resolveCardPower(pos, card, onDone) {
    executePower(pos, card, card.power, onDone);
}

function executePower(pos, card, powerType, onDone) {
    switch (powerType) {
        case 'jackpot':
            applyJackpotPower(pos, card);
            onDone();
            break;
        case 'infinito':
            applyInfinitoPower(pos, card);
            onDone();
            break;
        case 'desmantelar':
            spawnPowerRing(pos, 'desmantelar');
            showToast('👹 Desmantelar! Cartas ao lado têm os atributos reduzidos pela metade!', 'gold');
            onDone();
            break;
        case 'erupcao_vulcanica':
            applyErupcaoVulcanicaPower(pos, card);
            onDone();
            break;
        case 'transfiguracao_de_alma':
            applyTransfiguracaoDeAlmaPower(pos, card);
            onDone();
            break;
        case 'vazio_infinito':
            spawnPowerRing(pos, 'vazio_infinito');
            showToast('🕳️ Vazio Infinito expandido! Nenhuma carta pode mais mudar de lado!', 'gold');
            onDone();
            break;
        case 'santuario_malevolente':
            spawnPowerRing(pos, 'santuario_malevolente');
            showToast('🩸 Santuário Malevolente expandido! Todas as cartas em campo perdem metade dos atributos!', 'gold');
            onDone();
            break;
        case 'auto_personificacao':
            applyAutoPersonificacaoPower(pos, card);
            onDone();
            break;
        case 'mar_brilhante':
            applyMarBrilhantePower(pos, card);
            onDone();
            break;
        case 'boogie_woogie':
            triggerBoogieWoogie(pos, card, onDone);
            break;
        case 'copiar':
            applyCopiarPower(pos, card, onDone);
            break;
        case 'dez_sombras':
            triggerDezSombras(pos, card, onDone);
            break;
        default:
            onDone();
    }
}

function applyJackpotPower(pos, card) {
    spawnPowerRing(pos, 'jackpot');
    card.hiddenStats = false;
    const attrs = ['t', 'r', 'b', 'l'];
    attrs.forEach(attr => {
        card[attr] = Math.floor(Math.random() * 16);
    });
    // A rolagem vira a nova referência "de fábrica" da carta, tanto para a cor
    // (aumentou/diminuiu) quanto para a linha de base usada por recalcAuras().
    card.original_t = card.base_t = card.t;
    card.original_r = card.base_r = card.r;
    card.original_b = card.base_b = card.b;
    card.original_l = card.base_l = card.l;
    updateCardDisplay(pos, card);
    showToast('🎰 Jackpot! Atributos sorteados!', 'gold');
}

function triggerBoogieWoogie(pos, card, onDone) {
    spawnPowerRing(pos, 'boogie_woogie');
    // A casa central (e qualquer domínio nela) nunca é um alvo válido de troca.
    const targets = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i !== pos && i !== CENTER_CELL && boardState[i] !== null) targets.push(i);
    }

    if (targets.length === 0) {
        showToast('🔄 Nenhuma carta em campo para trocar!', 'p2');
        onDone();
        return;
    }

    const finish = (targetPos) => {
        if (targetPos !== null && targetPos !== undefined && boardState[targetPos]) {
            const temp = boardState[pos];
            boardState[pos] = boardState[targetPos];
            boardState[targetPos] = temp;

            updateCardDisplay(pos, boardState[pos]);
            updateCardDisplay(targetPos, boardState[targetPos]);

            [pos, targetPos].forEach(p => {
                const el = board.children[p].querySelector('.card');
                if (el) el.classList.add('just-placed');
            });

            showToast('🔄 Boogie Woogie! Cartas trocaram de posição!', 'gold');
        } else {
            showToast('🔄 Troca cancelada.', 'p2');
        }
        onDone();
    };

    if (card.owner === 1) {
        beginBoogieSelection(pos, targets, finish);
    } else {
        const enemyTargets = targets.filter(i => boardState[i].owner !== card.owner);
        const pool = enemyTargets.length ? enemyTargets : targets;
        finish(pool[Math.floor(Math.random() * pool.length)]);
    }
}

function beginBoogieSelection(pos, targets, resolve) {
    pendingSelection = { type: 'boogie', pos, targets, resolve };
    clearValidTargets();
    targets.forEach(i => board.children[i].classList.add('valid-target'));
    const hostCard = board.children[pos].querySelector('.card');
    if (hostCard) hostCard.classList.add('selected');
    showToast('🔄 Escolha uma carta para trocar (ou toque em Todo novamente para cancelar)', 'p1');
}

function applyCopiarPower(pos, card, onDone) {
    spawnPowerRing(pos, 'copiar');
    const candidates = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i !== pos && boardState[i] && boardState[i].power && boardState[i].power !== 'copiar') {
            candidates.push(boardState[i].power);
        }
    }
    if (candidates.length === 0) {
        showToast('📋 Nenhuma habilidade para copiar!', 'p2');
        onDone();
        return;
    }
    const copiedPower = candidates[Math.floor(Math.random() * candidates.length)];
    card.power = copiedPower;
    showToast(`📋 Cópia ativada! Poder copiado: ${POWER_SYMBOLS[copiedPower] || ''} ${copiedPower.replace(/_/g, ' ')}`, 'gold');
    executePower(pos, card, copiedPower, onDone);
}

function triggerDezSombras(pos, card, onDone) {
    spawnPowerRing(pos, 'dez_sombras');
    // Sombras não são domínios: nunca podem ser invocadas na casa central.
    const emptyCells = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (boardState[i] === null && i !== CENTER_CELL) emptyCells.push(i);
    }

    if (emptyCells.length === 0) {
        showToast('🌑 Sem espaço para invocar uma sombra!', 'p2');
        onDone();
        return;
    }

    const finish = (shadowId) => {
        const shadow = SHADOW_CARDS[shadowId];
        const summonPos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const shadowCard = createCard(shadow.img, shadow.t, shadow.r, shadow.b, shadow.l, card.owner, null, shadow.name, shadow.cardLevel);
        boardState[summonPos] = shadowCard;
        updateCardDisplay(summonPos, shadowCard);
        const cardEl = board.children[summonPos].querySelector('.card');
        if (cardEl) cardEl.classList.add('just-placed');
        showToast(`🌑 ${shadow.name} invocado(a) pela Técnica das Dez Sombras!`, card.owner === 1 ? 'p1' : 'p2');

        if (shadowId === 'mahoraga' && boardState[pos] === card) {
            boardState[pos] = null;
            const hostCell = board.children[pos];
            if (hostCell) hostCell.innerHTML = '';
            showToast(`💀 Mahoraga se adapta e destrói ${card.name}!`, 'p2');
        }
        onDone();
    };

    if (card.owner === 1) {
        openShadowSelectionModal(finish);
    } else {
        const ids = Object.keys(SHADOW_CARDS);
        finish(ids[Math.floor(Math.random() * ids.length)]);
    }
}

function applyInfinitoPower(pos, card) {
    spawnPowerRing(pos, 'infinito');
    showToast('♾️ Infinito ativado! Carta imune a capturas!', 'gold');
    // Marca a carta como imune (usando uma propriedade especial)
    card.invincible = true;
}

function applyErupcaoVulcanicaPower(pos, card) {
    spawnPowerRing(pos, 'erupcao_vulcanica');
    const attrs = ['t', 'r', 'b', 'l'];
    getNeighborPositions(pos).forEach(n => {
        const target = boardState[n];
        if (target && target.owner !== card.owner && !target.frozen) {
            const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
            const before = target[randomAttr];
            const reduced = Math.max(0, before - 2);
            const delta = before - reduced;
            const baseKey = 'base_' + randomAttr;
            // A redução é permanente: reduz o valor atual e também a linha de base,
            // mas preserva original_* intocado para o indicador vermelho continuar valendo.
            target[baseKey] = Math.max(0, (target[baseKey] !== undefined ? target[baseKey] : before) - delta);
            target[randomAttr] = reduced;
            updateCardDisplay(n, target);
            spawnFloatNumber(n, '-2 ' + randomAttr.toUpperCase(), false);
        }
    });
    showToast('🌋 Erupção Vulcânica! -2 em atributo aleatório!', 'gold');
}

// Troca de lugar os valores dos atributos de uma carta: cima<->baixo, esquerda<->direita.
// original_* e base_* trocam junto para a transformação ser permanente e continuar
// coerente com o indicador de cor e com recalcAuras(). Usado por Mahito e pela
// Auto-Personificação da Perfeição.
function swapTopBottomLeftRight(target) {
    ['t_b', 'l_r'].forEach(pair => {
        const [a, b] = pair.split('_');
        [k => k, k => 'original_' + k, k => 'base_' + k].forEach(keyOf => {
            const keyA = keyOf(a), keyB = keyOf(b);
            const tmp = target[keyA];
            target[keyA] = target[keyB];
            target[keyB] = tmp;
        });
    });
}

function applyTransfiguracaoDeAlmaPower(pos, card) {
    spawnPowerRing(pos, 'transfiguracao_de_alma');
    let affected = 0;
    getNeighborPositions(pos).forEach(n => {
        const target = boardState[n];
        if (target && !target.isDomain && target.owner !== card.owner && !target.frozen) {
            swapTopBottomLeftRight(target);
            updateCardDisplay(n, target);
            spawnFloatNumber(n, '🔄', true);
            affected++;
        }
    });
    showToast(affected > 0
        ? '🤚 Transfiguração de Alma! Atributos das cartas inimigas trocados de lugar!'
        : '🤚 Nenhuma carta inimiga adjacente para transfigurar!', affected > 0 ? 'gold' : 'p2');
}

function applyAutoPersonificacaoPower(pos, card) {
    spawnPowerRing(pos, 'auto_personificacao');
    let affected = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i === pos) continue;
        const target = boardState[i];
        if (target && !target.isDomain && !target.frozen) {
            swapTopBottomLeftRight(target);
            updateCardDisplay(i, target);
            spawnFloatNumber(i, '🔄', true);
            affected++;
        }
    }
    showToast(affected > 0
        ? '🎭 Auto-Personificação da Perfeição! Atributos de todas as cartas em campo trocados de lugar!'
        : '🎭 Nenhuma carta em campo para transfigurar!', affected > 0 ? 'gold' : 'p2');
}

function applyMarBrilhantePower(pos, card) {
    spawnPowerRing(pos, 'mar_brilhante');
    const attrs = ['t', 'r', 'b', 'l'];
    let affected = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i === pos) continue;
        const target = boardState[i];
        if (target && !target.isDomain && !target.frozen) {
            const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
            // O bônus é permanente: soma ao valor atual e à linha de base (mantendo
            // original_* intocado, igual à Erupção Vulcânica, para o indicador de cor).
            const baseKey = 'base_' + randomAttr;
            target[baseKey] = (target[baseKey] !== undefined ? target[baseKey] : target[randomAttr]) + 5;
            target[randomAttr] += 5;
            updateCardDisplay(i, target);
            spawnFloatNumber(i, '+5 ' + randomAttr.toUpperCase(), true);
            affected++;
        }
    }
    showToast(affected > 0
        ? 'Mar Brilhante de Galhos Crescentes! +5 em um atributo aleatório de cada carta em campo!'
        : 'Nenhuma carta em campo para fortalecer!', affected > 0 ? 'gold' : 'p2');
}

