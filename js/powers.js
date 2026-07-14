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

    const domain = boardState[CENTER_CELL];
    if (domain && domain.isDomain && domain.power === 'santuario_malevolente' && !domain.disabledPower) {
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

function logDestroyedCard(card) {
    if (!card || card.isDomain || !card.cardId) return;
    destroyedCardIds.add(card.cardId);
    destroyedCardsLog.push({
        cardId: card.cardId,
        img: card.img,
        name: card.name,
        t: card.original_t, r: card.original_r, b: card.original_b, l: card.original_l,
        owner: card.owner,
        cardLevel: card.cardLevel,
        power: card.power
    });
}

function releaseCordaNegraTarget(card) {
    if (!card || card.power !== 'corda_negra' || card.cordaNegraTargetPos === null || card.cordaNegraTargetPos === undefined) return;
    const target = boardState[card.cordaNegraTargetPos];
    if (target && target.cardId === card.cordaNegraTargetId) {
        target.disabledPower = false;
        updateCardDisplay(card.cordaNegraTargetPos, target);
    }
}

function destroyZeroAttributeCards() {
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const c = boardState[i];
        if (!c || c.isDomain) continue;
        if (c.t === 0 && c.r === 0 && c.b === 0 && c.l === 0) {
            logDestroyedCard(c);
            releaseCordaNegraTarget(c);
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
        case 'troca_de_corpos':
            triggerTrocaDeCorpos(pos, card, onDone);
            break;
        default:
            onDone();
    }
}

function resolvePostCapturePower(pos, card, captureCount, onDone) {
    if (boardState[pos] !== card) { onDone(); return; }
    switch (card.power) {
        case 'desmantelar':
            applyDesmantelarPower(pos, card);
            recalcAuras();
            destroyZeroAttributeCards();
            onDone();
            break;
        case 'determinacao':
            if (captureCount > 0) applyDeterminacaoPower(pos, card, captureCount);
            onDone();
            break;
        case 'corda_negra':
            triggerCordaNegra(pos, card, onDone);
            break;
        default:
            onDone();
    }
}

function applyJackpotPower(pos, card) {
    spawnPowerRing(pos, 'jackpot');
    card.hiddenStats = false;

    let cardsAlreadyOnBoard = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i === pos) continue;
        if (boardState[i] && !boardState[i].isDomain) cardsAlreadyOnBoard++;
    }
    const highChance = Math.max(0, 0.9 - 0.1 * cardsAlreadyOnBoard);

    const attrs = ['t', 'r', 'b', 'l'];
    attrs.forEach(attr => {
        card[attr] = Math.random() < highChance
            ? 10 + Math.floor(Math.random() * 6)  // valor alto: 10-15
            : Math.floor(Math.random() * 10);      // valor baixo: 0-9
    });
    card.original_t = card.base_t = card.t;
    card.original_r = card.base_r = card.r;
    card.original_b = card.base_b = card.b;
    card.original_l = card.base_l = card.l;
    updateCardDisplay(pos, card);
    showToast('🎰 Jackpot! Atributos sorteados!', 'gold');
}

function triggerBoogieWoogie(pos, card, onDone) {
    spawnPowerRing(pos, 'boogie_woogie');
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
        if (i !== pos && boardState[i] && boardState[i].power && !boardState[i].disabledPower
            && boardState[i].power !== 'copiar' && boardState[i].power !== 'corda_negra') {
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
        const shadowCard = createCard(shadow.img, shadow.t, shadow.r, shadow.b, shadow.l, card.owner, shadow.power || null, shadow.name, shadow.cardLevel);
        boardState[summonPos] = shadowCard;
        updateCardDisplay(summonPos, shadowCard);
        const cardEl = board.children[summonPos].querySelector('.card');
        if (cardEl) cardEl.classList.add('just-placed');
        showToast(`🌑 ${shadow.name} invocado(a) pela Técnica das Dez Sombras!`, card.owner === 1 ? 'p1' : 'p2');

        if (shadowId === 'mahoraga' && boardState[pos] === card) {
            logDestroyedCard(card);
            releaseCordaNegraTarget(card);
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
            target[baseKey] = Math.max(0, (target[baseKey] !== undefined ? target[baseKey] : before) - delta);
            target[randomAttr] = reduced;
            updateCardDisplay(n, target);
            spawnFloatNumber(n, '-2 ' + randomAttr.toUpperCase(), false);
        }
    });
    showToast('🌋 Erupção Vulcânica! -2 em atributo aleatório!', 'gold');
}

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

function applyDesmantelarPower(pos, card) {
    spawnPowerRing(pos, 'desmantelar');
    let affected = 0;
    getNeighborPositions(pos).forEach(n => {
        const target = boardState[n];
        if (target && !target.isDomain && !target.frozen) {
            halveAttributes(target);
            target.base_t = target.t;
            target.base_r = target.r;
            target.base_b = target.b;
            target.base_l = target.l;
            updateCardDisplay(n, target);
            spawnFloatNumber(n, '½', false);
            affected++;
        }
    });
    showToast(affected > 0
        ? '👹 Desmantelar! Cartas ao lado têm os atributos reduzidos pela metade!'
        : '👹 Nenhuma carta ao lado para desmantelar!', affected > 0 ? 'gold' : 'p2');
}

function applyDeterminacaoPower(pos, card, count) {
    const bonus = count * 2;
    ['t', 'r', 'b', 'l'].forEach(attr => {
        card['base_' + attr] += bonus;
        card[attr] += bonus;
    });
    spawnPowerRing(pos, 'determinacao');
    updateCardDisplay(pos, card);
    spawnFloatNumber(pos, '+' + bonus, true);
    showToast(`💪 Determinação! +${bonus} em todos os atributos!`, 'gold');
}

function triggerCordaNegra(pos, card, onDone) {
    const candidates = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i === pos) continue;
        const c = boardState[i];
        if (c && c.power && !c.disabledPower) candidates.push(i);
    }

    if (candidates.length === 0) {
        showToast('⛓️ Nenhuma carta com poder para anular!', 'p2');
        onDone();
        return;
    }

    const finish = (targetPos) => {
        if (targetPos !== null && targetPos !== undefined && boardState[targetPos]) {
            const target = boardState[targetPos];
            target.disabledPower = true;
            card.cordaNegraTargetId = target.cardId || null;
            card.cordaNegraTargetPos = targetPos;
            updateCardDisplay(targetPos, target);
            showToast(`⛓️ Corda Negra! O poder de ${target.name} foi anulado!`, 'gold');
        } else {
            showToast('⛓️ Corda Negra não foi usada.', 'p2');
        }
        onDone();
    };

    spawnPowerRing(pos, 'corda_negra');
    if (card.owner === 1) {
        beginCordaNegraSelection(pos, candidates, finish);
    } else {
        finish(candidates[Math.floor(Math.random() * candidates.length)]);
    }
}

function beginCordaNegraSelection(pos, targets, resolve) {
    pendingSelection = { type: 'cordaNegra', pos, targets, resolve };
    clearValidTargets();
    targets.forEach(i => board.children[i].classList.add('valid-target'));
    const hostCard = board.children[pos].querySelector('.card');
    if (hostCard) hostCard.classList.add('selected');
    showToast('⛓️ Escolha uma carta para anular o poder (ou toque em Miguel novamente para cancelar)', 'p1');
}

function triggerTrocaDeCorpos(pos, card, onDone) {
    if (destroyedCardsLog.length === 0) {
        onDone();
        return;
    }

    const proceed = (choiceIndex) => {
        if (choiceIndex === null || choiceIndex === undefined) {
            showToast('🔁 Troca de Corpos não foi usada.', 'p2');
            onDone();
            return;
        }
        const revived = destroyedCardsLog.splice(choiceIndex, 1)[0];
        if (!revived) { onDone(); return; }

        boardState[pos] = null;
        const cell = board.children[pos];
        if (cell) cell.innerHTML = '';

        const newCard = createCard(revived.img, revived.t, revived.r, revived.b, revived.l, revived.owner, revived.power, revived.name, revived.cardLevel);
        newCard.cardId = revived.cardId;
        boardState[pos] = newCard;
        updateCardDisplay(pos, newCard);
        const cardEl = board.children[pos].querySelector('.card');
        if (cardEl) cardEl.classList.add('just-placed');
        showToast(`🔁 Troca de Corpos! ${newCard.name} retornou ao campo!`, newCard.owner === 1 ? 'p1' : 'p2');
        onDone();
    };

    spawnPowerRing(pos, 'troca_de_corpos');
    if (card.owner === 1) {
        openTrocaDeCorposModal(destroyedCardsLog, proceed);
    } else {
        if (Math.random() < 0.5) {
            proceed(Math.floor(Math.random() * destroyedCardsLog.length));
        } else {
            onDone();
        }
    }
}

function applyBestaMiticaAmbarExplosion(pos, card) {
    getNeighborPositions(pos).forEach(n => {
        const target = boardState[n];
        if (target && !target.isDomain && !target.frozen && target.owner !== card.owner) {
            ['t', 'r', 'b', 'l'].forEach(attr => {
                const reduced = Math.max(0, target[attr] - 5);
                const delta = target[attr] - reduced;
                target['base_' + attr] = Math.max(0, target['base_' + attr] - delta);
                target[attr] = reduced;
            });
            updateCardDisplay(n, target);
            spawnFloatNumber(n, '-5', false);
        }
    });
    showToast(`🐴 ${card.name} se autodestrói! Cartas inimigas adjacentes perdem 5 pontos em todos os atributos!`, 'gold');
    logDestroyedCard(card);
    releaseCordaNegraTarget(card);
    boardState[pos] = null;
    const cell = board.children[pos];
    if (cell) cell.innerHTML = '';
}

function tickRoundBasedPowers() {
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const card = boardState[i];
        if (!card || card.isDomain || card.disabledPower) continue;

        if (card.power === 'adaptacao') {
            ['t', 'r', 'b', 'l'].forEach(attr => {
                card['base_' + attr] += 2;
                card[attr] += 2;
            });
            updateCardDisplay(i, card);
            spawnFloatNumber(i, '+2', true);
        } else if (card.power === 'besta_mitica_ambar') {
            card.roundsOnField = (card.roundsOnField || 0) + 1;
            if (card.roundsOnField >= 6) {
                applyBestaMiticaAmbarExplosion(i, card);
            }
        }
    }
}

