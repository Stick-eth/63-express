import { elements } from '../../dom.js';

export function renderAntivirus(game) {
    if (!elements.antivirusScreen) return;

    if (elements.antivirusTimer) elements.antivirusTimer.textContent = `${game.antivirusTimeLeft}s`;
    if (elements.antivirusScore) elements.antivirusScore.textContent = game.antivirusScore;

    // Always update the counter display
    const scansLeft = Math.max(0, game.maxAntivirusScans - game.antivirusScansThisRound);
    let counterEl = document.getElementById('antivirus-counter');
    if (!counterEl && elements.antivirusScreen) {
        counterEl = document.createElement('div');
        counterEl.id = 'antivirus-counter';
        counterEl.className = 'absolute top-2 right-2 p-2 text-xs font-mono text-blue-400 bg-black/50 border border-blue-900/30 rounded z-50';
        elements.antivirusScreen.appendChild(counterEl);
    }
    if (counterEl) {
        counterEl.textContent = `LICENSES_REMAINING: ${scansLeft}/${game.maxAntivirusScans}`;
    }

    if (game.antivirusActive) {
        elements.antivirusStartOverlay.classList.add('hidden');
    } else {
        elements.antivirusStartOverlay.classList.remove('hidden');
        // Reset button text if game over
        if (game.antivirusTimeLeft <= 0) {
            const earned = game.antivirusScore * 2;
            // Check if more scans available
            if (scansLeft <= 0) {
                // No more scans - show gains and exit prompt
                elements.antivirusStartBtn.innerHTML = `<div class="flex flex-col items-center gap-1"><span class="text-green-400 font-bold text-lg">SCAN COMPLETE: +$${earned}</span><span class="text-xs text-yellow-400">NO LICENSES REMAINING</span><span class="text-[10px] opacity-70">> RETURN TO BROWSER</span></div>`;
                elements.antivirusStartBtn.className = "px-8 py-2 bg-black/80 hover:bg-blue-900/30 text-blue-300 border border-blue-500/50 transition-all text-sm backdrop-blur-sm";
                elements.antivirusStartBtn.disabled = false;
            } else {
                // More scans available - show restart option
                elements.antivirusStartBtn.innerHTML = `<div class="flex flex-col items-center gap-1"><span class="text-green-400 font-bold text-lg">SCAN COMPLETE: +$${earned}</span><span class="text-xs opacity-70">> RESTART_SYSTEM</span></div>`;
                elements.antivirusStartBtn.className = "px-8 py-2 bg-black/80 hover:bg-blue-900/30 text-blue-300 border border-blue-500/50 transition-all text-sm backdrop-blur-sm";
                elements.antivirusStartBtn.disabled = false;
            }
        } else {
            if (scansLeft <= 0) {
                elements.antivirusStartBtn.innerHTML = '<div class="flex flex-col items-center"><span class="text-red-400">LICENSE LIMIT EXCEEDED</span><span class="text-[10px] opacity-70">PLEASE RENEW SUBSCRIPTION NEXT ROUND</span></div>';
                elements.antivirusStartBtn.className = "px-8 py-4 bg-gray-800 text-gray-500 font-bold text-xl uppercase tracking-widest border-2 border-gray-600 cursor-not-allowed";
                elements.antivirusStartBtn.disabled = true;
            } else {
                elements.antivirusStartBtn.textContent = '> INITIATE_CLEANUP';
                elements.antivirusStartBtn.className = "px-8 py-4 bg-blue-600 hover:bg-blue-500 text-black font-bold text-xl uppercase tracking-widest border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105";
                elements.antivirusStartBtn.disabled = false;
            }
        }
    }
}

export function spawnAntivirusTarget(game, onClick) {
    if (!elements.antivirusGameArea) return;

    const target = document.createElement('div');
    // Random position
    const area = elements.antivirusGameArea;
    const targetSize = 56; // Increased size (w-14)
    const maxX = area.clientWidth - targetSize;
    const maxY = area.clientHeight - targetSize;

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    target.className = 'absolute w-14 h-14 bg-red-500 rounded-full border-2 border-red-300 cursor-pointer hover:bg-red-400 transition-transform active:scale-90 shadow-[0_0_10px_rgba(239,68,68,0.8)] flex items-center justify-center animate-in-slide';
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    // Icon inside removed

    target.onmousedown = (e) => {
        e.stopPropagation(); // Prevent bubbling
        onClick();

        // Floating text feedback
        const floatText = document.createElement('div');
        floatText.textContent = '+$2';
        floatText.className = 'absolute text-green-400 font-bold text-xl pointer-events-none animate-float-up z-20 drop-shadow-md';
        floatText.style.left = `${target.offsetLeft + 10}px`;
        floatText.style.top = `${target.offsetTop}px`;
        elements.antivirusGameArea.appendChild(floatText);

        setTimeout(() => floatText.remove(), 800);

        target.remove();

        // Spawn particle effect?
        // For now just remove
    };

    elements.antivirusGameArea.appendChild(target);

    // Auto remove after short time (Increased duration: 1s - 1.5s)
    setTimeout(() => {
        if (target.parentNode) target.remove();
    }, 1000 + Math.random() * 500);
}
