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
let isListeningForKey = false;

const themes = {
    'green': { filter: 'none', label: 'GREEN' },
    'blue': { filter: 'hue-rotate(90deg)', label: 'BLUE' },
    'amber': { filter: 'hue-rotate(260deg)', label: 'AMBER' },
    'red': { filter: 'hue-rotate(220deg)', label: 'RED' },
};
const themeKeys = Object.keys(themes);

// --- SETTINGS LOGIC ---
function loadSettings() {
    const saved = localStorage.getItem('binary_hustle_settings');
    if (saved) {
        const data = JSON.parse(saved);
        currentLang = data.lang || 'en';
        currentTheme = data.theme || 'green';
        gridKey = data.gridKey || 'p';
    }
    applySettings();
}

function saveSettings() {
    const data = {
        lang: currentLang,
        theme: currentTheme,
        gridKey: gridKey
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
}

// --- RENDER ---
function render() {
    // Check for Boss Cutscene (Level 1 Boss)
    if (game.gameState === 'PLAYING' && game.round === game.maxRounds && game.level === 1 && !game.bossIntroPlayed) {
        game.bossIntroPlayed = true;
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const bankLore = currentLang === 'fr' ? Localization.bankSequenceFr : Localization.bankSequenceEn;
        const bugLore = currentLang === 'fr' ? Localization.bugSequenceFr : Localization.bugSequenceEn;
        
        Animations.runTerminalSequence(bankLore, () => {
            // Chain the bug sequence (auto, fast)
            Animations.runTerminalSequence(bugLore, () => {
                elements.bootScreen.classList.add('hidden');
                elements.app.classList.remove('hidden');
                render(); // Force update to show Game Screen
            }, 30, false);
        }, 40, true);
        return; // Stop render to avoid flickering
    }

    UI.updateStats(game);
    UI.updateMessage(game, currentLang);
    
    // Update Glitch Effect based on Level/Round
    Animations.updateGlitchEffect(game);

    UI.renderInventory(game, { handleSell, useScript }, currentLang);
    UI.updateHistory(game);
    UI.updateGrid(game);
    UI.updateScreenState(game);
    
    // Dev Mode UI
    if (game.devMode) {
        elements.devControls.classList.remove('hidden');
    } else {
        elements.devControls.classList.add('hidden');
    }

    if (game.gameState === 'SHOP') {
        UI.renderShop(game, { handleBuy }, currentLang);
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
    render();
}

function handleGuess() {
    const val = elements.guessInput.value;
    if (val === '') return;
    game.makeGuess(val);
    elements.guessInput.value = '';
    render();
}

function handleNext() {
    // Check for Boss Defeated Cutscene (Level 1 Boss)
    if (game.gameState === 'WON' && game.round === game.maxRounds && game.level === 1 && !game.bossOutroPlayed) {
        game.bossOutroPlayed = true;
        
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const phishingLore = currentLang === 'fr' ? Localization.phishingSequenceFr : Localization.phishingSequenceEn;
        
        Animations.runTerminalSequence(phishingLore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            
            // Proceed to Browser
            game.nextAction();
            render(); 
        }, 40, true);
        return; 
    }

    // Check for Boss Defeated Cutscene (Level 2 Boss)
    if (game.gameState === 'WON' && game.round === game.maxRounds && game.level === 2 && !game.bossOutroPlayed) {
        game.bossOutroPlayed = true;
        
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');
        
        const rebootLore = currentLang === 'fr' ? Localization.rebootSequenceFr : Localization.rebootSequenceEn;
        
        Animations.runTerminalSequence(rebootLore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            
            // Proceed to Browser
            game.nextAction();
            render(); 
        }, 40, true);
        return; 
    }

    game.nextAction();

    // Check for Level Transition (Monthly Boot)
    if (game.gameState === 'LEVEL_TRANSITION') {
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

function handleOpenShop() {
    game.openApp('SHOP');
    render();
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
if (elements.browserContinueBtn) elements.browserContinueBtn.addEventListener('click', handleBrowserContinue);

// Help / Grid
if (elements.helpBtn) {
    elements.helpBtn.addEventListener('mouseenter', () => {
        elements.gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
    });
    elements.helpBtn.addEventListener('mouseleave', () => {
        elements.gridOverlay.classList.add('opacity-0', 'pointer-events-none');
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

    if (game.gameState === 'PLAYING') {
        // Grid Shortcut
        if (e.key.toLowerCase() === gridKey.toLowerCase()) {
            elements.gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
        }

        // Global Enter
        if (e.key === 'Enter') {
            handleGuess();
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
    if (game.gameState === 'PLAYING' && e.key.toLowerCase() === gridKey.toLowerCase()) {
        elements.gridOverlay.classList.add('opacity-0', 'pointer-events-none');
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
        elements.settingKeyBtn.textContent = '...';
        elements.settingKeyBtn.classList.add('animate-pulse', 'bg-green-900');
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

if (elements.pauseBtn) {
    elements.pauseBtn.onclick = () => {
        elements.pauseOverlay.classList.remove('hidden');
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

// Start Boot on Load
window.addEventListener('load', () => {
    loadSettings(); // Load settings first

    if (sessionStorage.getItem('skipBoot')) {
        sessionStorage.removeItem('skipBoot');
        elements.bootScreen.classList.add('hidden');
        elements.homeScreen.classList.remove('hidden');
        Animations.startTitleAnimation();
    } else {
        Animations.runTerminalSequence(Localization.bootSequence, () => {
            elements.bootScreen.classList.add('hidden');
            elements.homeScreen.classList.remove('hidden');
            Animations.startTitleAnimation();
        }, 30, false);
    }
});

// Initial Render
render();