import './style.css'
import { Game } from './game.js'

const game = new Game();

// DOM Elements
const cashDisplay = document.getElementById('cash-display');
const rentDisplay = document.getElementById('rent-display');
const levelDisplay = document.getElementById('level-display');
const roundDisplay = document.getElementById('round-display');

const jokersList = document.getElementById('jokers-list');
const scriptsList = document.getElementById('scripts-list');

const gameScreen = document.getElementById('game-screen');
const shopScreen = document.getElementById('shop-screen');
const shopItems = document.getElementById('shop-items');
const rerollBtn = document.getElementById('reroll-btn');
const rerollCostSpan = document.getElementById('reroll-cost');
const leaveShopBtn = document.getElementById('leave-shop-btn');

const messageText = document.getElementById('message-text');
const historyWheel = document.getElementById('history-wheel');
const startBtn = document.getElementById('start-btn');
const gameInputDiv = document.getElementById('game-input');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const nextBtn = document.getElementById('next-btn');

const helpBtn = document.getElementById('help-btn');
const gridOverlay = document.getElementById('grid-overlay');
const numberGrid = document.getElementById('number-grid');

// --- UI UPDATES ---

function updateStats() {
    cashDisplay.textContent = `$${game.cash}`;
    rentDisplay.textContent = `$${game.rent}`;
    levelDisplay.textContent = game.level;
    roundDisplay.textContent = `${game.round}/${game.maxRounds}`;
    
    // Attempts Display (New)
    const attemptsDiv = document.getElementById('attempts-display') || createAttemptsDisplay();
    attemptsDiv.textContent = `Attempts: ${game.attempts} / ${game.maxAttempts}`;
    
    // Visual alert for rent
    if (game.cash < game.rent && game.round === game.maxRounds) {
        rentDisplay.classList.add('animate-pulse', 'text-red-500');
    } else {
        rentDisplay.classList.remove('animate-pulse', 'text-red-500');
        rentDisplay.classList.add('text-red-400');
    }

    renderLogs();
}

function renderLogs() {
    let logsDiv = document.getElementById('system-logs');
    if (!logsDiv) {
        logsDiv = document.createElement('div');
        logsDiv.id = 'system-logs';
        logsDiv.className = 'mt-2 w-full max-w-md mx-auto bg-black/40 rounded border border-zinc-800 p-2 font-mono text-xs text-zinc-400 max-h-32 overflow-y-auto hidden';
        
        // Insert after message area
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.parentNode.insertBefore(logsDiv, messageArea.nextSibling);
        }
    }
    
    if (!game.roundLogs || game.roundLogs.length === 0) {
        logsDiv.classList.add('hidden');
    } else {
        logsDiv.classList.remove('hidden');
        logsDiv.innerHTML = '<div class="text-emerald-500/50 text-[10px] uppercase tracking-widest mb-1 border-b border-zinc-800 pb-1">System Logs</div>' + 
            game.roundLogs.map(log => `<div class="mb-1 last:mb-0">> ${log}</div>`).join('');
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
}

function createAttemptsDisplay() {
    const div = document.createElement('div');
    div.id = 'attempts-display';
    div.className = 'text-xl font-mono text-zinc-300 flex flex-col';
    const label = document.createElement('span');
    label.className = 'text-xs text-zinc-500 uppercase tracking-wider';
    label.textContent = 'Attempts';
    
    // Insert into stats panel
    const statsPanel = document.querySelector('.bg-zinc-900.border.border-zinc-800.rounded-xl.p-4.grid.grid-cols-2');
    if (statsPanel) {
        const container = document.createElement('div');
        container.className = 'flex flex-col';
        container.appendChild(label);
        container.appendChild(div);
        statsPanel.appendChild(container);
    }
    return div;
}

function updateMessage() {
    if (!game.message) return;
    
    const { key, params } = game.message;
    let text = '';

    // Check for Spaghetti Code (Hide Min/Max)
    const hasSpaghetti = game.jokers.some(j => j.id === 'spaghetti_code');
    let displayParams = { ...params }; // Copy params to avoid mutating original if needed
    
    if (hasSpaghetti && (key.includes('higher') || key.includes('lower'))) {
        displayParams.min = '???';
        displayParams.max = '???';
    }
    
    // Simple localization map (can be expanded later)
    const messages = {
        'welcome_hustle': 'Welcome to the Binary Hustle. Crack the code.',
        'run_start': `MISSION: Find the code (0-99) in ${displayParams?.maxAttempts} attempts. Rent Due: $${displayParams?.rent}.`,
        'round_start': `Level ${displayParams?.level} - Round ${displayParams?.round}. Rent Due: $${displayParams?.rent}`,
        'boss_round': `BOSS DETECTED: ${displayParams?.name}. ${displayParams?.desc}`,
        'invalid_guess': 'Invalid input. Enter 0-99.',
        'won_round': `Access Granted! Gain: $${displayParams?.gain}. Total: $${displayParams?.cash}`,
        'lost_round': `Access Denied. The code was ${displayParams?.number}.`,
        'higher': `🔼 HIGHER. Range: [${displayParams?.min} - ${displayParams?.max}]`,
        'lower': `🔽 LOWER. Range: [${displayParams?.min} - ${displayParams?.max}]`,
        'higher_burning': `🔥 BURNING! Range: [${displayParams?.min} - ${displayParams?.max}]`,
        'lower_burning': `🔥 BURNING! Range: [${displayParams?.min} - ${displayParams?.max}]`,
        'shop_welcome': 'Welcome to the Dark Web Market.',
        'game_over_rent': `Evicted! Cash: $${displayParams?.cash} < Rent: $${displayParams?.rent}`,
        'item_bought': 'Item acquired.',
        'insufficient_funds': 'Insufficient funds.',
        'inventory_full': 'Inventory full.',
        'script_effect': `> ${displayParams?.text}`
    };
    
    text = messages[key] || key;
    messageText.textContent = text;
    
    // Color coding
    messageText.className = 'text-xl font-medium transition-colors duration-300 ';
    if (key.includes('won')) messageText.classList.add('text-emerald-400');
    else if (key.includes('lost') || key.includes('game_over')) messageText.classList.add('text-red-400');
    else if (key.includes('burning')) messageText.classList.add('text-orange-500', 'font-bold', 'animate-pulse');
    else if (key.includes('boss')) messageText.classList.add('text-purple-400', 'font-bold');
    else if (key === 'script_effect') messageText.classList.add('text-cyan-400', 'font-mono');
    else messageText.classList.add('text-zinc-300');
}

function renderInventory() {
    // Jokers
    jokersList.innerHTML = '';
    if (game.jokers.length === 0) {
        jokersList.innerHTML = '<div class="text-zinc-600 text-sm italic">No active jokers</div>';
    } else {
        game.jokers.forEach((joker, index) => {
            const el = document.createElement('div');
            el.className = 'bg-zinc-800/50 border border-zinc-700 p-2 rounded flex justify-between items-center group';
            el.innerHTML = `
                <div>
                    <div class="text-sm font-bold text-emerald-400">${joker.name}</div>
                    <div class="text-xs text-zinc-500">${joker.description}</div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs bg-zinc-900 px-1 rounded text-zinc-500">${joker.rarity}</span>
                    ${game.gameState === 'SHOP' ? `<button onclick="sellItem('joker', ${index})" class="text-red-500 hover:text-red-400 text-xs font-bold px-1">SELL</button>` : ''}
                </div>
            `;
            // Bind click for sell
            const btn = el.querySelector('button');
            if (btn) btn.onclick = (e) => { e.stopPropagation(); handleSell('joker', index); };
            
            jokersList.appendChild(el);
        });
    }

    // Scripts
    scriptsList.innerHTML = '';
    if (game.scripts.length === 0) {
        scriptsList.innerHTML = '<div class="col-span-2 text-zinc-600 text-sm italic">No scripts loaded</div>';
    } else {
        game.scripts.forEach((script, index) => {
            const el = document.createElement('div'); // Changed to div to handle buttons inside
            el.className = 'bg-zinc-800/50 border border-zinc-700 p-2 rounded text-left transition-colors group relative overflow-hidden flex justify-between items-center';
            
            // Cooldown/Usage visual
            const canUse = game.gameState === 'PLAYING';
            const opacityClass = canUse ? '' : 'opacity-50';

            el.innerHTML = `
                <div class="flex-1 cursor-pointer ${opacityClass}" onclick="useScript(${index})">
                    <div class="text-sm font-bold text-cyan-400 group-hover:text-cyan-300">${script.name}</div>
                    <div class="text-xs text-zinc-500 truncate">${script.description}</div>
                </div>
                ${game.gameState === 'SHOP' ? `<button class="text-red-500 hover:text-red-400 text-xs font-bold px-2 z-10">SELL</button>` : ''}
            `;
            
            // Bind click for use
            const useDiv = el.querySelector('div');
            useDiv.onclick = () => { if(canUse) useScript(index); };

            // Bind click for sell
            const sellBtn = el.querySelector('button');
            if (sellBtn) sellBtn.onclick = (e) => { e.stopPropagation(); handleSell('script', index); };

            scriptsList.appendChild(el);
        });
    }
}

function renderShop() {
    shopItems.innerHTML = '';
    rerollCostSpan.textContent = game.rerollCost;
    
    game.shopInventory.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-zinc-800 border border-zinc-700 p-4 rounded-xl flex flex-col gap-2 hover:border-zinc-600 transition-colors';
        
        const isAffordable = game.cash >= item.price;
        const typeColor = item.type === 'passive' ? 'text-emerald-400' : 'text-cyan-400';
        
        el.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold ${typeColor}">${item.name}</h4>
                <span class="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400">$${item.price}</span>
            </div>
            <p class="text-sm text-zinc-400 flex-1">${item.description}</p>
            <button class="w-full py-2 rounded-lg font-bold text-sm transition-colors ${isAffordable ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}"
                onclick="buyItem(${item.uniqueId})">
                BUY
            </button>
        `;
        
        // Attach event listener manually to avoid global scope issues if needed, 
        // but for simplicity we'll use the onclick attribute and expose the function window.
        el.querySelector('button').onclick = () => handleBuy(item.uniqueId);
        
        shopItems.appendChild(el);
    });
}

function updateHistory() {
    historyWheel.innerHTML = '';
    game.history.forEach((guess, index) => {
        const el = document.createElement('div');
        const reverseIndex = game.history.length - 1 - index;
        let opacity = Math.max(0.4, 1 - (reverseIndex * 0.15));
        
        let hint = '';
        let colorClass = 'text-zinc-500';
        
        if (game.mysteryNumber !== null) {
            if (guess < game.mysteryNumber) {
                hint = '↑ HIGHER';
                colorClass = 'text-emerald-500';
            } else if (guess > game.mysteryNumber) {
                hint = '↓ LOWER';
                colorClass = 'text-red-500';
            } else {
                hint = 'MATCH';
                colorClass = 'text-emerald-400 font-bold';
            }
        }

        el.className = `flex justify-between items-center bg-zinc-800/30 p-2 rounded w-full`;
        el.style.opacity = opacity;
        
        el.innerHTML = `
            <span class="font-mono text-zinc-300">#${index + 1}: ${guess}</span>
            <span class="text-xs font-bold ${colorClass}">${hint}</span>
        `;
        historyWheel.prepend(el); // Newest first
    });
}

function updateGrid() {
    numberGrid.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.textContent = i;
        el.className = 'text-[0.6rem] font-mono flex items-center justify-center h-6 rounded transition-colors ';
        
        let isValid = true;
        if (i < game.min || i > game.max) isValid = false;
        
        if (isValid) {
            el.classList.add('text-emerald-400', 'bg-emerald-900/20', 'font-bold', 'border', 'border-emerald-500/30');
        } else {
            el.classList.add('text-zinc-700', 'opacity-30');
        }
        numberGrid.appendChild(el);
    }
}

function updateScreenState() {
    // Toggle Screens
    if (game.gameState === 'SHOP') {
        gameScreen.classList.add('hidden');
        shopScreen.classList.remove('hidden');
        renderShop();
    } else {
        gameScreen.classList.remove('hidden');
        shopScreen.classList.add('hidden');
    }

    // Toggle Controls
    if (game.gameState === 'IDLE') {
        startBtn.classList.remove('hidden');
        gameInputDiv.classList.add('hidden');
        nextBtn.classList.add('hidden');
    } else if (game.gameState === 'PLAYING') {
        startBtn.classList.add('hidden');
        gameInputDiv.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        guessInput.focus();
    } else if (game.gameState === 'WON' || game.gameState === 'LOST_ROUND') {
        startBtn.classList.add('hidden');
        gameInputDiv.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = 'Go to Shop';
    } else if (game.gameState === 'GAME_OVER') {
        startBtn.classList.remove('hidden');
        startBtn.textContent = 'Restart Run';
        gameInputDiv.classList.add('hidden');
        nextBtn.classList.add('hidden');
    }
}

function render() {
    updateStats();
    updateMessage();
    renderInventory();
    updateHistory();
    updateGrid();
    updateScreenState();
}

// --- ACTIONS ---

function handleStart() {
    game.startRun();
    render();
}

function handleGuess() {
    const val = guessInput.value;
    if (val === '') return;
    game.makeGuess(val);
    guessInput.value = '';
    render();
}

function handleNext() {
    game.nextAction();
    render();
}

function handleBuy(id) {
    if (game.buyItem(id)) {
        render(); // Re-render shop and stats
    } else {
        // Shake effect or error sound?
    }
}

function handleReroll() {
    if (game.rerollShop()) {
        render();
    }
}

function handleLeaveShop() {
    game.nextAction(); // Proceed to next round/level
    render();
}

function handleSell(type, index) {
    if (game.sellItem(type, index)) {
        render();
    }
}

function useScript(index) {
    game.useScript(index);
    render();
}

// --- EVENT LISTENERS ---

startBtn.addEventListener('click', handleStart);

guessBtn.addEventListener('click', handleGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});

nextBtn.addEventListener('click', handleNext);

rerollBtn.addEventListener('click', handleReroll);
leaveShopBtn.addEventListener('click', handleLeaveShop);

// Help / Grid
helpBtn.addEventListener('mouseenter', () => {
    gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
});
helpBtn.addEventListener('mouseleave', () => {
    gridOverlay.classList.add('opacity-0', 'pointer-events-none');
});

// Initial Render
render();
