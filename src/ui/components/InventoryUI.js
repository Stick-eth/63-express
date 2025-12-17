import { elements } from '../../dom.js';
import { getLoc } from './LocalizationUI.js';
import { showTooltip, moveTooltip, hideTooltip } from './TooltipUI.js';

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

            // Add quantity indicator
            if (joker.quantity && joker.quantity > 1) {
                const qty = document.createElement('div');
                qty.className = 'absolute bottom-0 right-0 bg-green-900 text-green-100 text-[10px] px-1 font-bold leading-none';
                qty.textContent = `x${joker.quantity}`;
                el.appendChild(qty);
            }

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
