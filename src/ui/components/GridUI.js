import { elements } from '../../dom.js';

export function updateGrid(game) {
    elements.numberGrid.innerHTML = '';

    const start = game.absoluteMin !== undefined ? game.absoluteMin : 0;
    const end = game.absoluteMax !== undefined ? game.absoluteMax : 99;
    const totalRange = end - start + 1;

    // Always 100 cells
    const cellCount = 100;
    const step = totalRange / cellCount;

    const hasEvenFlow = game.jokers.some(j => j.id === 'even_flow');
    const hasOddFlow = game.jokers.some(j => j.id === 'odd_flow');

    for (let i = 0; i < cellCount; i++) {
        const el = document.createElement('div');

        // Calculate range for this cell
        const cellStart = Math.floor(start + (i * step));
        const cellEnd = Math.floor(start + ((i + 1) * step)) - 1;

        el.textContent = cellStart;
        el.className = 'text-[0.7rem] flex items-center justify-center h-8 transition-colors cursor-help overflow-hidden select-none';
        el.title = `${cellStart} - ${cellEnd}`;

        // Check validity
        // A cell is valid if its range overlaps with [game.min, game.max]
        let isValid = (cellStart <= game.max && cellEnd >= game.min);

        // Even Flow: Gray out odd numbers (only if cell represents a single number)
        if (hasEvenFlow && cellStart === cellEnd && cellStart % 2 !== 0) {
            isValid = false;
        }
        // Odd Flow: Gray out even numbers (only if cell represents a single number)
        if (hasOddFlow && cellStart === cellEnd && cellStart % 2 === 0) {
            isValid = false;
        }

        // Check if fully valid (optional, for color intensity)
        const isFullyValid = (cellStart >= game.min && cellEnd <= game.max);

        if (isValid) {
            el.classList.add('text-green-400', 'bg-green-900/20', 'font-bold', 'border', 'border-green-500/30');
            if (!isFullyValid) {
                // Partial match style (edges of the valid range)
                el.classList.remove('bg-green-900/20');
                el.classList.add('bg-green-900/50');
            }
        } else {
            el.classList.add('text-green-900', 'opacity-20');
        }

        elements.numberGrid.appendChild(el);
    }
}
