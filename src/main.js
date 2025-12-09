import './style.css'
import { Game } from './game.js'
import { t, setLanguage, initLanguage, getLanguage } from './i18n.js'

const game = new Game();

// DOM Elements
const langSelect = document.getElementById('lang-select');
const moneyDisplay = document.getElementById('money-display');
const rebirthDisplay = document.getElementById('rebirth-display');
const messageText = document.getElementById('message-text');
const startBtn = document.getElementById('start-btn');
const startArea = document.getElementById('start-area');
const betInput = document.getElementById('bet-input');
const gameInput = document.getElementById('game-input');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const jokerBtn = document.getElementById('joker-btn');
const attemptsArea = document.getElementById('attempts-area');
const multipliersArea = document.getElementById('multipliers-area');
const historyWheel = document.getElementById('history-wheel');
const helpIcon = document.getElementById('help-icon');
const gridOverlay = document.getElementById('grid-overlay');
const numberGrid = document.getElementById('number-grid');

// Update Stats UI
function updateStats() {
  moneyDisplay.textContent = `${game.money} €`;
  rebirthDisplay.textContent = game.rebirths;
}

function updateStaticTexts() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
}

// Update Grid
function updateGrid() {
  numberGrid.innerHTML = '';
  
  const mysteryParity = game.mysteryNumber !== null ? game.mysteryNumber % 2 : null;

  for (let i = 0; i < 100; i++) {
      const el = document.createElement('div');
      el.textContent = i;
      el.className = 'text-[0.6rem] font-mono flex items-center justify-center h-6 rounded transition-colors ';
      
      let isValid = true;
      
      // Check bounds
      if (i < game.min || i > game.max) {
          isValid = false;
      }
      
      // Check Joker parity
      if (game.jokerUsed && mysteryParity !== null) {
          if (i % 2 !== mysteryParity) {
              isValid = false;
          }
      }

      if (isValid) {
          el.classList.add('text-emerald-400', 'bg-emerald-900/20', 'font-bold', 'border', 'border-emerald-500/30');
      } else {
          el.classList.add('text-zinc-700', 'opacity-30');
      }
      
      numberGrid.appendChild(el);
  }
}

// Help Icon Events
function showGrid() {
    gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
}

function hideGrid() {
    gridOverlay.classList.add('opacity-0', 'pointer-events-none');
}

// Desktop (Hover)
helpIcon.addEventListener('mouseenter', showGrid);
helpIcon.addEventListener('mouseleave', hideGrid);

// Mobile (Touch)
helpIcon.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent mouse emulation
    showGrid();
});

helpIcon.addEventListener('touchend', (e) => {
    e.preventDefault();
    hideGrid();
});

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
    let opacity = Math.max(0, 1 - (reverseIndex * 0.2));
    let scale = Math.max(0.85, 1 - (reverseIndex * 0.05));
    
    if (opacity <= 0) return; // Don't render invisible items
    
    // Determine hint
    let hint = '';
    let hintClass = 'text-zinc-500';
    
    if (game.mysteryNumber !== null) {
        if (guess < game.mysteryNumber) {
            hint = t('hint_higher');
            hintClass = 'text-emerald-500/70';
        } else if (guess > game.mysteryNumber) {
            hint = t('hint_lower');
            hintClass = 'text-red-500/70';
        } else {
            hint = t('hint_won');
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
                // x5: Orange (Classic)
                classes += 'text-orange-400 scale-110';
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
    startBtn.textContent = game.gameState === 'WON' ? t('play_again') : t('play_again');
  } else {
    guessInput.value = '';
    guessInput.focus();
  }
}

guessBtn.addEventListener('click', handleGuess);
jokerBtn.addEventListener('click', () => {
    game.useJoker();
    updateUI();
    if (game.gameState !== 'PLAYING') {
        gameInput.classList.add('hidden');
        startArea.classList.remove('hidden');
        startBtn.textContent = t('play_again');
    }
});
guessInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleGuess();
});

// General UI Update
function updateUI() {
  updateStats();
  
  // Handle message object
  if (game.message && typeof game.message === 'object') {
    // Translate params if needed (specifically parity)
    let params = { ...game.message.params };
    if (params.parity) {
        params.parity = t(params.parity);
    }

    // Always show message now, as it contains Croupier info
    messageText.textContent = t(game.message.key, params);
    messageText.style.opacity = '1';
    
    // Colorize message based on content key
    if (game.message.key === 'won') {
      messageText.className = 'text-lg font-bold text-emerald-400';
    } else if (game.message.key === 'lost' || game.message.key === 'lost_joker') {
      messageText.className = 'text-lg font-bold text-red-400';
    } else if (game.message.key.includes('burning')) {
      messageText.className = 'text-lg font-bold text-orange-500 animate-pulse';
    } else {
      messageText.className = 'text-lg font-medium text-zinc-300';
    }
  } else {
    messageText.textContent = '';
  }
  
  // Joker Button State
  if (game.gameState === 'PLAYING') {
      helpIcon.classList.remove('hidden');
      if (game.jokerUsed) {
          jokerBtn.disabled = true;
          jokerBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
          jokerBtn.disabled = false;
          jokerBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
  } else {
      helpIcon.classList.add('hidden');
  }

  updateAttempts();
  updateMultipliers();
  updateHistory();
  updateGrid();
}

// Language Switcher
langSelect.addEventListener('change', (e) => {
  setLanguage(e.target.value);
  updateStaticTexts();
  updateUI();
  // Update button text if game is over
  if (game.gameState !== 'PLAYING' && game.gameState !== 'IDLE') {
     startBtn.textContent = t('play_again');
  } else if (game.gameState === 'IDLE') {
     startBtn.textContent = t('start_game');
  }
});

// Initial Load
const currentLang = initLanguage();
langSelect.value = currentLang;
updateStaticTexts();
updateUI();
