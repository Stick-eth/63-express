import './style.css'
import { Game } from './game.js'
import { elements } from './dom.js'
import * as UI from './ui.js'
import * as Animations from './animations.js'
import * as Localization from './localization.js'

const game = new Game();

let currentLang = 'en';
let currentTheme = 'green';

const themes = {
    'green': { filter: 'none', label: 'GREEN' },
    'blue': { filter: 'hue-rotate(90deg)', label: 'BLUE' },
    'amber': { filter: 'hue-rotate(260deg)', label: 'AMBER' },
    'red': { filter: 'hue-rotate(220deg)', label: 'RED' },
};
const themeKeys = Object.keys(themes);

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

    UI.renderInventory(game, { handleSell, useScript });
    UI.updateHistory(game);
    UI.updateGrid(game);
    UI.updateScreenState(game);
    
    if (game.gameState === 'SHOP') {
        UI.renderShop(game, { handleBuy });
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

    game.nextAction();
    render();
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

// Settings
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

if (elements.langBtn) {
    elements.langBtn.onclick = () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        UI.updateStaticTexts(currentLang, currentTheme, themes);
        UI.updateMessage(game, currentLang);
    };
}

// Start Boot on Load
window.addEventListener('load', () => {
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