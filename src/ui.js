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
    if (elements.lblNumpadKey) elements.lblNumpadKey.textContent = "NUMPAD SHORTCUT"; // TODO: Add to localization
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
        <div class="text-5xl font-bold ${colorClass} tracking-tighter drop-shadow-[0_0_5px_rgba(0,255,0,0.2)]">
            ${remaining}<span class="text-xl text-green-900">/${game.maxAttempts}</span>
        </div>
    `;
}

function renderLogs(game) {
    let logsDiv = document.getElementById('system-logs');
    if (!logsDiv) {
        logsDiv = document.createElement('div');
        logsDiv.id = 'system-logs';
        logsDiv.className = 'mt-2 w-full max-w-md mx-auto bg-black border border-green-900 p-2 text-xs text-green-600 max-h-32 overflow-y-auto hidden';
        
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
    else if (key === 'script_effect') elements.messageText.classList.add('text-cyan-400');
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
        ${price ? `<div class="text-yellow-500 text-right text-[10px]">Value: $${price}</div>` : ''}
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
            <p class="text-sm text-purple-300/70 flex-1">${getLoc(item.description, currentLang)}</p>
            <button class="w-full py-2 font-bold text-sm transition-colors border ${isAffordable ? 'bg-purple-900/20 hover:bg-purple-500 hover:text-black text-purple-400 border-purple-500' : 'bg-black text-green-900 border-green-900 cursor-not-allowed'}">
                [ BUY ]
            </button>
        `;
        
        el.querySelector('button').onclick = () => handlers.handleBuy(item.uniqueId);
        
        elements.shopItems.appendChild(el);
    });
}

export function renderTrading(game) {
    if (!elements.tradingScreen) return;
    const price = game.getTradingPrice();
    if (elements.tradingPrice) elements.tradingPrice.textContent = `$${price.toFixed(2)}`;
    const value = game.tradingHoldings * price;
    if (elements.tradingHoldings) elements.tradingHoldings.textContent = game.tradingHoldings.toFixed(3);
    if (elements.tradingHoldingsValue) elements.tradingHoldingsValue.textContent = `$${value.toFixed(2)}`;
    
    if (elements.tradingProfitPercent) {
        if (game.tradingInvested > 0 && game.tradingHoldings > 0) {
            const profit = value - game.tradingInvested;
            const percent = (profit / game.tradingInvested) * 100;
            const sign = percent >= 0 ? '+' : '';
            elements.tradingProfitPercent.textContent = `(${sign}${percent.toFixed(1)}%)`;
            
            elements.tradingProfitPercent.className = `text-xs font-bold ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`;
        } else {
            elements.tradingProfitPercent.textContent = '(0%)';
            elements.tradingProfitPercent.className = 'text-xs font-bold text-gray-500';
        }
    }

    if (elements.tradingCash) elements.tradingCash.textContent = `$${game.cash.toFixed(2)}`;

    // Disable buttons if limit reached
    const buyBtn = document.getElementById('trading-buy-btn');
    const sellBtn = document.getElementById('trading-sell-btn');
    if (buyBtn && sellBtn) {
        if (game.hasTradedThisRound) {
            buyBtn.disabled = true;
            sellBtn.disabled = true;
            buyBtn.classList.add('opacity-50', 'cursor-not-allowed');
            sellBtn.classList.add('opacity-50', 'cursor-not-allowed');
            buyBtn.title = "Limit reached for this round";
            sellBtn.title = "Limit reached for this round";
        } else {
            buyBtn.disabled = false;
            sellBtn.disabled = false;
            buyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            sellBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            buyBtn.title = "";
            sellBtn.title = "";
        }
    }

    if (elements.tradingChart) {
        const chart = elements.tradingChart;
        chart.innerHTML = '';
        if (game.tradingCandles.length === 0) {
            game.addTradingCandle();
        }

        const candles = game.tradingCandles;
        if (candles.length === 0) return;
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        const max = Math.max(...highs);
        const min = Math.min(...lows);
        const range = Math.max(1, max - min);

        const chartWidth = chart.clientWidth || 320;
        const chartHeight = chart.clientHeight || 256;
        const pad = 8;
        const areaH = Math.max(10, chartHeight - pad * 2);
        const candleWidth = Math.max(4, Math.min(18, Math.floor((chartWidth - pad * 2) / Math.max(1, candles.length))));
        const totalWidth = candleWidth * candles.length;
        const startX = Math.max(pad, chartWidth - totalWidth - pad);

        const scale = (v) => ((v - min) / range) * areaH;

        candles.forEach((c, idx) => {
            const bar = document.createElement('div');
            bar.className = 'absolute';
            if (idx === candles.length - 1) {
                bar.classList.add('candle-new');
            }
            const x = startX + idx * candleWidth;

            const highY = pad + areaH - scale(c.high);
            const lowY = pad + areaH - scale(c.low);
            const topBody = pad + areaH - scale(Math.max(c.open, c.close));
            const bottomBody = pad + areaH - scale(Math.min(c.open, c.close));

            const wick = document.createElement('div');
            wick.className = 'bg-cyan-600';
            wick.style.position = 'absolute';
            wick.style.left = `${Math.floor(candleWidth / 2)}px`;
            wick.style.top = `${highY}px`;
            wick.style.width = '2px';
            wick.style.height = `${Math.max(2, lowY - highY)}px`;

            const bullish = c.close >= c.open;
            const body = document.createElement('div');
            body.className = bullish ? 'bg-green-500' : 'bg-red-500';
            body.style.position = 'absolute';
            body.style.left = '0px';
            body.style.top = `${topBody}px`;
            body.style.width = `${Math.max(3, candleWidth - 2)}px`;
            body.style.height = `${Math.max(3, bottomBody - topBody)}px`;

            bar.style.left = `${x}px`;
            bar.style.width = `${candleWidth}px`;
            bar.style.height = `${chartHeight}px`;

            bar.appendChild(wick);
            bar.appendChild(body);
            chart.appendChild(bar);
        });
    }
}

export function renderAntivirus(game) {
    if (!elements.antivirusScreen) return;
    
    if (elements.antivirusTimer) elements.antivirusTimer.textContent = `${game.antivirusTimeLeft}s`;
    if (elements.antivirusScore) elements.antivirusScore.textContent = game.antivirusScore;
    
    if (game.antivirusActive) {
        elements.antivirusStartOverlay.classList.add('hidden');
    } else {
        elements.antivirusStartOverlay.classList.remove('hidden');
        // Reset button text if game over
        if (game.antivirusTimeLeft <= 0) {
            const earned = game.antivirusScore * 2;
            elements.antivirusStartBtn.innerHTML = `<div class="flex flex-col items-center gap-1"><span class="text-green-400 font-bold text-lg">SCAN COMPLETE: +$${earned}</span><span class="text-xs opacity-70">> RESTART_SYSTEM</span></div>`;
            elements.antivirusStartBtn.className = "px-8 py-2 bg-black/80 hover:bg-blue-900/30 text-blue-300 border border-blue-500/50 transition-all text-sm backdrop-blur-sm";
        } else {
            elements.antivirusStartBtn.textContent = '> INITIATE_CLEANUP';
            elements.antivirusStartBtn.className = "px-8 py-4 bg-blue-600 hover:bg-blue-500 text-black font-bold text-xl uppercase tracking-widest border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105";
        }
    }
}

export function spawnAntivirusTarget(game, onClick) {
    if (!elements.antivirusGameArea) return;
    
    const target = document.createElement('div');
    // Random position
    const area = elements.antivirusGameArea;
    const targetSize = 56; // Increased size (w-14)
    const maxX = area.clientWidth - targetSize; 
    const maxY = area.clientHeight - targetSize;
    
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    
    target.className = 'absolute w-14 h-14 bg-red-500 rounded-full border-2 border-red-300 cursor-pointer hover:bg-red-400 transition-transform active:scale-90 shadow-[0_0_10px_rgba(239,68,68,0.8)] flex items-center justify-center animate-in-slide';
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    
    // Icon inside removed
    
    target.onmousedown = (e) => {
        e.stopPropagation(); // Prevent bubbling
        onClick();
        
        // Floating text feedback
        const floatText = document.createElement('div');
        floatText.textContent = '+$2';
        floatText.className = 'absolute text-green-400 font-bold text-xl pointer-events-none animate-float-up z-20 drop-shadow-md';
        floatText.style.left = `${target.offsetLeft + 10}px`;
        floatText.style.top = `${target.offsetTop}px`;
        elements.antivirusGameArea.appendChild(floatText);
        
        setTimeout(() => floatText.remove(), 800);

        target.remove();
        
        // Spawn particle effect?
        // For now just remove
    };
    
    elements.antivirusGameArea.appendChild(target);
    
    // Auto remove after short time (Increased duration: 1s - 1.5s)
    setTimeout(() => {
        if (target.parentNode) target.remove();
    }, 1000 + Math.random() * 500);
}

export function updateHistory(game) {
    elements.historyWheel.innerHTML = '';
    const hideHints = game.currentArc && game.currentArc.id === 'ransomware';
    game.history.forEach((guess, index) => {
        const el = document.createElement('div');
        const reverseIndex = game.history.length - 1 - index;
        let opacity = Math.max(0.4, 1 - (reverseIndex * 0.15));
        
        let hint = '';
        let colorClass = 'text-green-700';
        
        if (game.mysteryNumber !== null) {
            let isLower = guess < game.mysteryNumber;
            let isHigher = guess > game.mysteryNumber;

            // System Overheat Penalty: Invert hints at max level
            if (game.systemOverheatLevel >= 100) {
                const temp = isLower;
                isLower = isHigher;
                isHigher = temp;
            }

            if (isLower) {
                hint = '↑ HIGHER';
                colorClass = 'text-green-500';
            } else if (isHigher) {
                hint = '↓ LOWER';
                colorClass = 'text-red-500';
            } else {
                hint = 'MATCH';
                colorClass = 'text-green-400 font-bold';
            }
        }

        if (hideHints) {
            hint = 'LOCKED';
            colorClass = 'text-red-500';
        }

        el.className = `flex justify-between items-center border-b border-green-900/30 p-2 w-full`;
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
    const totalRange = end - start + 1;
    
    // Always 100 cells
    const cellCount = 100;
    const step = totalRange / cellCount;

    for (let i = 0; i < cellCount; i++) {
        const el = document.createElement('div');
        
        // Calculate range for this cell
        const cellStart = Math.floor(start + (i * step));
        const cellEnd = Math.floor(start + ((i + 1) * step)) - 1;
        
        el.textContent = cellStart;
        el.className = 'text-[0.7rem] flex items-center justify-center h-8 transition-colors cursor-help overflow-hidden select-none';
        el.title = `${cellStart} - ${cellEnd}`;

        // Check validity
        // A cell is valid if its range overlaps with [game.min, game.max]
        const isValid = (cellStart <= game.max && cellEnd >= game.min);
        
        // Check if fully valid (optional, for color intensity)
        const isFullyValid = (cellStart >= game.min && cellEnd <= game.max);

        if (isValid) {
            el.classList.add('text-green-400', 'bg-green-900/20', 'font-bold', 'border', 'border-green-500/30');
            if (!isFullyValid) {
                 // Partial match style (edges of the valid range)
                 el.classList.remove('bg-green-900/20');
                 el.classList.add('bg-green-900/50');
            }
        } else {
            el.classList.add('text-green-900', 'opacity-20');
        }
        
        elements.numberGrid.appendChild(el);
    }
}

export function setupNumpadListeners(elements) {
    const keys = document.querySelectorAll('.numpad-key');
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const value = key.getAttribute('data-key');
            if (value === 'Enter') {
                // Trigger Enter key press on input or just submit
                // We can simulate a click on guessBtn or dispatch an event
                if (elements.guessBtn) elements.guessBtn.click();
                elements.numpadOverlay.classList.add('hidden');
            } else if (value === 'Backspace') {
                elements.guessInput.value = elements.guessInput.value.slice(0, -1);
            } else {
                elements.guessInput.value += value;
            }
            elements.guessInput.focus();
        });
    });
    
    // Close numpad when clicking outside the box
    if (elements.numpadOverlay) {
        elements.numpadOverlay.addEventListener('click', (e) => {
            if (e.target === elements.numpadOverlay) {
                elements.numpadOverlay.classList.add('hidden');
            }
        });
    }
}

export function updateScreenState(game) {
    elements.gameScreen.classList.add('hidden');
    elements.shopScreen.classList.add('hidden');
    if (elements.tradingScreen) elements.tradingScreen.classList.add('hidden');
    if (elements.antivirusScreen) elements.antivirusScreen.classList.add('hidden');
    const systemScreen = document.getElementById('system-screen');
    if (systemScreen) systemScreen.classList.add('hidden');
    elements.browserScreen.classList.add('hidden');

    if (game.gameState === 'SHOP') {
        elements.shopScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.remove('hidden');
    } else if (game.gameState === 'TRADING') {
        if (elements.tradingScreen) elements.tradingScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.add('hidden');
    } else if (game.gameState === 'ANTIVIRUS') {
        if (elements.antivirusScreen) elements.antivirusScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.add('hidden');
    } else if (game.gameState === 'SYSTEM_MONITOR') {
        const systemScreen = document.getElementById('system-screen');
        if (systemScreen) systemScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.add('hidden');
    } else if (game.gameState === 'BROWSER') {
        elements.browserScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.add('hidden');
    } else {
        elements.gameScreen.classList.remove('hidden');
        if (elements.leaveShopBtn) elements.leaveShopBtn.classList.add('hidden');
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

export function renderSystemMonitor(game) {
    const tempDisplay = document.getElementById('system-temp-display');
    const statusMsg = document.getElementById('system-status-msg');
    const calibrateBtn = document.getElementById('system-calibrate-btn');
    const systemScreen = document.getElementById('system-screen');

    // Overheat Effects
    if (systemScreen) {
        if (game.systemOverheatLevel > 80) {
             systemScreen.classList.add('animate-pulse');
        } else {
             systemScreen.classList.remove('animate-pulse');
        }
    }

    if (tempDisplay) {
        tempDisplay.textContent = `${Math.floor(game.systemOverheatLevel)}%`;
        if (game.systemOverheatLevel >= 80) {
            tempDisplay.classList.remove('text-orange-300');
            tempDisplay.classList.add('text-red-500', 'animate-pulse');
        } else {
            tempDisplay.classList.add('text-orange-300');
            tempDisplay.classList.remove('text-red-500', 'animate-pulse');
        }
    }

    let allAligned = true;

    game.systemSliders.forEach((val, i) => {
        const target = game.systemTargets[i];
        const sliderFill = document.getElementById(`slider-fill-${i}`);
        const sliderTarget = document.getElementById(`slider-target-${i}`);
        const sliderValue = document.getElementById(`slider-value-${i}`);
        const sliderContainer = document.getElementById(`slider-container-${i}`);

        if (sliderFill) sliderFill.style.height = `${val}%`;
        if (sliderTarget) sliderTarget.style.bottom = `${target}%`;
        if (sliderValue) sliderValue.textContent = Math.floor(val);

        // Check alignment (tolerance +/- 5)
        const diff = Math.abs(val - target);
        const isAligned = diff <= 5;
        
        if (!isAligned) allAligned = false;

        if (sliderFill) {
            if (isAligned) {
                sliderFill.classList.remove('bg-orange-500');
                sliderFill.classList.add('bg-green-500');
            } else {
                sliderFill.classList.add('bg-orange-500');
                sliderFill.classList.remove('bg-green-500');
            }
        }
        
        if (sliderValue) {
             if (isAligned) {
                sliderValue.classList.remove('text-orange-500');
                sliderValue.classList.add('text-green-500');
            } else {
                sliderValue.classList.add('text-orange-500');
                sliderValue.classList.remove('text-green-500');
            }
        }

        // Locked State Visuals
        if (game.systemCalibratedThisRound) {
            if (sliderContainer) sliderContainer.classList.add('opacity-50', 'cursor-not-allowed');
            if (sliderValue) sliderValue.classList.add('opacity-50');
        } else {
            if (sliderContainer) sliderContainer.classList.remove('opacity-50', 'cursor-not-allowed');
            if (sliderValue) sliderValue.classList.remove('opacity-50');
        }
    });

    if (statusMsg) {
        if (game.systemCalibratedThisRound) {
            statusMsg.textContent = "SYSTEM OPTIMIZED - STANDBY";
            statusMsg.classList.remove('text-orange-400', 'text-red-500');
            statusMsg.classList.add('text-green-400');
        } else if (game.systemOverheatLevel > 70 && Math.random() > 0.7) {
             // Glitch text
             const chars = "SYSTEM ERROR WARNING FAILURE 010101";
             statusMsg.textContent = chars.split('').sort(() => 0.5 - Math.random()).join('').substring(0, 20);
             statusMsg.classList.add('text-red-500');
        } else if (allAligned) {
            statusMsg.textContent = "SYSTEM STABLE - READY TO CALIBRATE";
            statusMsg.classList.remove('text-orange-400');
            statusMsg.classList.add('text-green-400');
        } else {
            statusMsg.textContent = "CALIBRATION REQUIRED";
            statusMsg.classList.add('text-orange-400');
            statusMsg.classList.remove('text-green-400');
        }
    }

    if (calibrateBtn) {
        if (game.systemCalibratedThisRound) {
            calibrateBtn.disabled = true;
            calibrateBtn.textContent = "OPTIMIZED";
            calibrateBtn.classList.remove('hover:bg-orange-500', 'hover:text-black', 'animate-pulse');
            calibrateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            calibrateBtn.disabled = !allAligned;
            calibrateBtn.textContent = "CONFIRM CALIBRATION";
            calibrateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            calibrateBtn.classList.add('hover:bg-orange-500', 'hover:text-black');
            
            if (allAligned) {
                calibrateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                calibrateBtn.classList.add('animate-pulse');
            } else {
                calibrateBtn.classList.add('opacity-50', 'cursor-not-allowed');
                calibrateBtn.classList.remove('animate-pulse');
            }
        }
    }
}
