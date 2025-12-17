import { elements } from '../../dom.js';

export function updateStats(game) {
    elements.cashDisplay.textContent = `$${Math.floor(game.cash)}`;
    elements.rentDisplay.textContent = `$${game.rent}`;
    elements.levelDisplay.textContent = game.level;
    elements.roundDisplay.textContent = `${game.round}/${game.maxRounds}`;

    // Visual alert for rent
    if (game.cash < game.rent && game.round === game.maxRounds) {
        elements.rentDisplay.classList.add('animate-pulse', 'text-red-500');
    } else {
        elements.rentDisplay.classList.remove('animate-pulse', 'text-red-500');
        elements.rentDisplay.classList.add('text-red-500');
    }

    renderAttempts(game);
    renderLogs(game);
}

function renderAttempts(game) {
    let attemptsContainer = document.getElementById('large-attempts-display');
    if (!attemptsContainer) {
        attemptsContainer = document.createElement('div');
        attemptsContainer.id = 'large-attempts-display';
        attemptsContainer.className = 'text-center mb-2 py-2 border-b border-green-900/30';

        // Insert before message area
        const messageArea = elements.messageArea || document.getElementById('message-area');
        if (messageArea) {
            messageArea.parentNode.insertBefore(attemptsContainer, messageArea);
        }
    }

    const remaining = game.maxAttempts - game.attempts;
    // Color logic for urgency
    let colorClass = 'text-green-500';
    if (remaining <= 2) colorClass = 'text-red-500 animate-pulse';
    else if (remaining <= 4) colorClass = 'text-yellow-500';

    attemptsContainer.innerHTML = `
        <div class="text-[10px] text-green-800 uppercase tracking-[0.3em] mb-1">SYSTEM INTEGRITY</div>
        <div class="text-5xl font-bold ${colorClass} tracking-tighter drop-shadow-[0_0_5px_rgba(0,255,0,0.2)]">
            ${remaining}<span class="text-xl text-green-900">/${game.maxAttempts}</span>
        </div>
    `;
}

function renderLogs(game) {
    let logsDiv = document.getElementById('system-logs');
    if (!logsDiv) {
        logsDiv = document.createElement('div');
        logsDiv.id = 'system-logs';
        logsDiv.className = 'mt-2 w-full max-w-md mx-auto bg-black border border-green-900 p-2 text-xs text-green-600 max-h-32 overflow-y-auto hidden';

        // Insert after message area
        const messageArea = elements.messageArea || document.getElementById('message-area'); // Fallback if not in dom.js yet
        if (messageArea) {
            messageArea.parentNode.insertBefore(logsDiv, messageArea.nextSibling);
        }
    }

    if (!game.logs || game.logs.length === 0) {
        logsDiv.classList.add('hidden');
    } else {
        logsDiv.classList.remove('hidden');
        logsDiv.innerHTML = '<div class="text-green-500 text-[10px] uppercase tracking-widest mb-1 border-b border-green-900 pb-1">System Logs</div>' +
            game.logs.map(log => `<div class="mb-1 last:mb-0">> ${log}</div>`).join('');
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
}
