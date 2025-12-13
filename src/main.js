import './style.css'
import { Game } from './game.js'
import { elements } from './dom.js'
import * as UI from './ui.js'
import * as Animations from './animations.js'
import * as Localization from './localization.js'

const game = new Game();

let currentLang = 'en';
let currentTheme = 'green';
let gridKey = 'p';
let numpadKey = 'o';
let isListeningForKey = false;
let isListeningForNumpadKey = false;

const themes = {
    'green': { filter: 'none', label: 'GREEN' },
    'blue': { filter: 'hue-rotate(90deg)', label: 'BLUE' },
    'amber': { filter: 'hue-rotate(260deg)', label: 'AMBER' },
    'red': { filter: 'hue-rotate(220deg)', label: 'RED' },
};
const themeKeys = Object.keys(themes);

// Initialize Numpad Listeners
UI.setupNumpadListeners(elements);

// --- SETTINGS LOGIC ---
function loadSettings() {
    const saved = localStorage.getItem('binary_hustle_settings');
    if (saved) {
        const data = JSON.parse(saved);
        currentLang = data.lang || 'en';
        currentTheme = data.theme || 'green';
        gridKey = data.gridKey || 'p';
        numpadKey = data.numpadKey || 'o';
    }
    applySettings();
}

function saveSettings() {
    const data = {
        lang: currentLang,
        theme: currentTheme,
        gridKey: gridKey,
        numpadKey: numpadKey
    };
    localStorage.setItem('binary_hustle_settings', JSON.stringify(data));
}

function applySettings() {
    // Apply Theme
    if (themes[currentTheme]) {
        document.body.style.filter = themes[currentTheme].filter;
    }
    // Update UI Texts
    UI.updateStaticTexts(currentLang, currentTheme, themes);
    // Update Key Button Text
    if (elements.settingKeyBtn) elements.settingKeyBtn.textContent = gridKey.toUpperCase();
    if (elements.settingNumpadKeyBtn) elements.settingNumpadKeyBtn.textContent = numpadKey.toUpperCase();
}

// --- RENDER ---
function render() {
    // Check for Arc Intro Cutscene
    if (game.gameState === 'ARC_INTRO') {
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const lore = game.currentArc.introSequence(currentLang);
        
        Animations.runTerminalSequence(lore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            
            // Proceed to Browser/Shop after Arc Intro
            game.generateShop();
            game.gameState = 'BROWSER';
            game.message = { key: 'browser_welcome' };
            render();
        }, 40, true);
        return;
    }

    // Check for Month Events (Boss Intro / Special Events)
    // Triggered at start of Week 3 (Round 3) usually, or end of month?
    // Let's stick to the existing logic: Week 3 Start = Boss Intro if applicable
    if (game.gameState === 'PLAYING' && game.round === game.maxRounds && !game.bossIntroPlayed) {
        const monthEvents = game.currentArc.monthEvents[game.monthInArc];
        if (monthEvents && monthEvents.intro) {
            game.bossIntroPlayed = true;
            elements.app.classList.add('hidden');
            elements.bootScreen.classList.remove('hidden');
            
            const lore = monthEvents.intro(currentLang);
            
            Animations.runTerminalSequence(lore, () => {
                elements.bootScreen.classList.add('hidden');
                elements.app.classList.remove('hidden');
                render(); 
            }, 40, true); // Wait for click if it's a long text, or auto? Let's say true (wait)
            return;
        }
    }

    UI.updateStats(game);
    UI.updateMessage(game, currentLang);
    
    // Update Visual Effects based on Arc/Progress
    Animations.updateVisualEffects(game);

    UI.renderInventory(game, { handleSell, useScript }, currentLang);
    UI.updateHistory(game);
    UI.updateGrid(game);
    UI.updateScreenState(game);

    if (game.gameState === 'TRADING') {
        startTradingLoop();
    } else {
        stopTradingLoop();
    }

    refreshBrowserApps();
    
    // Dev Mode UI
    if (game.devMode) {
        elements.devControls.classList.remove('hidden');
    } else {
        elements.devControls.classList.add('hidden');
    }

    if (game.gameState === 'SHOP') {
        UI.renderShop(game, { handleBuy }, currentLang);
    } else if (game.gameState === 'TRADING') {
        UI.renderTrading(game);
    }
    
    // Force Boss Message Update if in Boss Round
    if (game.gameState === 'PLAYING' && game.round === game.maxRounds && game.bossEffect) {
        if (game.message.key === 'round_start') {
             const boss = game.getBoss();
             if (boss) {
                 game.message = { key: 'boss_round', params: { name: boss.name, desc: boss.description } };
                 UI.updateMessage(game, currentLang);
             }
        }
    }
    
    UI.updateStaticTexts(currentLang, currentTheme, themes);
}

// --- ACTIONS ---

function handleStart() {
    if (game.gameState === 'GAME_OVER') {
        // Game Over Cutscene
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const lore = currentLang === 'fr' ? Localization.gameOverLoreFr : Localization.gameOverLoreEn;
        
        Animations.runTerminalSequence(lore, () => {
            // Return to Home Screen
            sessionStorage.setItem('skipBoot', 'true');
            window.location.reload();
        }, 40, false);
        return;
    }

    game.startRun();
    game.bossIntroPlayed = false;
    game.bossOutroPlayed = false;
    
    // Trigger First Arc Intro
    game.gameState = 'ARC_INTRO';
    render();
}

function handleGuess() {
    // Overheat Input Failure
    if (game.systemOverheatLevel > 60 && Math.random() < 0.2) {
        game.message = { key: 'script_effect', params: { text: 'SYSTEM ERROR: INPUT REJECTED (OVERHEAT)' } };
        UI.updateMessage(game, currentLang);
        // Visual shake
        const app = document.getElementById('app');
        if (app) {
            app.classList.add('animate-glitch');
            setTimeout(() => app.classList.remove('animate-glitch'), 200);
        }
        return;
    }

    const val = elements.guessInput.value;
    if (val === '') return;
    game.makeGuess(val);
    elements.guessInput.value = '';
    render();
}

function handleNext() {
    // Check for Boss Defeated Cutscene (End of Month Outro)
    if (game.gameState === 'WON' && game.round === game.maxRounds && !game.bossOutroPlayed) {
        const monthEvents = game.currentArc.monthEvents[game.monthInArc];
        if (monthEvents && monthEvents.outro) {
            game.bossOutroPlayed = true;
            Animations.stopVisualEffects();
            
            elements.app.classList.add('hidden');
            elements.bootScreen.classList.remove('hidden');
            
            const lore = monthEvents.outro(currentLang);
            
            Animations.runTerminalSequence(lore, () => {
                elements.bootScreen.classList.add('hidden');
                elements.app.classList.remove('hidden');
                
                // Proceed to Browser
                game.nextAction();
                render(); 
            }, 40, true);
            return; 
        }
    }

    game.nextAction();

    const continuingArc = game.currentArc && game.monthInArc < game.currentArc.duration;

    // Check for Level Transition (Monthly Boot)
    if (game.gameState === 'LEVEL_TRANSITION') {
        if (continuingArc) {
            Animations.stopVisualEffects();
            game.enterNewMonth();
            render();
            return;
        }

        Animations.stopVisualEffects();
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const bootLore = currentLang === 'fr' ? Localization.monthlyBootSequenceFr : Localization.monthlyBootSequenceEn;
        
        Animations.runTerminalSequence(bootLore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            
            game.enterNewMonth();
            render();
        }, 40, true);
        return;
    }

    // Check for Immediate Game Over (Rent Failure)
    if (game.gameState === 'GAME_OVER') {
        triggerGameOverCutscene();
        return;
    }

    render();
}

function triggerGameOverCutscene() {
    elements.app.classList.add('hidden');
    elements.bootScreen.classList.remove('hidden');
    
    const lore = currentLang === 'fr' ? Localization.gameOverLoreFr : Localization.gameOverLoreEn;
    
    Animations.runTerminalSequence(lore, () => {
        // Sequence finished. Wait for reading.
        setTimeout(() => {
            // Clear screen (Black)
            if (elements.bootText) elements.bootText.innerHTML = ''; 
            // Wait again
            setTimeout(() => {
                // Reload
                sessionStorage.setItem('skipBoot', 'true');
                window.location.reload();
            }, 2000);
        }, 3000);
    }, 40, false);
}

function handleBuy(id) {
    if (game.buyItem(id)) {
        render(); 
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
    game.closeApp();
    render();
}

function handleLeaveTrading() {
    game.closeApp();
    render();
}

function handleOpenTrading() {
    game.openApp('TRADING');
    UI.renderTrading(game); // Force initial render
    render();
}

function handleTradingBuy() {
    if (!elements.tradingBuyInput) return;
    const amount = parseFloat(elements.tradingBuyInput.value || '0');
    const result = game.buyTrading(amount);
    if (!result.success) {
        let msg = 'Invalid trade.';
        if (result.reason === 'limit') msg = 'Cannot invest >50% net worth.';
        if (result.reason === 'limit_reached') msg = 'Daily trading limit reached (1/1).';
        game.message = { key: 'script_effect', params: { text: msg } };
    } else {
        game.message = { key: 'script_effect', params: { text: `Bought ${result.shares.toFixed(3)} @ $${result.price.toFixed(2)}.` } };
    }
    render();
}

function handleTradingSell() {
    if (!elements.tradingBuyInput) return;
    const amount = parseFloat(elements.tradingBuyInput.value || '0');
    const result = game.sellTrading(amount);
    if (!result.success) {
        let msg = 'No holdings to sell.';
        if (result.reason === 'limit_reached') msg = 'Daily trading limit reached (1/1).';
        game.message = { key: 'script_effect', params: { text: msg } };
    } else {
        game.message = { key: 'script_effect', params: { text: `Sold ${result.shares.toFixed(3)} @ $${result.price.toFixed(2)} for $${result.gained.toFixed(2)}.` } };
    }
    render();
}

function handleOpenShop() {
    game.openApp('SHOP');
    render();
}

function handleOpenAntivirus() {
    game.openApp('ANTIVIRUS');
    // Reset state for fresh view so it doesn't show previous round results
    game.antivirusTimeLeft = 10;
    game.antivirusScore = 0;
    UI.renderAntivirus(game);
    render();
}

function handleLeaveAntivirus() {
    stopAntivirusGame();
    game.closeApp();
    render();
}

let antivirusTimerInterval = null;
let antivirusSpawnInterval = null;

function handleStartAntivirus() {
    if (game.antivirusActive) return;
    
    game.startAntivirusGame();
    UI.renderAntivirus(game);
    
    // Timer Loop
    antivirusTimerInterval = setInterval(() => {
        game.antivirusTimeLeft--;
        if (game.antivirusTimeLeft <= 0) {
            stopAntivirusGame();
        }
        UI.renderAntivirus(game);
    }, 1000);
    
    // Spawn Loop
    antivirusSpawnInterval = setInterval(() => {
        if (game.antivirusActive) {
            UI.spawnAntivirusTarget(game, () => {
                game.hitAntivirusTarget();
                UI.renderAntivirus(game);
            });
        }
    }, 600); // Spawn every 600ms
}

function stopAntivirusGame() {
    game.endAntivirusGame();
    if (antivirusTimerInterval) {
        clearInterval(antivirusTimerInterval);
        antivirusTimerInterval = null;
    }
    if (antivirusSpawnInterval) {
        clearInterval(antivirusSpawnInterval);
        antivirusSpawnInterval = null;
    }
    // Clear remaining targets
    if (elements.antivirusGameArea) {
        const targets = elements.antivirusGameArea.querySelectorAll('div.absolute'); // Select targets
        targets.forEach(t => {
            if (t.id !== 'antivirus-start-overlay') t.remove();
        });
    }
    UI.renderAntivirus(game);
}

function handleBrowserContinue() {
    game.nextAction();
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

function handleOpenSystem() {
    if (!game.systemMonitorUnlocked) return;
    game.gameState = 'SYSTEM_MONITOR';
    UI.renderSystemMonitor(game);
    render();
}

function handleLeaveSystem() {
    game.gameState = 'BROWSER';
    render();
}

function handleCalibrate() {
    let allAligned = true;
    game.systemSliders.forEach((val, i) => {
        if (Math.abs(val - game.systemTargets[i]) > 5) allAligned = false;
    });

    if (allAligned) {
        game.systemCalibratedThisRound = true;
        game.systemOverheatLevel = Math.max(0, game.systemOverheatLevel - 30); // Cool down significantly
        
        UI.renderSystemMonitor(game);
        
        // Visual feedback
        const btn = document.getElementById('system-calibrate-btn');
        if(btn) {
            btn.textContent = "SYSTEM STABILIZED";
            btn.classList.add('bg-green-500', 'text-black');
        }

        setTimeout(() => {
             handleLeaveSystem();
        }, 800);
    }
}

// System Monitor Sliders Logic
function setupSystemSlider(index) {
    const container = document.getElementById(`slider-container-${index}`);
    if (!container) return;

    const updateFromEvent = (e) => {
        const rect = container.getBoundingClientRect();
        // Calculate percentage from bottom
        let y = e.clientY;
        let percentage = ((rect.bottom - y) / rect.height) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        game.systemSliders[index] = percentage;
        UI.renderSystemMonitor(game);
    };

    container.addEventListener('pointerdown', (e) => {
        if (game.gameState !== 'SYSTEM_MONITOR') return;
        if (game.systemCalibratedThisRound) return; // Prevent interaction if already calibrated
        container.setPointerCapture(e.pointerId);
        updateFromEvent(e);
        
        container.onpointermove = (e) => {
            updateFromEvent(e);
        };
        
        container.onpointerup = (e) => {
            container.onpointermove = null;
            container.onpointerup = null;
            container.releasePointerCapture(e.pointerId);
        };
    });
}

// Initialize sliders
[0, 1, 2].forEach(setupSystemSlider);

// --- EVENT LISTENERS ---

if (elements.startBtn) elements.startBtn.addEventListener('click', handleStart);

if (elements.guessBtn) elements.guessBtn.addEventListener('click', handleGuess);
if (elements.guessInput) elements.guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});

if (elements.nextBtn) elements.nextBtn.addEventListener('click', handleNext);

if (elements.rerollBtn) elements.rerollBtn.addEventListener('click', handleReroll);
if (elements.leaveShopBtn) elements.leaveShopBtn.addEventListener('click', handleLeaveShop);
if (elements.appShopBtn) elements.appShopBtn.addEventListener('click', handleOpenShop);
if (elements.appTradingBtn) elements.appTradingBtn.addEventListener('click', handleOpenTrading);
if (elements.appAntivirusBtn) elements.appAntivirusBtn.addEventListener('click', handleOpenAntivirus);
if (elements.browserContinueBtn) elements.browserContinueBtn.addEventListener('click', handleBrowserContinue);
if (elements.tradingBackBtn) elements.tradingBackBtn.addEventListener('click', handleLeaveTrading);
if (elements.antivirusBackBtn) elements.antivirusBackBtn.addEventListener('click', handleLeaveAntivirus);
if (elements.antivirusStartBtn) elements.antivirusStartBtn.addEventListener('click', handleStartAntivirus);
if (elements.tradingBuyBtn) elements.tradingBuyBtn.addEventListener('click', handleTradingBuy);
if (elements.tradingSellBtn) elements.tradingSellBtn.addEventListener('click', handleTradingSell);

const appSystemBtn = document.getElementById('app-system-btn');
const systemBackBtn = document.getElementById('system-back-btn');
const systemCalibrateBtn = document.getElementById('system-calibrate-btn');

if (appSystemBtn) appSystemBtn.addEventListener('click', handleOpenSystem);
if (systemBackBtn) systemBackBtn.addEventListener('click', handleLeaveSystem);
if (systemCalibrateBtn) systemCalibrateBtn.addEventListener('click', handleCalibrate);

// Update trading app button state on render
function refreshBrowserApps() {
    if (elements.appTradingBtn && game.tradingUnlocked) {
        elements.appTradingBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
        elements.appTradingBtn.classList.add('hover:bg-blue-900/20', 'hover:border-blue-500', 'border-blue-500', 'text-blue-400');
        const label = elements.appTradingBtn.querySelector('span');
        if (label) label.textContent = 'TRADING DESK';
    }
    if (elements.appAntivirusBtn && game.antivirusUnlocked) {
        elements.appAntivirusBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
        elements.appAntivirusBtn.classList.add('hover:bg-blue-900/20', 'hover:border-blue-500', 'border-blue-500', 'text-blue-400');
        const label = elements.appAntivirusBtn.querySelector('span');
        if (label) label.textContent = 'ANTIVIRUS';
    }
    if (appSystemBtn && game.systemMonitorUnlocked) {
        appSystemBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
        appSystemBtn.classList.add('hover:bg-orange-900/20', 'hover:border-orange-500', 'border-orange-500', 'text-orange-400');
        const label = appSystemBtn.querySelector('span');
        if (label) label.textContent = 'SYSTEM MONITOR';
    }
}

// Help / Grid
if (elements.helpBtn) {
    elements.helpBtn.addEventListener('mouseenter', () => {
        elements.gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
    });
    elements.helpBtn.addEventListener('mouseleave', () => {
        elements.gridOverlay.classList.add('opacity-0', 'pointer-events-none');
    });
}

// Trading Candles loop (Always running to simulate market)
let tradingInterval = null;
function startTradingLoop() {
    if (tradingInterval) return;
    tradingInterval = setInterval(() => {
        game.addTradingCandle();
        // Only render if we are looking at the trading screen
        if (game.gameState === 'TRADING') {
            UI.renderTrading(game);
        }
    }, 3000);
}

// Start immediately
startTradingLoop();

function stopTradingLoop() {
    if (tradingInterval) {
        clearInterval(tradingInterval);
        tradingInterval = null;
    }
}

if (elements.pauseBtn) {
    elements.pauseBtn.addEventListener('click', () => {
        if (game.gameState === 'PLAYING') {
            const isOpen = !elements.pauseOverlay.classList.contains('hidden');
            elements.pauseOverlay.classList.toggle('hidden', isOpen);
        }
    });
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (isListeningForKey) {
        e.preventDefault();
        gridKey = e.key.toLowerCase();
        isListeningForKey = false;
        elements.settingKeyBtn.classList.remove('animate-pulse', 'bg-green-900');
        saveSettings();
        applySettings();
        return;
    }

    if (isListeningForNumpadKey) {
        e.preventDefault();
        numpadKey = e.key.toLowerCase();
        isListeningForNumpadKey = false;
        elements.settingNumpadKeyBtn.classList.remove('animate-pulse', 'bg-green-900');
        saveSettings();
        applySettings();
        return;
    }

    // Pause Menu (Escape)
    if (e.key === 'Escape') {
        if (!elements.pauseOverlay.classList.contains('hidden')) {
            elements.pauseOverlay.classList.add('hidden');
        } else if (game.gameState === 'PLAYING') {
            elements.pauseOverlay.classList.remove('hidden');
        }
        return;
    }

    if (game.gameState === 'PLAYING') {
        // Grid Shortcut
        if (e.key.toLowerCase() === gridKey.toLowerCase()) {
            elements.gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
        }

        // Numpad Shortcut
        if (e.key.toLowerCase() === numpadKey.toLowerCase()) {
            elements.numpadOverlay.classList.remove('hidden');
        }

        // Global Enter
        if (e.key === 'Enter') {
            if (!elements.numpadOverlay.classList.contains('hidden')) {
                // If numpad is open, Enter validates the guess and closes it?
                // Or just validates. Let's say it validates.
                handleGuess();
                elements.numpadOverlay.classList.add('hidden');
            } else {
                handleGuess();
            }
            return;
        }

        // Auto-focus Input on Number/Backspace
        if (/^[0-9]$/.test(e.key) || e.key === 'Backspace') {
            if (document.activeElement !== elements.guessInput) {
                elements.guessInput.focus();
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (game.gameState === 'PLAYING') {
        if (e.key.toLowerCase() === gridKey.toLowerCase()) {
            elements.gridOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
        if (e.key.toLowerCase() === numpadKey.toLowerCase()) {
            elements.numpadOverlay.classList.add('hidden');
        }
    }
});

// Settings
if (elements.settingsBtn) {
    elements.settingsBtn.onclick = () => {
        elements.homeScreen.classList.add('hidden');
        elements.settingsScreen.classList.remove('hidden');
    };
}

if (elements.settingsBackBtn) {
    elements.settingsBackBtn.onclick = () => {
        elements.settingsScreen.classList.add('hidden');
        elements.homeScreen.classList.remove('hidden');
    };
}

if (elements.settingLangBtn) {
    elements.settingLangBtn.onclick = () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        saveSettings();
        applySettings();
    };
}

if (elements.settingThemeBtn) {
    elements.settingThemeBtn.onclick = () => {
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        currentTheme = themeKeys[nextIndex];
        saveSettings();
        applySettings();
    };
}

if (elements.settingKeyBtn) {
    elements.settingKeyBtn.onclick = () => {
        isListeningForKey = true;
        isListeningForNumpadKey = false;
        elements.settingKeyBtn.textContent = '...';
        elements.settingKeyBtn.classList.add('animate-pulse', 'bg-green-900');
    };
}

if (elements.settingNumpadKeyBtn) {
    elements.settingNumpadKeyBtn.onclick = () => {
        isListeningForNumpadKey = true;
        isListeningForKey = false;
        elements.settingNumpadKeyBtn.textContent = '...';
        elements.settingNumpadKeyBtn.classList.add('animate-pulse', 'bg-green-900');
    };
}

if (elements.homeStartBtn) {
    elements.homeStartBtn.onclick = () => {
        elements.homeScreen.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const lore = currentLang === 'fr' ? Localization.loreSequenceFr : Localization.loreSequenceEn;
        
        Animations.runTerminalSequence(lore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            if (game.gameState === 'IDLE') {
                game.startRun();
                render();
            } else if (game.gameState === 'GAME_OVER') {
                window.location.reload();
            }
        }, 40, true);
    };
}

if (elements.numpadBtn) {
    elements.numpadBtn.onclick = () => {
        elements.numpadOverlay.classList.toggle('hidden');
    };
}

if (elements.resumeBtn) {
    elements.resumeBtn.onclick = () => {
        elements.pauseOverlay.classList.add('hidden');
    };
}

if (elements.quitBtn) {
    elements.quitBtn.onclick = () => {
        elements.pauseOverlay.classList.add('hidden');
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const shutdownText = [
            "ABORTING SESSION...",
            "SAVING LOGS... ERROR (DISK FULL)",
            "TERMINATING PROCESSES...",
            "SYSTEM HALTED."
        ];
        
        Animations.runTerminalSequence(shutdownText, () => {
            sessionStorage.setItem('skipBoot', 'true');
            window.location.reload();
        }, 30, false);
    };
}

if (elements.themeBtn) {
    elements.themeBtn.onclick = () => {
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        currentTheme = themeKeys[nextIndex];
        
        document.body.style.filter = themes[currentTheme].filter;
        
        UI.updateStaticTexts(currentLang, currentTheme, themes);
    };
}

// Removed old lang/theme btn listeners as they are now in settings
/*
if (elements.langBtn) {
    elements.langBtn.onclick = () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        UI.updateStaticTexts(currentLang, currentTheme, themes);
        UI.updateMessage(game, currentLang);
    };
}
*/

// Dev Mode Listeners
if (elements.settingDevBtn) {
    elements.settingDevBtn.onclick = () => {
        if (game.devMode) {
            game.toggleDevMode(false);
            elements.settingDevBtn.textContent = 'OFF';
            elements.settingDevBtn.classList.remove('text-red-500');
            elements.settingDevBtn.classList.add('text-green-900');
        } else {
            const code = prompt('ENTER DEV CODE:');
            if (code === null) return;
            if (code === '153624') {
                game.toggleDevMode(true);
                elements.settingDevBtn.textContent = 'ON';
                elements.settingDevBtn.classList.remove('text-green-900');
                elements.settingDevBtn.classList.add('text-red-500');
            } else {
                alert('ACCESS DENIED');
            }
        }
        render();
    };
}

if (elements.devRevealBtn) {
    elements.devRevealBtn.onclick = () => {
        const num = game.revealMysteryNumber();
        alert(`Mystery Number: ${num}`);
    };
}

if (elements.devAttemptBtn) {
    elements.devAttemptBtn.onclick = () => {
        game.addAttempt();
        render();
    };
}

if (elements.devAutoGuessBtn) {
    elements.devAutoGuessBtn.onclick = () => {
        if (game.gameState === 'PLAYING') {
            const optimal = Math.floor((game.min + game.max) / 2);
            game.makeGuess(optimal);
            render();
        }
    };
}

if (elements.devCashBtn) {
    elements.devCashBtn.onclick = () => {
        game.cash += 100;
        render();
    };
}

if (elements.devUnlockAppsBtn) {
    elements.devUnlockAppsBtn.onclick = () => {
        game.tradingUnlocked = true;
        game.antivirusUnlocked = true;
        game.systemMonitorUnlocked = true;
        refreshBrowserApps();
        render();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const skipBoot = sessionStorage.getItem('skipBoot') === 'true';
    if (skipBoot) sessionStorage.removeItem('skipBoot');

    if (elements.bootScreen) elements.bootScreen.classList.add('hidden');
    if (elements.homeScreen) elements.homeScreen.classList.remove('hidden');
    Animations.startTitleAnimation();
});

// Initial Render
render();