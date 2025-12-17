import { settings } from './SettingsManager.js';

export class InputManager {
    constructor() {
        this.rebindTarget = null; // 'grid' | 'numpad' | null
        this.game = null;
        this.elements = null;
        this.actions = {}; // callbacks
    }

    /**
     * Initialize the InputManager with dependencies
     * @param {Game} game - The game instance
     * @param {Object} elements - DOM elements object
     * @param {Object} actions - Map of callbacks (handleGuess, applySettings)
     */
    init(game, elements, actions) {
        this.game = game;
        this.elements = elements;
        this.actions = actions;

        this.setupGlobalListeners();
        this.setupNumpadListeners();
    }

    setupGlobalListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        // 1. Rebinding Logic
        if (this.rebindTarget) {
            e.preventDefault();
            const key = e.key.toLowerCase();
            if (this.rebindTarget === 'grid') {
                settings.gridKey = key;
                if (this.elements.settingKeyBtn) {
                    this.elements.settingKeyBtn.classList.remove('animate-pulse', 'bg-green-900');
                    // Text update is handled by applySettings usually, but we can force it or wait
                }
            } else if (this.rebindTarget === 'numpad') {
                settings.numpadKey = key;
                if (this.elements.settingNumpadKeyBtn) {
                    this.elements.settingNumpadKeyBtn.classList.remove('animate-pulse', 'bg-green-900');
                }
            }

            this.rebindTarget = null;
            settings.saveSettings();

            if (this.actions.applySettings) {
                this.actions.applySettings();
            }
            return;
        }

        // 2. Global Shortcuts (Escape)
        if (e.key === 'Escape') {
            const { pauseOverlay } = this.elements;
            if (pauseOverlay) {
                if (!pauseOverlay.classList.contains('hidden')) {
                    pauseOverlay.classList.add('hidden');
                } else if (this.game && this.game.gameState === 'PLAYING') {
                    pauseOverlay.classList.remove('hidden');
                }
            }
            return;
        }

        // 3. Game specific inputs
        if (this.game && this.game.gameState === 'PLAYING') {
            const gridKey = settings.gridKey.toLowerCase();
            const numpadKey = settings.numpadKey.toLowerCase();
            const inputKey = e.key.toLowerCase();

            // Grid Overlay
            if (inputKey === gridKey && this.elements.gridOverlay) {
                this.elements.gridOverlay.classList.remove('opacity-0', 'pointer-events-none');
            }

            // Numpad Overlay
            if (inputKey === numpadKey && this.elements.numpadOverlay) {
                this.elements.numpadOverlay.classList.remove('hidden');
            }

            // Enter (Submit)
            if (e.key === 'Enter') {
                if (this.elements.numpadOverlay && !this.elements.numpadOverlay.classList.contains('hidden')) {
                    if (this.actions.handleGuess) this.actions.handleGuess();
                    this.elements.numpadOverlay.classList.add('hidden');
                } else {
                    if (this.actions.handleGuess) this.actions.handleGuess();
                }
                return;
            }

            // Auto-focus Input on Number/Backspace
            // Only if not holding modifiers (Ctrl/Alt)
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                if (/^[0-9]$/.test(e.key) || e.key === 'Backspace') {
                    if (this.elements.guessInput && document.activeElement !== this.elements.guessInput) {
                        this.elements.guessInput.focus();
                    }
                }
            }
        }
    }

    onKeyUp(e) {
        if (this.game && this.game.gameState === 'PLAYING') {
            const gridKey = settings.gridKey.toLowerCase();
            const numpadKey = settings.numpadKey.toLowerCase();
            const inputKey = e.key.toLowerCase();

            if (inputKey === gridKey && this.elements.gridOverlay) {
                this.elements.gridOverlay.classList.add('opacity-0', 'pointer-events-none');
            }

            if (inputKey === numpadKey && this.elements.numpadOverlay) {
                this.elements.numpadOverlay.classList.add('hidden');
            }
        }
    }

    setupNumpadListeners() {
        // Virtual Numpad
        const keys = document.querySelectorAll('.numpad-key');
        keys.forEach(key => {
            key.addEventListener('click', () => {
                const value = key.getAttribute('data-key');
                if (value === 'Enter') {
                    if (this.elements.guessBtn) this.elements.guessBtn.click(); // Simulate click or call handleGuess
                    // Better to call handleGuess directly if possible, but click ensures existing logic runs
                    // But we have actions.handleGuess.
                    // Let's use elements.guessBtn.click() if we want to mimic exact original behavior, 
                    // OR this.actions.handleGuess().
                    // Original ui.js used click(). 
                    if (this.elements.numpadOverlay) this.elements.numpadOverlay.classList.add('hidden');
                } else if (value === 'Backspace') {
                    if (this.elements.guessInput)
                        this.elements.guessInput.value = this.elements.guessInput.value.slice(0, -1);
                } else {
                    if (this.elements.guessInput)
                        this.elements.guessInput.value += value;
                }
                if (this.elements.guessInput) this.elements.guessInput.focus();
            });
        });

        // Close on outside click
        if (this.elements.numpadOverlay) {
            this.elements.numpadOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.numpadOverlay) {
                    this.elements.numpadOverlay.classList.add('hidden');
                }
            });
        }
    }

    startRebinding(target) {
        this.rebindTarget = target; // 'grid' or 'numpad'

        // Visual feedback
        if (target === 'grid' && this.elements.settingKeyBtn) {
            this.elements.settingKeyBtn.textContent = '...';
            this.elements.settingKeyBtn.classList.add('animate-pulse', 'bg-green-900');
        } else if (target === 'numpad' && this.elements.settingNumpadKeyBtn) {
            this.elements.settingNumpadKeyBtn.textContent = '...';
            this.elements.settingNumpadKeyBtn.classList.add('animate-pulse', 'bg-green-900');
        }
    }
}

export const inputManager = new InputManager();
