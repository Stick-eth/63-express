import './style.css'
import { Game } from './game.js'

const game = new Game();

// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const rebirthDisplay = document.getElementById('rebirth-display');
const messageText = document.getElementById('message-text');
const startBtn = document.getElementById('start-btn');
const startArea = document.getElementById('start-area');
const betInput = document.getElementById('bet-input');
const gameInput = document.getElementById('game-input');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const attemptsArea = document.getElementById('attempts-area');
const multipliersArea = document.getElementById('multipliers-area');
const historyWheel = document.getElementById('history-wheel');

// Update Stats UI
function updateStats() {
  moneyDisplay.textContent = `${game.money} €`;
  rebirthDisplay.textContent = game.rebirths;
}

// Update History Wheel
function updateHistory() {
  historyWheel.innerHTML = '';
  
  if (game.gameState === 'IDLE' && game.history.length === 0) {
      // Optional: Show placeholder or nothing
      return;
  }

  // We want to show the history.
  game.history.forEach((guess, index) => {
    const el = document.createElement('div');
    
    // Reverse index for opacity calculation: 0 = latest
    const reverseIndex = game.history.length - 1 - index;
    
    // Adjusted for better visibility of older items
    let opacity = Math.max(0.4, 1 - (reverseIndex * 0.15));
    let scale = Math.max(0.85, 1 - (reverseIndex * 0.05));
    
    // Determine hint
    let hint = '';
    let hintClass = 'text-zinc-500';
    
    if (game.mysteryNumber !== null) {
        if (guess < game.mysteryNumber) {
            hint = '↑ C\'est plus';
            hintClass = 'text-emerald-500/70';
        } else if (guess > game.mysteryNumber) {
            hint = '↓ C\'est moins';
            hintClass = 'text-red-500/70';
        } else {
            hint = '= Gagné';
            hintClass = 'text-emerald-400 font-bold';
        }
    }

    el.className = `flex items-center gap-3 transition-all duration-500 transform`;
    el.style.opacity = opacity;
    el.style.transform = `scale(${scale})`;
    
    // Add animation for the newest element
    if (index === game.history.length - 1) {
        el.classList.add('animate-in-slide');
    }

    el.innerHTML = `
        <span class="text-2xl font-mono font-bold text-zinc-300">${guess}</span>
        <span class="text-xs uppercase tracking-wider ${hintClass}">${hint}</span>
    `;
    
    historyWheel.appendChild(el);
  });
}

// Update Multipliers UI
function updateMultipliers() {
  multipliersArea.innerHTML = '';
  if (game.gameState === 'PLAYING') {
    multipliersArea.classList.remove('hidden');
    
    game.multipliers.forEach((mult, index) => {
        const el = document.createElement('div');
        const isCurrent = index === game.attempts;
        const isPast = index < game.attempts;
        
        let classes = 'flex flex-col items-center transition-all duration-300 ';
        
        // Base scale based on multiplier value (index 0 is biggest)
        let baseScale = 1.2 - (index * 0.08);
        
        if (isCurrent) {
            classes += 'font-bold z-10 ';
            if (index === 0) {
                // x10: Rainbow
                classes += 'text-rainbow animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-125';
            } else if (index === 1) {
                // x5: Flame/Orange
                classes += 'text-flame scale-115 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]';
            } else if (index === 2) {
                // x3: Yellow/Gold
                classes += 'text-yellow-400 scale-110 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]';
            } else if (index === 3) {
                // x2: Blue
                classes += 'text-blue-400 scale-105';
            } else {
                // x1.2, x1: Standard Emerald
                classes += 'text-emerald-400 scale-105';
            }
        } else if (isPast) {
            classes += 'opacity-20 text-zinc-600 grayscale';
            baseScale *= 0.8; // Shrink past items
        } else {
            classes += 'text-zinc-600';
        }

        el.className = classes;
        
        // Apply scale via style if not current (current has specific scale classes)
        if (!isCurrent) {
            el.style.transform = `scale(${baseScale})`;
        }

        el.innerHTML = `
            <span class="text-[0.6rem] uppercase tracking-wider mb-0.5 opacity-70">Essai ${index + 1}</span>
            <span class="text-lg font-mono leading-none">x${mult}</span>
        `;
        multipliersArea.appendChild(el);
    });

  } else {
    multipliersArea.classList.add('hidden');
  }
}

// Update Attempts UI
function updateAttempts() {
  attemptsArea.innerHTML = '';
  if (game.gameState === 'PLAYING') {
    attemptsArea.classList.remove('hidden');
    for (let i = 0; i < game.maxAttempts; i++) {
      const dot = document.createElement('div');
      dot.className = `w-3 h-3 rounded-full transition-colors ${
        i < game.attempts ? 'bg-zinc-700' : 'bg-emerald-500'
      }`;
      attemptsArea.appendChild(dot);
    }
  } else {
    attemptsArea.classList.add('hidden');
  }
}

// Start Game
startBtn.addEventListener('click', () => {
  const bet = betInput.value;
  if (game.startNewGame(bet)) {
    updateUI();
    startArea.classList.add('hidden');
    gameInput.classList.remove('hidden');
    guessInput.value = '';
    guessInput.focus();
  } else {
    // Bankruptcy handled in game logic but we need to show message
    updateUI();
  }
});

// Make Guess
function handleGuess() {
  const val = guessInput.value;
  if (!val) return;
  
  game.makeGuess(val);
  updateUI();
  
  if (game.gameState !== 'PLAYING') {
    gameInput.classList.add('hidden');
    startArea.classList.remove('hidden');
    startBtn.textContent = game.gameState === 'WON' ? 'Rejouer' : 'Réessayer';
  } else {
    guessInput.value = '';
    guessInput.focus();
  }
}

guessBtn.addEventListener('click', handleGuess);
guessInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleGuess();
});

// General UI Update
function updateUI() {
  updateStats();
  messageText.textContent = game.message;
  
  // Colorize message based on content
  if (game.message.includes('gagn�')) {
    messageText.className = 'text-lg font-bold text-emerald-400';
  } else if (game.message.includes('Perdu')) {
    messageText.className = 'text-lg font-bold text-red-400';
  } else {
    messageText.className = 'text-lg font-medium text-zinc-300';
  }
  
  updateAttempts();
  updateMultipliers();
  updateHistory();
}

// Initial Load
updateUI();
