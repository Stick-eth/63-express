import { elements } from '../../dom.js';

export function updateHistory(game) {
    elements.historyWheel.innerHTML = '';
    const hideHints = game.currentArc && game.currentArc.id === 'ransomware';
    game.history.forEach((guess, index) => {
        const el = document.createElement('div');
        const reverseIndex = game.history.length - 1 - index;
        let opacity = Math.max(0.4, 1 - (reverseIndex * 0.15));

        let hint = '';
        let colorClass = 'text-green-700';

        if (game.mysteryNumber !== null) {
            let isLower = guess < game.mysteryNumber;
            let isHigher = guess > game.mysteryNumber;

            // System Overheat Penalty: Invert hints at max level
            if (game.systemOverheatLevel >= 100) {
                const temp = isLower;
                isLower = isHigher;
                isHigher = temp;
            }

            if (isLower) {
                hint = '↑ HIGHER';
                colorClass = 'text-green-500';
            } else if (isHigher) {
                hint = '↓ LOWER';
                colorClass = 'text-red-500';
            } else {
                hint = 'MATCH';
                colorClass = 'text-green-400 font-bold';
            }
        }

        if (hideHints) {
            hint = 'LOCKED';
            colorClass = 'text-red-500';
        }

        el.className = `flex justify-between items-center border-b border-green-900/30 p-2 w-full`;
        el.style.opacity = opacity;

        el.innerHTML = `
            <span class="text-green-300">#${index + 1}: ${guess}</span>
            <span class="text-xs font-bold ${colorClass}">${hint}</span>
        `;
        elements.historyWheel.prepend(el);
    });
}
