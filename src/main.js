import './style.css'
import { Game } from './game.js'
import { elements } from './dom.js'
import * as UI from './ui.js'
import * as Animations from './animations.js'
import * as Localization from './localization.js'
import { SaveManager } from './managers/SaveManager.js'
import { TokenManager } from './managers/TokenManager.js'
import { settings, themes } from './managers/SettingsManager.js'
import { inputManager } from './managers/InputManager.js'
import { initSkillTreeUI } from './ui/screens/SkillTreeUI.js'

const game = new Game();

// Settings Variables managed by SettingsManager
const themeKeys = Object.keys(themes);

// Initialize Numpad Listeners
// Initialize Numpad Listeners
// Delegated to InputManager


// --- SETTINGS LOGIC ---
// Managed by SettingsManager
// Need to re-declare listeners state as they were deleted above
// Listeners state managed by InputManager


// --- SAVE/LOAD GAME ---
// Delegate to SaveManager

// --- TOKEN SYSTEM ---
// Delegate to TokenManager


function updateContinueButton() {
    const continueBtn = document.getElementById('home-continue-btn');
    if (continueBtn) {
        if (SaveManager.hasSavedGame()) {
            continueBtn.classList.remove('hidden');
        } else {
            continueBtn.classList.add('hidden');
        }
    }
}

/**
 * Soft reset - return to home screen without full page reload
 * This avoids CSS flash and provides smoother UX
 */
function softReset() {
    // Hide all screens
    elements.app.classList.add('hidden');
    elements.bootScreen.classList.add('hidden');
    elements.shopScreen?.classList.add('hidden');
    elements.tradingScreen?.classList.add('hidden');
    elements.browserScreen?.classList.add('hidden');
    elements.pauseOverlay?.classList.add('hidden');
    elements.abandonConfirmScreen?.classList.add('hidden');
    elements.settingsScreen?.classList.add('hidden');
    elements.resetConfirmModal?.classList.add('hidden');

    // Reset game to fresh state
    game.gameState = 'IDLE';
    game.jokers = [];
    game.scripts = [];
    game.skillJokers = [];
    game.cash = 100;
    game.level = 1;
    game.round = 1;
    game.rent = 50;
    game.bossIntroPlayed = false;
    game.bossOutroPlayed = false;

    // Update UI
    updateContinueButton();
    TokenManager.updateTokenDisplay();
    applySettings();

    // Show home screen
    elements.homeScreen.classList.remove('hidden');
}

function applySettings() {
    // Apply Theme
    if (themes[settings.currentTheme]) {
        document.body.style.filter = themes[settings.currentTheme].filter;
    }
    // Update UI Texts
    UI.updateStaticTexts(settings.currentLang, settings.currentTheme, themes);
    // Update Key Button Text
    if (elements.settingKeyBtn) elements.settingKeyBtn.textContent = settings.gridKey.toUpperCase();
    if (elements.settingNumpadKeyBtn) elements.settingNumpadKeyBtn.textContent = settings.numpadKey.toUpperCase();
}

// --- RENDER ---
function render() {
    // Check for Arc Intro Cutscene
    if (game.gameState === 'ARC_INTRO') {
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');

        const lore = game.currentArc.introSequence(settings.currentLang);

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

            const lore = monthEvents.intro(settings.currentLang);

            Animations.runTerminalSequence(lore, () => {
                elements.bootScreen.classList.add('hidden');
                elements.app.classList.remove('hidden');
                render();
            }, 40, true); // Wait for click if it's a long text, or auto? Let's say true (wait)
            return;
        }
    }

    UI.updateStats(game);
    UI.updateMessage(game, settings.currentLang);

    // Update Visual Effects based on Arc/Progress
    Animations.updateVisualEffects(game);

    UI.renderInventory(game, { handleSell, useScript }, settings.currentLang);
    UI.updateHistory(game);
    UI.updateGrid(game);
    UI.updateScreenState(game);

    // Trading loop runs continuously - no start/stop needed here

    UI.refreshBrowserApps(game);

    // Dev Mode UI
    if (game.devMode) {
        elements.devControls.classList.remove('hidden');
    } else {
        elements.devControls.classList.add('hidden');
    }

    if (game.gameState === 'SHOP') {
        UI.renderShop(game, { handleBuy }, settings.currentLang);
    } else if (game.gameState === 'TRADING') {
        UI.renderTrading(game);
    }

    // Force Boss Message Update if in Boss Round
    if (game.gameState === 'PLAYING' && game.round === game.maxRounds && game.bossEffect) {
        if (game.message.key === 'round_start') {
            const boss = game.getBoss();
            if (boss) {
                game.message = { key: 'boss_round', params: { name: boss.name, desc: boss.description } };
                UI.updateMessage(game, settings.currentLang);
            }
        }
    }

    UI.updateStaticTexts(settings.currentLang, settings.currentTheme, themes);
}

// --- ACTIONS ---

function handleStart() {
    if (game.gameState === 'GAME_OVER') {
        // Award progressive tokens if player survived at least one semester (6 months)
        if (game.level >= 6) {
            TokenManager.awardProgressiveTokens(game.level);
        }

        // Clear saved game on game over
        SaveManager.clearSavedGame();

        // Game Over Cutscene
        elements.app.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');

        const lore = settings.currentLang === 'fr' ? Localization.gameOverLoreFr : Localization.gameOverLoreEn;

        Animations.runTerminalSequence(lore, () => {
            // Return to Home Screen
            softReset();
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
        UI.updateMessage(game, settings.currentLang);
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

    // Auto-save after each guess
    if (game.gameState !== 'GAME_OVER') {
        SaveManager.saveGame(game);
    }

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

            const lore = monthEvents.outro(settings.currentLang);

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

        const bootLore = settings.currentLang === 'fr' ? Localization.monthlyBootSequenceFr : Localization.monthlyBootSequenceEn;

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

    const lore = settings.currentLang === 'fr' ? Localization.gameOverLoreFr : Localization.gameOverLoreEn;

    Animations.runTerminalSequence(lore, () => {
        // Sequence finished. Wait for reading.
        setTimeout(() => {
            // Clear screen (Black)
            if (elements.bootText) elements.bootText.innerHTML = '';
            // Wait again
            setTimeout(() => {
                // Soft reset to home
                softReset();
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
    SaveManager.saveGame(game);
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
    // Only reset state if player has scans available
    if (game.antivirusScansThisRound < game.maxAntivirusScans) {
        game.antivirusTimeLeft = 10;
        game.antivirusScore = 0;
    }
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

    const result = game.startAntivirusGame();
    if (!result.success) {
        UI.renderAntivirus(game);
        return; // Can't start - no scans left
    }

    UI.renderAntivirus(game);

    // Clear any existing intervals first
    if (antivirusTimerInterval) {
        clearInterval(antivirusTimerInterval);
        antivirusTimerInterval = null;
    }
    if (antivirusSpawnInterval) {
        clearInterval(antivirusSpawnInterval);
        antivirusSpawnInterval = null;
    }

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
    // Only end game and increment scan if game was actually active
    if (game.antivirusActive) {
        game.endAntivirusGame();
    }
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
    game.closeApp();
    SaveManager.saveGame(game);
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
        if (btn) {
            btn.textContent = "SYSTEM STABILIZED";
            btn.classList.add('bg-green-500', 'text-black');
        }

        setTimeout(() => {
            handleLeaveSystem();
        }, 800);
    }
}

// System Monitor Sliders Logic Delegated


// Initialize sliders and token display

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

// --- SAVE & QUIT ---
if (elements.saveQuitBtn) {
    elements.saveQuitBtn.addEventListener('click', () => {
        SaveManager.saveGame(game);
        // For now, simpler to softReset as it checks for save on load
        softReset();
    });
}

// --- ABANDON RUN ---
if (elements.abandonBtn) {
    elements.abandonBtn.addEventListener('click', () => {
        // Hide Pause Menu
        if (elements.pauseOverlay) elements.pauseOverlay.classList.add('hidden');
        // Show Abandon Confirm
        if (elements.abandonConfirmScreen) {
            elements.abandonConfirmScreen.classList.remove('hidden');
        }
    });
}

if (elements.abandonNoBtn) {
    elements.abandonNoBtn.addEventListener('click', () => {
        if (elements.abandonConfirmScreen) {
            elements.abandonConfirmScreen.classList.add('hidden');
            // Re-open Pause Menu if we want, or just return to game? 
            // Usually return to pause menu is better UX if you came from there.
            if (elements.pauseOverlay) elements.pauseOverlay.classList.remove('hidden');
        }
    });
}

if (elements.abandonYesBtn) {
    elements.abandonYesBtn.addEventListener('click', () => {
        // Award tokens before wiping save
        if (game.level >= 6) {
            TokenManager.awardProgressiveTokens(game.level);
        }
        SaveManager.clearSavedGame();
        softReset();
    });
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
// Keyboard Shortcuts delegated to InputManager


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
        settings.currentLang = settings.currentLang === 'en' ? 'fr' : 'en';
        settings.saveSettings();
        applySettings();
    };
}

if (elements.settingThemeBtn) {
    elements.settingThemeBtn.onclick = () => {
        const currentIndex = themeKeys.indexOf(settings.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        settings.currentTheme = themeKeys[nextIndex];
        settings.saveSettings();
        applySettings();
    };
}

if (elements.settingKeyBtn) {
    elements.settingKeyBtn.onclick = () => {
        inputManager.startRebinding('grid');
    };

}

if (elements.settingNumpadKeyBtn) {
    elements.settingNumpadKeyBtn.onclick = () => {
        inputManager.startRebinding('numpad');
    };
}

// Reset Data Button
if (elements.resetDataBtn) {
    elements.resetDataBtn.onclick = () => {
        elements.resetConfirmModal.classList.remove('hidden');
        // Reset input each time modal opens
        if (elements.resetConfirmInput) {
            elements.resetConfirmInput.value = '';
            elements.resetConfirmBtn.disabled = true;
            elements.resetConfirmBtn.classList.add('bg-gray-700', 'text-gray-500', 'cursor-not-allowed');
            elements.resetConfirmBtn.classList.remove('bg-red-600', 'text-white', 'hover:bg-red-700');
        }
    };
}

// Input validation for reset confirmation
if (elements.resetConfirmInput) {
    elements.resetConfirmInput.oninput = () => {
        const isMatch = elements.resetConfirmInput.value.toUpperCase() === 'DELETE';
        elements.resetConfirmBtn.disabled = !isMatch;
        if (isMatch) {
            elements.resetConfirmBtn.classList.remove('bg-gray-700', 'text-gray-500', 'cursor-not-allowed');
            elements.resetConfirmBtn.classList.add('bg-red-600', 'text-white', 'hover:bg-red-700');
        } else {
            elements.resetConfirmBtn.classList.add('bg-gray-700', 'text-gray-500', 'cursor-not-allowed');
            elements.resetConfirmBtn.classList.remove('bg-red-600', 'text-white', 'hover:bg-red-700');
        }
    };
}

if (elements.resetCancelBtn) {
    elements.resetCancelBtn.onclick = () => {
        elements.resetConfirmModal.classList.add('hidden');
        if (elements.resetConfirmInput) elements.resetConfirmInput.value = '';
    };
}

if (elements.resetConfirmBtn) {
    elements.resetConfirmBtn.onclick = () => {
        // Double check input matches before proceeding
        if (elements.resetConfirmInput && elements.resetConfirmInput.value.toUpperCase() !== 'DELETE') {
            return;
        }
        // Clear all localStorage
        localStorage.clear();
        // Reload the page to reset everything
        window.location.reload();
    };
}

if (elements.homeStartBtn) {
    elements.homeStartBtn.onclick = () => {
        elements.homeScreen.classList.add('hidden');
        elements.bootScreen.classList.remove('hidden');

        const lore = settings.currentLang === 'fr' ? Localization.loreSequenceFr : Localization.loreSequenceEn;

        Animations.runTerminalSequence(lore, () => {
            elements.bootScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
            if (game.gameState === 'IDLE') {
                game.startRun();
                render();
            } else if (game.gameState === 'GAME_OVER') {
                softReset();
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
            softReset();
        }, 30, false);
    };
}

if (elements.themeBtn) {
    elements.themeBtn.onclick = () => {
        const currentIndex = themeKeys.indexOf(settings.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        settings.currentTheme = themeKeys[nextIndex];

        document.body.style.filter = themes[settings.currentTheme].filter;

        UI.updateStaticTexts(settings.currentLang, settings.currentTheme, themes);
    };
}

// Removed old lang/theme btn listeners as they are now in settings
/*
if (elements.langBtn) {
    elements.langBtn.onclick = () => {
        settings.currentLang = settings.currentLang === 'en' ? 'fr' : 'en';
        UI.updateStaticTexts(settings.currentLang, settings.currentTheme, themes);
        UI.updateMessage(game, settings.currentLang);
    };
}
*/

// Dev Mode Listeners - Removed (secret code activation)


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
        UI.refreshBrowserApps(game);
        render();
    };
}

if (elements.devSkipBootBtn) {
    elements.devSkipBootBtn.onclick = () => {
        if (window.skipTerminalSequence) {
            window.skipTerminalSequence();
        }
    };
}

if (elements.devTokensBtn) {
    elements.devTokensBtn.onclick = () => {
        TokenManager.addToken(10);
        TokenManager.updateTokenDisplay();
        render();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const skipBoot = sessionStorage.getItem('skipBoot') === 'true';
    if (skipBoot) sessionStorage.removeItem('skipBoot');

    if (elements.bootScreen) elements.bootScreen.classList.add('hidden');
    if (elements.homeScreen) elements.homeScreen.classList.remove('hidden');
    Animations.startTitleAnimation();

    // --- SAVE/LOAD & TOKEN INITIALIZATION ---
    settings.loadSettings();
    applySettings();
    TokenManager.updateTokenDisplay();
    UI.setupSystemSliders(game);

    // Initialize InputManager
    inputManager.init(game, elements, {
        handleGuess,
        applySettings
    });

    updateContinueButton();


    // Continue button handler
    const continueBtn = document.getElementById('home-continue-btn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            if (SaveManager.loadGame(game)) {
                elements.homeScreen.classList.add('hidden');
                elements.app.classList.remove('hidden');
                render();
            }
        };
    }

    // --- TUTORIAL LOGIC ---
    setupTutorial();

    // --- SECRET DEV MODE ACTIVATION ---
    setupSecretDevMode();
});

// Secret Dev Mode: Type 'stickmou' on home screen to toggle
let secretBuffer = '';
const SECRET_CODE = 'stickmou';

function setupSecretDevMode() {
    document.addEventListener('keydown', (e) => {
        // Only listen on home screen
        if (!elements.homeScreen || elements.homeScreen.classList.contains('hidden')) {
            secretBuffer = '';
            return;
        }

        // Ignore modifier keys
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Add character to buffer
        if (e.key.length === 1) {
            secretBuffer += e.key.toLowerCase();

            // Keep buffer at max length
            if (secretBuffer.length > SECRET_CODE.length) {
                secretBuffer = secretBuffer.slice(-SECRET_CODE.length);
            }

            // Check for match
            if (secretBuffer === SECRET_CODE) {
                game.toggleDevMode(!game.devMode);
                secretBuffer = '';
                render();

                // Visual feedback
                if (game.devMode) {
                    console.log('%c DEV MODE ACTIVATED ', 'background: #00ff00; color: #000');
                } else {
                    console.log('%c DEV MODE DEACTIVATED ', 'background: #ff0000; color: #fff');
                }
            }
        }
    });
}



// --- TUTORIAL SYSTEM ---
let currentTutorialPage = 1;
const totalTutorialPages = 5;

function setupTutorial() {
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const tutorialOverlay = document.getElementById('tutorial-overlay');

    // Force hide on init
    if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
    const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
    const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
    const tutorialNextBtn = document.getElementById('tutorial-next-btn');

    if (howToPlayBtn) {
        howToPlayBtn.onclick = () => {
            currentTutorialPage = 1;
            showTutorialPage(1);
            updateTutorialTexts();
            if (tutorialOverlay) tutorialOverlay.classList.remove('hidden');
        };
    }

    if (tutorialCloseBtn) {
        tutorialCloseBtn.onclick = () => {
            if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
        };
    }

    if (tutorialOverlay) {
        tutorialOverlay.onclick = (e) => {
            if (e.target === tutorialOverlay) {
                tutorialOverlay.classList.add('hidden');
            }
        };
    }

    if (tutorialPrevBtn) {
        tutorialPrevBtn.onclick = () => {
            if (currentTutorialPage > 1) {
                currentTutorialPage--;
                showTutorialPage(currentTutorialPage);
            }
        };
    }

    if (tutorialNextBtn) {
        tutorialNextBtn.onclick = () => {
            if (currentTutorialPage < totalTutorialPages) {
                currentTutorialPage++;
                showTutorialPage(currentTutorialPage);
            } else {
                // Close tutorial on last page
                if (tutorialOverlay) tutorialOverlay.classList.add('hidden');
            }
        };
    }

    // Dot navigation
    const dots = document.querySelectorAll('.tutorial-dot');
    dots.forEach(dot => {
        dot.onclick = () => {
            const page = parseInt(dot.dataset.dot);
            currentTutorialPage = page;
            showTutorialPage(page);
        };
        dot.style.cursor = 'pointer';
    });
}

function showTutorialPage(pageNum) {
    const pages = document.querySelectorAll('.tutorial-page');
    const dots = document.querySelectorAll('.tutorial-dot');
    const prevBtn = document.getElementById('tutorial-prev-btn');
    const nextBtn = document.getElementById('tutorial-next-btn');

    pages.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('flex');
    });

    const activePage = document.querySelector(`.tutorial-page[data-page="${pageNum}"]`);
    if (activePage) {
        activePage.classList.remove('hidden');
        activePage.classList.add('flex');
    }

    dots.forEach(dot => {
        if (parseInt(dot.dataset.dot) === pageNum) {
            dot.classList.remove('bg-green-900');
            dot.classList.add('bg-green-500');
        } else {
            dot.classList.remove('bg-green-500');
            dot.classList.add('bg-green-900');
        }
    });

    // Update button states
    if (prevBtn) {
        prevBtn.disabled = pageNum === 1;
    }
    if (nextBtn) {
        const t = Localization.staticTexts[settings.currentLang];
        if (pageNum === totalTutorialPages) {
            nextBtn.textContent = t.return || '< CLOSE';
        } else {
            nextBtn.textContent = t.tutorialNext || 'NEXT >';
        }
    }
}

function updateTutorialTexts() {
    const t = Localization.staticTexts[settings.currentLang];

    // Update button text
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    if (howToPlayBtn) howToPlayBtn.textContent = t.howToPlay;

    const tutorialTitle = document.querySelector('#tutorial-overlay h2');
    if (tutorialTitle) tutorialTitle.textContent = t.tutorialTitle;

    const prevBtn = document.getElementById('tutorial-prev-btn');
    if (prevBtn) prevBtn.textContent = t.tutorialPrev;

    const nextBtn = document.getElementById('tutorial-next-btn');
    if (nextBtn) nextBtn.textContent = t.tutorialNext;

    // Update page content
    for (let i = 1; i <= totalTutorialPages; i++) {
        const titleEl = document.querySelector(`.tutorial-page[data-page="${i}"] h3`);
        const textEl = document.querySelector(`.tutorial-page[data-page="${i}"] p`);

        if (titleEl) titleEl.textContent = t[`tutorial_title_${i}`] || '';
        if (textEl) textEl.textContent = t[`tutorial_text_${i}`] || '';
    }
}

// Initialize Skill Tree UI
initSkillTreeUI();

// Initial Render
render();

// ═══════════════════════════════════════════════════════════════
// TITLE TERMINAL TYPING ANIMATION
// ═══════════════════════════════════════════════════════════════
const TITLE_TEXT = 'Binary Hustle';
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789';

function initTitleAnimation() {
    const titleEl = document.getElementById('game-title');
    const cursorEl = document.getElementById('title-cursor');
    if (!titleEl || !cursorEl) return;

    let isAnimating = false;

    async function animateCycle() {
        if (isAnimating) return;
        isAnimating = true;

        // Delete phase
        await deleteText(titleEl, cursorEl);
        await sleep(300);

        // Type phase with glitch
        await typeText(titleEl, cursorEl, TITLE_TEXT);

        isAnimating = false;
    }

    async function deleteText(el, cursor) {
        const text = el.textContent.replace('_', '');
        for (let i = text.length; i >= 0; i--) {
            el.innerHTML = text.slice(0, i);
            el.appendChild(cursor);
            await sleep(40 + Math.random() * 30);
        }
    }

    async function typeText(el, cursor, text) {
        for (let i = 0; i <= text.length; i++) {
            let displayed = text.slice(0, i);

            // Random glitch on last 1-2 chars
            if (i > 0 && Math.random() < 0.3) {
                const glitchIdx = Math.max(0, i - 1 - Math.floor(Math.random() * 2));
                const glitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                displayed = displayed.slice(0, glitchIdx) +
                    '<span class="text-red-500 animate-pulse">' + glitchChar + '</span>' +
                    displayed.slice(glitchIdx + 1);
            }

            el.innerHTML = displayed;
            el.appendChild(cursor);
            await sleep(60 + Math.random() * 40);

            // Fix glitch after typing next char
            if (i < text.length) {
                el.innerHTML = text.slice(0, i);
                el.appendChild(cursor);
            }
        }

        // Final clean display
        el.innerHTML = text;
        el.appendChild(cursor);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Start animation loop (every 12 seconds)
    setInterval(animateCycle, 12000);

    // First animation after 3 seconds
    setTimeout(animateCycle, 3000);
}

// Start title animation
initTitleAnimation();
