import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../../src/game.js';

describe('Game Logic', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        // Mock necessary DOM or external calls if any leak into Game logic
        // For now, Game logic seems mostly pure JS state
        game.log = vi.fn(); // Silence logs
    });

    it('should initialize with default values', () => {
        expect(game.cash).toBe(10);
        expect(game.round).toBe(1);
        expect(game.gameState).toBe('IDLE');
    });

    it('should start a run correctly', () => {
        game.startRun();
        expect(game.cash).toBe(100);
        expect(game.gameState).toBe('PLAYING');
        expect(game.mysteryNumber).toBeGreaterThanOrEqual(0);
        expect(game.mysteryNumber).toBeLessThanOrEqual(99);
    });

    it('should handle correct guesses', () => {
        game.startRun();
        const target = game.mysteryNumber;
        game.makeGuess(target);

        expect(game.gameState).toBe('WON');
        expect(game.cash).toBeGreaterThan(100); // Initial 100 + gain
    });

    it('should handle incorrect guesses', () => {
        game.startRun();
        // Force a miss
        const target = game.mysteryNumber;
        const guess = target === 0 ? 1 : target - 1;

        const initialAttempts = game.attempts;
        game.makeGuess(guess);

        expect(game.attempts).toBe(initialAttempts + 1);
        expect(game.gameState).toBe('PLAYING');
    });

    it('should lose round after max attempts', () => {
        game.startRun();
        game.maxAttempts = 1;

        const target = game.mysteryNumber;
        const guess = target === 0 ? 1 : target - 1;

        game.makeGuess(guess);

        expect(game.gameState).toBe('LOST_ROUND');
    });
});
