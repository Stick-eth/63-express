import { elements } from '../../dom.js';

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

export function refreshBrowserApps(game) {
    if (!game) return; // Guard
    const appSystemBtn = document.getElementById('app-system-btn');

    if (elements.appTradingBtn) {
        const label = elements.appTradingBtn.querySelector('span');
        if (game.tradingUnlocked) {
            elements.appTradingBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
            elements.appTradingBtn.classList.add('hover:bg-blue-900/20', 'hover:border-blue-500', 'border-blue-500', 'text-blue-400');
            if (label) label.textContent = 'TRADING DESK';
        } else {
            if (label) label.textContent = 'LOCKED';
        }
    }
    if (elements.appAntivirusBtn) {
        const label = elements.appAntivirusBtn.querySelector('span');
        if (game.antivirusUnlocked) {
            elements.appAntivirusBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
            elements.appAntivirusBtn.classList.add('hover:bg-blue-900/20', 'hover:border-blue-500', 'border-blue-500', 'text-blue-400');
            if (label) label.textContent = 'ANTIVIRUS';
        } else {
            if (label) label.textContent = 'LOCKED';
        }
    }
    if (appSystemBtn) {
        const label = appSystemBtn.querySelector('span');
        if (game.systemMonitorUnlocked) {
            appSystemBtn.classList.remove('cursor-not-allowed', 'bg-blue-950/20', 'text-blue-900');
            appSystemBtn.classList.add('hover:bg-orange-900/20', 'hover:border-orange-500', 'border-orange-500', 'text-orange-400');
            if (label) label.textContent = 'SYSTEM MONITOR';
        } else {
            if (label) label.textContent = 'LOCKED';
        }
    }
}
