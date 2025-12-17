import { elements } from '../../dom.js';
import { getLoc } from '../components/LocalizationUI.js';

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
