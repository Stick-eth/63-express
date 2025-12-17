export function createTooltip() {
    let tooltip = document.getElementById('custom-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.className = 'fixed z-50 hidden bg-black border border-green-500 p-2 text-xs max-w-xs pointer-events-none shadow-lg';
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

export function showTooltip(e, title, desc, rarity, price) {
    const tooltip = createTooltip();
    tooltip.innerHTML = `
        <div class="font-bold text-green-400 mb-1 border-b border-green-800 pb-1 flex justify-between items-center gap-4">
            <span>${title}</span>
            ${rarity ? `<span class="text-[10px] uppercase text-green-600 border border-green-900 px-1">${rarity}</span>` : ''}
        </div>
        <div class="text-green-300 mb-1">${desc}</div>
        ${price ? `<div class="text-yellow-500 text-right text-[10px]">Value: $${price}</div>` : ''}
    `;
    tooltip.classList.remove('hidden');
    moveTooltip(e);
}

export function moveTooltip(e) {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip && !tooltip.classList.contains('hidden')) {
        const x = e.clientX + 15;
        const y = e.clientY + 15;

        // Basic boundary check to prevent overflow
        const rect = tooltip.getBoundingClientRect();
        let finalX = x;
        let finalY = y;

        if (x + rect.width > window.innerWidth) finalX = e.clientX - rect.width - 10;
        if (y + rect.height > window.innerHeight) finalY = e.clientY - rect.height - 10;

        tooltip.style.left = `${finalX}px`;
        tooltip.style.top = `${finalY}px`;
    }
}

export function hideTooltip() {
    const tooltip = document.getElementById('custom-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}
