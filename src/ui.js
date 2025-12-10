import { elements } from './dom.js';
import { translations, staticTexts } from './localization.js';

export function updateStaticTexts(currentLang, currentTheme, themes) {
    const t = staticTexts[currentLang];
    
    if (elements.homeStartBtn) elements.homeStartBtn.textContent = t.start;
    if (elements.langBtn) elements.langBtn.textContent = t.lang;
    if (elements.themeBtn) elements.themeBtn.textContent = t.theme(themes[currentTheme].label);
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
    
    // Attempts Display
    const attemptsDiv = document.getElementById('attempts-display') || createAttemptsDisplay();
    attemptsDiv.textContent = `ATTEMPTS: ${game.attempts} / ${game.maxAttempts}`;
    
    // Visual alert for rent
    if (game.cash < game.rent && game.round === game.maxRounds) {
        elements.rentDisplay.classList.add('animate-pulse', 'text-red-500');
    } else {
        elements.rentDisplay.classList.remove('animate-pulse', 'text-red-500');
        elements.rentDisplay.classList.add('text-red-500');
    }

    renderLogs(game);
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

function createAttemptsDisplay() {
    const div = document.createElement('div');
    div.id = 'attempts-display';
    div.className = 'text-xl font-mono text-green-400 flex flex-col';
    const label = document.createElement('span');
    label.className = 'text-xs text-green-700 uppercase tracking-wider';
    label.textContent = '[ ATTEMPTS ]';
    
    // Insert into stats panel
    const statsPanel = document.querySelector('.bg-black.border-2.border-green-500.p-4.grid.grid-cols-2');
    if (statsPanel) {
        const container = document.createElement('div');
        container.className = 'flex flex-col';
        container.appendChild(label);
        container.appendChild(div);
        statsPanel.appendChild(container);
    }
    return div;
}

export function updateMessage(game, currentLang) {
    if (!game.message) return;
    
    const { key, params } = game.message;
    let text = '';

    // Check for Spaghetti Code (Hide Min/Max)
    const hasSpaghetti = game.jokers.some(j => j.id === 'spaghetti_code');
    let displayParams = { ...params }; 
    
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

export function renderInventory(game, handlers) {
    // Jokers
    elements.jokersList.innerHTML = '';
    if (game.jokers.length === 0) {
        elements.jokersList.innerHTML = '<div class="text-green-800 text-sm italic">No active jokers</div>';
    } else {
        game.jokers.forEach((joker, index) => {
            const el = document.createElement('div');
            el.className = 'bg-black border border-green-700 p-2 flex justify-between items-center group hover:bg-green-900/20 transition-colors';
            el.innerHTML = `
                <div>
                    <div class="text-sm font-bold text-green-400">${joker.name}</div>
                    <div class="text-xs text-green-600">${joker.description}</div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs bg-green-900/30 px-1 text-green-500 border border-green-800">${joker.rarity}</span>
                    ${game.gameState === 'SHOP' ? `<button class="text-red-500 hover:text-red-400 text-xs font-bold px-1">[SELL]</button>` : ''}
                </div>
            `;
            // Bind click for sell
            const btn = el.querySelector('button');
            if (btn) btn.onclick = (e) => { e.stopPropagation(); handlers.handleSell('joker', index); };
            
            elements.jokersList.appendChild(el);
        });
    }

    // Scripts
    elements.scriptsList.innerHTML = '';
    if (game.scripts.length === 0) {
        elements.scriptsList.innerHTML = '<div class="col-span-2 text-green-800 text-sm italic">No scripts loaded</div>';
    } else {
        game.scripts.forEach((script, index) => {
            const el = document.createElement('div'); 
            el.className = 'bg-black border border-green-700 p-2 text-left transition-colors group relative overflow-hidden flex justify-between items-center hover:bg-green-900/20';
            
            const canUse = game.gameState === 'PLAYING';
            const opacityClass = canUse ? '' : 'opacity-50';

            el.innerHTML = `
                <div class="flex-1 cursor-pointer ${opacityClass}">
                    <div class="text-sm font-bold text-cyan-400 group-hover:text-cyan-300">> ${script.name}</div>
                    <div class="text-xs text-green-600 truncate">${script.description}</div>
                </div>
                ${game.gameState === 'SHOP' ? `<button class="text-red-500 hover:text-red-400 text-xs font-bold px-2 z-10">[SELL]</button>` : ''}
            `;
            
            // Bind click for use
            const useDiv = el.querySelector('div');
            useDiv.onclick = () => { if(canUse) handlers.useScript(index); };

            // Bind click for sell
            const sellBtn = el.querySelector('button');
            if (sellBtn) sellBtn.onclick = (e) => { e.stopPropagation(); handlers.handleSell('script', index); };

            elements.scriptsList.appendChild(el);
        });
    }
}

export function renderShop(game, handlers) {
    elements.shopItems.innerHTML = '';
    elements.rerollCostSpan.textContent = game.rerollCost;
    
    game.shopInventory.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-black border border-purple-700 p-4 flex flex-col gap-2 hover:border-purple-500 transition-colors shadow-[0_0_5px_rgba(168,85,247,0.1)]';
        
        const isAffordable = game.cash >= item.price;
        const typeColor = item.type === 'passive' ? 'text-green-400' : 'text-cyan-400';
        
        el.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold ${typeColor}">${item.name}</h4>
                <span class="text-xs bg-purple-900/20 px-2 py-1 border border-purple-800 text-purple-400">$${item.price}</span>
            </div>
            <p class="text-sm text-purple-300/70 flex-1 font-mono">${item.description}</p>
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
    for (let i = 0; i < 100; i++) {
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
        elements.startBtn.textContent = 'Restart Run';
        elements.gameInputDiv.classList.add('hidden');
        elements.nextBtn.classList.add('hidden');
    }
}
