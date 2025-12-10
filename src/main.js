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

// --- SCREENS & SETTINGS ---
const homeScreen = document.getElementById('home-screen');
const pauseOverlay = document.getElementById('pause-overlay');
const app = document.getElementById('app');
const homeStartBtn = document.getElementById('home-start-btn');
const langBtn = document.getElementById('lang-btn');
const themeBtn = document.getElementById('theme-btn');
const resumeBtn = document.getElementById('resume-btn');
const quitBtn = document.getElementById('quit-btn');
const pauseBtn = document.getElementById('pause-btn');

let currentLang = 'en';
let currentTheme = 'green';

// --- UI UPDATES ---

function updateStats() {
    cashDisplay.textContent = `$${game.cash}`;
    rentDisplay.textContent = `$${game.rent}`;
    levelDisplay.textContent = game.level;
    roundDisplay.textContent = `${game.round}/${game.maxRounds}`;
    
    // Attempts Display (New)
    const attemptsDiv = document.getElementById('attempts-display') || createAttemptsDisplay();
    attemptsDiv.textContent = `ATTEMPTS: ${game.attempts} / ${game.maxAttempts}`;
    
    // Visual alert for rent
    if (game.cash < game.rent && game.round === game.maxRounds) {
        rentDisplay.classList.add('animate-pulse', 'text-red-500');
    } else {
        rentDisplay.classList.remove('animate-pulse', 'text-red-500');
        rentDisplay.classList.add('text-red-500');
    }

    renderLogs();
}

function renderLogs() {
    let logsDiv = document.getElementById('system-logs');
    if (!logsDiv) {
        logsDiv = document.createElement('div');
        logsDiv.id = 'system-logs';
        logsDiv.className = 'mt-2 w-full max-w-md mx-auto bg-black border border-green-900 p-2 font-mono text-xs text-green-600 max-h-32 overflow-y-auto hidden';
        
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
    
    const translations = {
        en: {
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
        },
        fr: {
            'welcome_hustle': 'Bienvenue dans le Binary Hustle. Craquez le code.',
            'run_start': `MISSION: Trouvez le code (0-99) en ${displayParams?.maxAttempts} essais. Loyer: $${displayParams?.rent}.`,
            'round_start': `Niveau ${displayParams?.level} - Manche ${displayParams?.round}. Loyer: $${displayParams?.rent}`,
            'boss_round': `BOSS DÉTECTÉ: ${displayParams?.name}. ${displayParams?.desc}`,
            'invalid_guess': 'Entrée invalide. Entrez 0-99.',
            'won_round': `Accès Autorisé! Gain: $${displayParams?.gain}. Total: $${displayParams?.cash}`,
            'lost_round': `Accès Refusé. Le code était ${displayParams?.number}.`,
            'higher': `🔼 PLUS GRAND. Intervalle: [${displayParams?.min} - ${displayParams?.max}]`,
            'lower': `🔽 PLUS PETIT. Intervalle: [${displayParams?.min} - ${displayParams?.max}]`,
            'higher_burning': `🔥 BRÛLANT! Intervalle: [${displayParams?.min} - ${displayParams?.max}]`,
            'lower_burning': `🔥 BRÛLANT! Intervalle: [${displayParams?.min} - ${displayParams?.max}]`,
            'shop_welcome': 'Bienvenue au Marché du Dark Web.',
            'game_over_rent': `Expulsé! Cash: $${displayParams?.cash} < Loyer: $${displayParams?.rent}`,
            'item_bought': 'Objet acquis.',
            'insufficient_funds': 'Fonds insuffisants.',
            'inventory_full': 'Inventaire plein.',
            'script_effect': `> ${displayParams?.text}`
        }
    };
    
    const messages = translations[currentLang] || translations.en;
    text = messages[key] || key;
    messageText.textContent = text;
    
    // Color coding
    messageText.className = 'text-xl font-medium transition-colors duration-300 ';
    if (key.includes('won')) messageText.classList.add('text-green-400');
    else if (key.includes('lost') || key.includes('game_over')) messageText.classList.add('text-red-500');
    else if (key.includes('burning')) messageText.classList.add('text-orange-500', 'font-bold', 'animate-pulse');
    else if (key.includes('boss')) messageText.classList.add('text-purple-500', 'font-bold');
    else if (key === 'script_effect') messageText.classList.add('text-cyan-400', 'font-mono');
    else messageText.classList.add('text-green-400');
}

function renderInventory() {
    // Jokers
    jokersList.innerHTML = '';
    if (game.jokers.length === 0) {
        jokersList.innerHTML = '<div class="text-green-800 text-sm italic">No active jokers</div>';
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
                    ${game.gameState === 'SHOP' ? `<button onclick="sellItem('joker', ${index})" class="text-red-500 hover:text-red-400 text-xs font-bold px-1">[SELL]</button>` : ''}
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
        scriptsList.innerHTML = '<div class="col-span-2 text-green-800 text-sm italic">No scripts loaded</div>';
    } else {
        game.scripts.forEach((script, index) => {
            const el = document.createElement('div'); // Changed to div to handle buttons inside
            el.className = 'bg-black border border-green-700 p-2 text-left transition-colors group relative overflow-hidden flex justify-between items-center hover:bg-green-900/20';
            
            // Cooldown/Usage visual
            const canUse = game.gameState === 'PLAYING';
            const opacityClass = canUse ? '' : 'opacity-50';

            el.innerHTML = `
                <div class="flex-1 cursor-pointer ${opacityClass}" onclick="useScript(${index})">
                    <div class="text-sm font-bold text-cyan-400 group-hover:text-cyan-300">> ${script.name}</div>
                    <div class="text-xs text-green-600 truncate">${script.description}</div>
                </div>
                ${game.gameState === 'SHOP' ? `<button class="text-red-500 hover:text-red-400 text-xs font-bold px-2 z-10">[SELL]</button>` : ''}
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
        el.className = 'bg-black border border-purple-700 p-4 flex flex-col gap-2 hover:border-purple-500 transition-colors shadow-[0_0_5px_rgba(168,85,247,0.1)]';
        
        const isAffordable = game.cash >= item.price;
        const typeColor = item.type === 'passive' ? 'text-green-400' : 'text-cyan-400';
        
        el.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold ${typeColor}">${item.name}</h4>
                <span class="text-xs bg-purple-900/20 px-2 py-1 border border-purple-800 text-purple-400">$${item.price}</span>
            </div>
            <p class="text-sm text-purple-300/70 flex-1 font-mono">${item.description}</p>
            <button class="w-full py-2 font-bold text-sm transition-colors border ${isAffordable ? 'bg-purple-900/20 hover:bg-purple-500 hover:text-black text-purple-400 border-purple-500' : 'bg-black text-green-900 border-green-900 cursor-not-allowed'}"
                onclick="buyItem(${item.uniqueId})">
                [ BUY ]
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
        historyWheel.prepend(el); // Newest first
    });
}

function updateGrid() {
    numberGrid.innerHTML = '';
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
// startTitleAnimation(); // Moved to after boot sequence

// --- BOOT & LORE SEQUENCES ---
const bootScreen = document.getElementById('boot-screen');
const bootText = document.getElementById('boot-text');
const bootContinueBtn = document.getElementById('boot-continue-btn');

const bootSequence = [
    "Initializing Binary Hustle Kernel v1.0.0...",
    "Loading modules: [ CPU ] [ MEM ] [ GPU ] [ NET ]",
    "Mounting file system... OK",
    "Checking integrity... OK",
    "Establishing secure connection to localhost...",
    "Access granted.",
    "Starting user interface..."
];

const loreSequenceEn = [
    "SYSTEM CHECK COMPLETE.",
    "USER: [ANONYMOUS]",
    "STATUS: CRITICAL DEBT",
    "INCOMING MESSAGE...",
    "----------------------------------------",
    "We have no money left.",
    "The landlord is demanding higher rent.",
    "I found this old machine to mine crypto manually.",
    "It's our only chance to survive.",
    "----------------------------------------",
    "INITIALIZING MINING PROTOCOL..."
];

const loreSequenceFr = [
    "VÉRIFICATION SYSTÈME TERMINÉE.",
    "UTILISATEUR: [ANONYME]",
    "STATUT: DETTE CRITIQUE",
    "MESSAGE ENTRANT...",
    "----------------------------------------",
    "Nous n'avons plus d'argent.",
    "Le proprio nous demande des loyers de plus en plus élevés.",
    "J'ai trouvé cette vieille machine à miner de la crypto manuellement.",
    "C'est la seule chance de m'en sortir.",
    "----------------------------------------",
    "INITIALISATION DU PROTOCOLE DE MINAGE..."
];

// Start Boot on Load
window.addEventListener('load', () => {
    if (sessionStorage.getItem('skipBoot')) {
        sessionStorage.removeItem('skipBoot');
        bootScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        startTitleAnimation();
    } else {
        runTerminalSequence(bootSequence, () => {
            bootScreen.classList.add('hidden');
            homeScreen.classList.remove('hidden');
            startTitleAnimation();
        }, 30, false);
    }
});

function runTerminalSequence(lines, onComplete, speed = 50, waitForUser = false) {
    bootText.innerHTML = '';
    if (bootContinueBtn) bootContinueBtn.classList.add('hidden');
    let lineIndex = 0;
    
    function typeLine() {
        if (lineIndex >= lines.length) {
            if (waitForUser && bootContinueBtn) {
                bootContinueBtn.classList.remove('hidden');
                bootContinueBtn.onclick = () => {
                    bootContinueBtn.classList.add('hidden');
                    onComplete();
                };
            } else {
                setTimeout(onComplete, 1000);
            }
            return;
        }
        
        const line = lines[lineIndex];
        const p = document.createElement('div');
        p.className = 'mb-1';
        bootText.appendChild(p);
        
        let charIndex = 0;
        const interval = setInterval(() => {
            p.textContent += line[charIndex];
            charIndex++;
            if (charIndex >= line.length) {
                clearInterval(interval);
                lineIndex++;
                setTimeout(typeLine, 100); // Pause between lines
            }
        }, speed / 2); // Faster typing for boot
    }
    
    typeLine();
}

// --- TITLE ANIMATION ---
function startTitleAnimation() {
    const homeTitle = document.getElementById('home-title');
    if (!homeTitle) return;
    
    const titleText = "BINARY HUSTLE";
    const glitchChars = "!<>-_\\/[]{}—=+*^?#________";
    let currentIndex = 0;
    
    // Typing Phase
    const typeInterval = setInterval(() => {
        homeTitle.textContent = titleText.substring(0, currentIndex) + '█';
        currentIndex++;
        
        if (currentIndex > titleText.length) {
            clearInterval(typeInterval);
            homeTitle.textContent = titleText;
            homeTitle.classList.add('animate-terminal-pulse');
            startGlitchEffect(homeTitle, titleText, glitchChars);
        }
    }, 100);
}

function startGlitchEffect(element, originalText, chars) {
    setInterval(() => {
        // Randomly decide to glitch
        if (Math.random() > 0.3) return; // 70% chance to do nothing this tick

        const glitchCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 chars
        let glitchedText = originalText.split('');
        
        for (let i = 0; i < glitchCount; i++) {
            const index = Math.floor(Math.random() * originalText.length);
            if (originalText[index] !== ' ') {
                glitchedText[index] = chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        element.textContent = glitchedText.join('');
        
        // Reset quickly
        setTimeout(() => {
            element.textContent = originalText;
        }, 50 + Math.random() * 100);
        
    }, 150);
}

// --- NEW SCREENS LOGIC ---

const themes = {
    'green': { filter: 'none', label: 'GREEN' },
    'blue': { filter: 'hue-rotate(90deg)', label: 'BLUE' },
    'amber': { filter: 'hue-rotate(260deg)', label: 'AMBER' },
    'red': { filter: 'hue-rotate(220deg)', label: 'RED' },
};
const themeKeys = Object.keys(themes);

if (homeStartBtn) {
    homeStartBtn.onclick = () => {
        homeScreen.classList.add('hidden');
        bootScreen.classList.remove('hidden');
        
        const lore = currentLang === 'fr' ? loreSequenceFr : loreSequenceEn;
        
        runTerminalSequence(lore, () => {
            bootScreen.classList.add('hidden');
            app.classList.remove('hidden');
            if (game.gameState === 'GAME_OVER') {
                window.location.reload();
            }
        }, 40, true);
    };
}

if (pauseBtn) {
    pauseBtn.onclick = () => {
        pauseOverlay.classList.remove('hidden');
    };
}

if (resumeBtn) {
    resumeBtn.onclick = () => {
        pauseOverlay.classList.add('hidden');
    };
}

if (quitBtn) {
    quitBtn.onclick = () => {
        pauseOverlay.classList.add('hidden');
        app.classList.add('hidden');
        bootScreen.classList.remove('hidden');
        
        const shutdownText = [
            "ABORTING SESSION...",
            "SAVING LOGS... ERROR (DISK FULL)",
            "TERMINATING PROCESSES...",
            "SYSTEM HALTED."
        ];
        
        runTerminalSequence(shutdownText, () => {
            sessionStorage.setItem('skipBoot', 'true');
            window.location.reload();
        }, 30, false);
    };
}

if (themeBtn) {
    themeBtn.onclick = () => {
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        currentTheme = themeKeys[nextIndex];
        
        document.body.style.filter = themes[currentTheme].filter;
        
        updateStaticTexts();
    };
}

if (langBtn) {
    langBtn.onclick = () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        updateStaticTexts();
        updateMessage();
    };
}

function updateStaticTexts() {
    const texts = {
        en: {
            start: '> INITIALIZE_RUN',
            lang: 'LANG: EN',
            theme: `COLOR: ${themes[currentTheme].label}`,
            resume: '> RESUME_SESSION',
            quit: '> ABORT_RUN',
            paused: 'SYSTEM PAUSED',
            enter: '[ ENTER ]',
            exitShop: '> EXIT_MARKET',
            continue: '> CONTINUE'
        },
        fr: {
            start: '> INITIALISER_RUN',
            lang: 'LANG: FR',
            theme: `COULEUR: ${themes[currentTheme].label}`,
            resume: '> REPRENDRE',
            quit: '> ABANDONNER',
            paused: 'SYSTÈME EN PAUSE',
            enter: '[ ENTRER ]',
            exitShop: '> QUITTER_MARCHÉ',
            continue: '> CONTINUER'
        }
    };
    
    const t = texts[currentLang];
    
    if (homeStartBtn) homeStartBtn.textContent = t.start;
    if (langBtn) langBtn.textContent = t.lang;
    if (themeBtn) themeBtn.textContent = t.theme;
    if (resumeBtn) resumeBtn.textContent = t.resume;
    if (quitBtn) quitBtn.textContent = t.quit;
    
    const pauseTitle = pauseOverlay.querySelector('h2');
    if (pauseTitle) pauseTitle.textContent = t.paused;
    
    if (guessBtn) guessBtn.textContent = t.enter;
    if (leaveShopBtn) leaveShopBtn.textContent = t.exitShop;
    if (nextBtn) nextBtn.textContent = t.continue;
}
