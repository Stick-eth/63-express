import { elements } from '../../dom.js';
import { translations } from '../../localization.js';
import { getLoc } from './LocalizationUI.js';

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
            // Round cash in messages
            if (k === 'cash' || k === 'gain' || k === 'rent') {
                if (typeof displayParams[k] === 'number') {
                    displayParams[k] = Math.floor(displayParams[k]);
                }
            }
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
