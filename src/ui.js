import { elements } from './dom.js';
import { translations, staticTexts } from './localization.js';

function getLoc(obj, lang) {
    if (typeof obj === 'string' || typeof obj === 'number') return obj;
    if (typeof obj === 'object' && obj !== null) {
        return obj[lang] || obj['en'] || '';
    }
    return '';
}

export function updateStaticTexts(currentLang, currentTheme, themes) {
    const t = staticTexts[currentLang];
    
    if (elements.homeStartBtn) elements.homeStartBtn.textContent = t.start;
    if (elements.settingsBtn) elements.settingsBtn.textContent = t.settings;
    
    if (elements.lblLang) elements.lblLang.textContent = t.lang;
    if (elements.lblTheme) elements.lblTheme.textContent = t.theme;
    if (elements.lblGridKey) elements.lblGridKey.textContent = t.gridKey;
    if (elements.settingsBackBtn) elements.settingsBackBtn.textContent = t.return;

    if (elements.settingLangBtn) elements.settingLangBtn.textContent = currentLang.toUpperCase();
    if (elements.settingThemeBtn) elements.settingThemeBtn.textContent = themes[currentTheme].label;

    if (elements.resumeBtn) elements.resumeBtn.textContent = t.resume;
    if (elements.quitBtn) elements.quitBtn.textContent = t.quit;
    
    const pauseTitle = elements.pauseOverlay.querySelector('h2');
    if (pauseTitle) pauseTitle.textContent = t.paused;
    
    if (elements.guessBtn) elements.guessBtn.textContent = t.enter;
    if (elements.leaveShopBtn) elements.leaveShopBtn.textContent = t.exitShop;
    if (elements.nextBtn) elements.nextBtn.textContent = t.continue;
}

export function updateStats(game) {
    elements.cashDisplay.textContent = `$${game.cash}`;
    elements.rentDisplay.textContent = `$${game.rent}`;
    elements.levelDisplay.textContent = game.level;
    elements.roundDisplay.textContent = `${game.round}/${game.maxRounds}`;
    
    // Visual alert for rent
    if (game.cash < game.rent && game.round === game.maxRounds) {
        elements.rentDisplay.classList.add('animate-pulse', 'text-red-500');
    } else {
        elements.rentDisplay.classList.remove('animate-pulse', 'text-red-500');
        elements.rentDisplay.classList.add('text-red-500');
    }

    renderAttempts(game);
    renderLogs(game);
}

function renderAttempts(game) {
    let attemptsContainer = document.getElementById('large-attempts-display');
    if (!attemptsContainer) {
        attemptsContainer = document.createElement('div');
        attemptsContainer.id = 'large-attempts-display';
        attemptsContainer.className = 'text-center mb-2 py-2 border-b border-green-900/30';
        
        // Insert before message area
        const messageArea = elements.messageArea || document.getElementById('message-area');
        if (messageArea) {
            messageArea.parentNode.insertBefore(attemptsContainer, messageArea);
        }
    }

    const remaining = game.maxAttempts - game.attempts;
    // Color logic for urgency
    let colorClass = 'text-green-500';
    if (remaining <= 2) colorClass = 'text-red-500 animate-pulse';
    else if (remaining <= 4) colorClass = 'text-yellow-500';

    attemptsContainer.innerHTML = `
        <div class="text-[10px] text-green-800 uppercase tracking-[0.3em] mb-1">SYSTEM INTEGRITY</div>
        <div class="text-5xl font-bold ${colorClass} font-mono tracking-tighter drop-shadow-[0_0_5px_rgba(0,255,0,0.2)]">
            ${remaining}<span class="text-xl text-green-900">/${game.maxAttempts}</span>
        </div>
    `;
}

function renderLogs(game) {
    let logsDiv = document.getElementById('system-logs');
    if (!logsDiv) {
        logsDiv = document.createElement('div');
        logsDiv.id = 'system-logs';
        logsDiv.className = 'mt-2 w-full max-w-md mx-auto bg-black border border-green-900 p-2 font-mono text-xs text-green-600 max-h-32 overflow-y-auto hidden';
        
        // Insert after message area
        const messageArea = elements.messageArea || document.getElementById('message-area'); // Fallback if not in dom.js yet
        if (messageArea) {
            messageArea.parentNode.insertBefore(logsDiv, messageArea.nextSibling);
        }
    }
    
    if (!game.roundLogs || game.roundLogs.length === 0) {
        logsDiv.classList.add('hidden');
    } else {
        logsDiv.classList.remove('hidden');
        logsDiv.innerHTML = '<div class="text-green-500 text-[10px] uppercase tracking-widest mb-1 border-b border-green-900 pb-1">System Logs</div>' + 
            game.roundLogs.map(log => `<div class="mb-1 last:mb-0">> ${log}</div>`).join('');
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
}



export function updateMessage(game, currentLang) {
    if (!game.message) return;
    
    const { key, params } = game.message;
    let text = '';

    // Check for Spaghetti Code (Hide Min/Max)
    const hasSpaghetti = game.jokers.some(j => j.id === 'spaghetti_code');
    let displayParams = { ...params }; 
    
    // Resolve localized params
    if (displayParams) {
        Object.keys(displayParams).forEach(k => {
            displayParams[k] = getLoc(displayParams[k], currentLang);
        });
    }
    
    if (hasSpaghetti && (key.includes('higher') || key.includes('lower'))) {
        displayParams.min = '???';
        displayParams.max = '???';
    }
    
    const messages = translations[currentLang] || translations.en;
    const msgEntry = messages[key];
    
    if (typeof msgEntry === 'function') {
        text = msgEntry(displayParams);
    } else {
        text = msgEntry || key;
    }

    elements.messageText.textContent = text;
    
    // Color coding
    elements.messageText.className = 'text-xl font-medium transition-colors duration-300 ';
    if (key.includes('won')) elements.messageText.classList.add('text-green-400');
    else if (key.includes('lost') || key.includes('game_over')) elements.messageText.classList.add('text-red-500');
    else if (key.includes('burning')) elements.messageText.classList.add('text-orange-500', 'font-bold', 'animate-pulse');
    else if (key.includes('boss')) elements.messageText.classList.add('text-purple-500', 'font-bold');
    else if (key === 'script_effect') elements.messageText.classList.add('text-cyan-400', 'font-mono');
    else elements.messageText.classList.add('text-green-400');
}

// --- TOOLTIP SYSTEM ---
function createTooltip() {
    let tooltip = document.getElementById('custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.className = 'fixed z-50 hidden bg-black border border-green-500 p-2 text-xs max-w-xs pointer-events-none shadow-lg';
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

function showTooltip(e, title, desc, rarity, price) {
    const tooltip = createTooltip();
    tooltip.innerHTML = `
        <div class="font-bold text-green-400 mb-1 border-b border-green-800 pb-1 flex justify-between items-center gap-4">
            <span>${title}</span>
            ${rarity ? `<span class="text-[10px] uppercase text-green-600 border border-green-900 px-1">${rarity}</span>` : ''}
        </div>
        <div class="text-green-300 mb-1">${desc}</div>
        ${price ? `<div class="text-yellow-500 font-mono text-right text-[10px]">Value: $${price}</div>` : ''}
    `;
    tooltip.classList.remove('hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip && !tooltip.classList.contains('hidden')) {
        const x = e.clientX + 15;
        const y = e.clientY + 15;
        
        // Basic boundary check to prevent overflow
        const rect = tooltip.getBoundingClientRect();
        let finalX = x;
        let finalY = y;
        
        if (x + rect.width > window.innerWidth) finalX = e.clientX - rect.width - 10;
        if (y + rect.height > window.innerHeight) finalY = e.clientY - rect.height - 10;

        tooltip.style.left = `${finalX}px`;
        tooltip.style.top = `${finalY}px`;
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}

export function renderInventory(game, handlers, currentLang) {
    // Ensure lists are grids
    elements.jokersList.className = 'grid grid-cols-5 gap-2 p-2 content-start'; 
    elements.scriptsList.className = 'grid grid-cols-5 gap-2 p-2 content-start';

    // Jokers
    elements.jokersList.innerHTML = '';
    if (game.jokers.length === 0) {
        elements.jokersList.innerHTML = '<div class="col-span-5 text-green-800 text-sm italic text-center py-4">Empty Slot</div>';
    } else {
        game.jokers.forEach((joker, index) => {
            const el = document.createElement('div');
            el.className = 'aspect-square bg-black border border-green-700 flex items-center justify-center text-2xl cursor-help hover:bg-green-900/40 hover:border-green-400 transition-all relative group select-none';
            el.textContent = joker.icon || '🃏';
            
            // Tooltip events
            el.onmouseenter = (e) => showTooltip(e, getLoc(joker.name, currentLang), getLoc(joker.description, currentLang), joker.rarity, joker.price);
            el.onmousemove = moveTooltip;
            el.onmouseleave = hideTooltip;

            // Sell interaction
            if (game.gameState === 'SHOP') {
                el.classList.add('cursor-pointer', 'hover:border-red-500');
                el.onclick = (e) => { 
                    e.stopPropagation(); 
                    handlers.handleSell('joker', index); 
                    hideTooltip();
                };
                const sellInd = document.createElement('div');
                sellInd.className = 'absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100';
                el.appendChild(sellInd);
            }

            elements.jokersList.appendChild(el);
        });
    }

    // Scripts
    elements.scriptsList.innerHTML = '';
    if (game.scripts.length === 0) {
        elements.scriptsList.innerHTML = '<div class="col-span-5 text-green-800 text-sm italic text-center py-4">No Scripts</div>';
    } else {
        game.scripts.forEach((script, index) => {
            const canUse = game.gameState === 'PLAYING';
            const el = document.createElement('div'); 
            el.className = `aspect-square bg-black border border-cyan-900 flex items-center justify-center text-2xl transition-all relative group select-none ${canUse ? 'cursor-pointer hover:bg-cyan-900/40 hover:border-cyan-400' : 'opacity-50 cursor-not-allowed'}`;
            el.textContent = script.icon || '📜';

            // Tooltip
            el.onmouseenter = (e) => showTooltip(e, getLoc(script.name, currentLang), getLoc(script.description, currentLang), 'CONSUMABLE', script.price);
            el.onmousemove = moveTooltip;
            el.onmouseleave = hideTooltip;
            
            if (canUse) {
                el.onclick = () => { 
                    handlers.useScript(index); 
                    hideTooltip();
                };
            }

            if (game.gameState === 'SHOP') {
                el.classList.add('hover:border-red-500');
                el.onclick = (e) => { 
                    e.stopPropagation(); 
                    handlers.handleSell('script', index); 
                    hideTooltip();
                };
                const sellInd = document.createElement('div');
                sellInd.className = 'absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100';
                el.appendChild(sellInd);
            }

            elements.scriptsList.appendChild(el);
        });
    }
}

export function renderShop(game, handlers, currentLang) {
    elements.shopItems.innerHTML = '';
    elements.rerollCostSpan.textContent = game.rerollCost;
    
    game.shopInventory.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-black border border-purple-700 p-4 flex flex-col gap-2 hover:border-purple-500 transition-colors shadow-[0_0_5px_rgba(168,85,247,0.1)]';
        
        const isAffordable = game.cash >= item.price;
        const typeColor = item.type === 'passive' ? 'text-green-400' : 'text-cyan-400';
        
        el.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold ${typeColor}">${getLoc(item.name, currentLang)}</h4>
                <span class="text-xs bg-purple-900/20 px-2 py-1 border border-purple-800 text-purple-400">$${item.price}</span>
            </div>
            <p class="text-sm text-purple-300/70 flex-1 font-mono">${getLoc(item.description, currentLang)}</p>
            <button class="w-full py-2 font-bold text-sm transition-colors border ${isAffordable ? 'bg-purple-900/20 hover:bg-purple-500 hover:text-black text-purple-400 border-purple-500' : 'bg-black text-green-900 border-green-900 cursor-not-allowed'}">
                [ BUY ]
            </button>
        `;
        
        el.querySelector('button').onclick = () => handlers.handleBuy(item.uniqueId);
        
        elements.shopItems.appendChild(el);
    });
}

export function updateHistory(game) {
    elements.historyWheel.innerHTML = '';
    game.history.forEach((guess, index) => {
        const el = document.createElement('div');
        const reverseIndex = game.history.length - 1 - index;
        let opacity = Math.max(0.4, 1 - (reverseIndex * 0.15));
        
        let hint = '';
        let colorClass = 'text-green-700';
        
        if (game.mysteryNumber !== null) {
            if (guess < game.mysteryNumber) {
                hint = '↑ HIGHER';
                colorClass = 'text-green-500';
            } else if (guess > game.mysteryNumber) {
                hint = '↓ LOWER';
                colorClass = 'text-red-500';
            } else {
                hint = 'MATCH';
                colorClass = 'text-green-400 font-bold';
            }
        }

        el.className = `flex justify-between items-center border-b border-green-900/30 p-2 w-full font-mono`;
        el.style.opacity = opacity;
        
        el.innerHTML = `
            <span class="text-green-300">#${index + 1}: ${guess}</span>
            <span class="text-xs font-bold ${colorClass}">${hint}</span>
        `;
        elements.historyWheel.prepend(el); 
    });
}

export function updateGrid(game) {
    elements.numberGrid.innerHTML = '';
    
    const start = game.absoluteMin !== undefined ? game.absoluteMin : 0;
    const end = game.absoluteMax !== undefined ? game.absoluteMax : 99;

    for (let i = start; i <= end; i++) {
        const el = document.createElement('div');
        el.textContent = i;
        el.className = 'text-[0.6rem] font-mono flex items-center justify-center h-6 transition-colors ';
        
        let isValid = true;
        if (i < game.min || i > game.max) isValid = false;
        
        if (isValid) {
            el.classList.add('text-green-400', 'bg-green-900/20', 'font-bold', 'border', 'border-green-500/30');
        } else {
            el.classList.add('text-green-900', 'opacity-20');
        }
        elements.numberGrid.appendChild(el);
    }
}

export function updateScreenState(game) {
    elements.gameScreen.classList.add('hidden');
    elements.shopScreen.classList.add('hidden');
    elements.browserScreen.classList.add('hidden');

    if (game.gameState === 'SHOP') {
        elements.shopScreen.classList.remove('hidden');
    } else if (game.gameState === 'BROWSER') {
        elements.browserScreen.classList.remove('hidden');
    } else {
        elements.gameScreen.classList.remove('hidden');
    }

    // Toggle Controls
    if (game.gameState === 'IDLE') {
        elements.startBtn.classList.remove('hidden');
        elements.gameInputDiv.classList.add('hidden');
        elements.nextBtn.classList.add('hidden');
    } else if (game.gameState === 'PLAYING') {
        elements.startBtn.classList.add('hidden');
        elements.gameInputDiv.classList.remove('hidden');
        elements.nextBtn.classList.add('hidden');
        elements.guessInput.focus();
    } else if (game.gameState === 'WON' || game.gameState === 'LOST_ROUND') {
        elements.startBtn.classList.add('hidden');
        elements.gameInputDiv.classList.add('hidden');
        elements.nextBtn.classList.remove('hidden');
        elements.nextBtn.textContent = '> ACCESS_BROWSER';
    } else if (game.gameState === 'GAME_OVER') {
        elements.startBtn.classList.remove('hidden');
        elements.startBtn.textContent = '> CONTINUE';
        elements.gameInputDiv.classList.add('hidden');
        elements.nextBtn.classList.add('hidden');
    }
}
