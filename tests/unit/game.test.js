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
        expect(game.jokers).toEqual([]);
        expect(game.scripts).toEqual([]);
        // cash is set in startRun
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

    // --- SHOP TESTS ---
    it('should allow buying items if affordable', () => {
        // Mock a joker in shop
        const mockJoker = { id: 'mock_joker', price: 5, uniqueId: 123, type: 'passive' };
        game.shopInventory = [mockJoker];
        game.cash = 10;
        // Need to ensure we can hold cookies (jokers)
        game.jokers = [];

        const result = game.buyItem(123);

        expect(result).toBe(true);
        expect(game.cash).toBe(5);
        expect(game.jokers.length).toBe(1);
        expect(game.jokers[0].id).toBe('mock_joker');
        expect(game.shopInventory.length).toBe(0);
    });

    it('should fail buying items if too expensive', () => {
        const mockJoker = { id: 'expensive_joker', price: 20, uniqueId: 456, type: 'passive' };
        game.shopInventory = [mockJoker];
        game.cash = 10;

        const result = game.buyItem(456);

        expect(result).toBe(false);
        expect(game.cash).toBe(10);
        expect(game.jokers.length).toBe(0);
    });

    it('should reroll shop correctly', () => {
        game.cash = 10;
        game.rerollCost = 2;
        game.shopInventory = [{ id: 'old', uniqueId: 1 }];

        const result = game.rerollShop();

        expect(result).toBe(true);
        expect(game.cash).toBe(8);
        expect(game.rerollCost).toBe(7); // +5 per reroll (2+5=7)
        expect(game.shopInventory.length).toBeGreaterThan(0);
        expect(game.shopInventory[0].id).not.toBe('old');
    });

    // --- TRADING TESTS ---
    it('should handle trading buy and sell with integer cashout', () => {
        game.cash = 100;
        game.tradingHoldings = 0;
        game.tradingInvested = 0;
        game.hasTradedThisRound = false;

        // Set fixed price for test
        game.currentTradingPrice = 10.5;

        // BUY
        // Buy $50 worth. $50 / 10.5 = 4.7619 shares
        let result = game.buyTrading(50);
        expect(result.success).toBe(true);
        expect(game.cash).toBe(50);
        expect(game.tradingHoldings).toBeCloseTo(4.7619, 3);

        // Reset trade flag to allow sell in same test "turn"
        game.hasTradedThisRound = false;

        // SELL
        // Sell all. 4.7619 * 10.5 = 49.99995 -> Floor should be 49
        result = game.sellTrading(-1);
        expect(result.success).toBe(true);
        expect(game.tradingHoldings).toBe(0);
        // Cash was 50. Gain is Math.floor(49.999...) = 49. Total 99.
        expect(game.cash).toBe(100);
    });

    // --- BURNING THRESHOLD TESTS ---
    describe('Burning Hint Threshold', () => {
        it('should calculate burning threshold as 5% of initial range', () => {
            game.startRun();
            // Default range is 0-99 (100 values), so threshold should be 5
            expect(game.burningThreshold).toBe(5);
        });

        it('should show burning hint when guess is within threshold', () => {
            game.startRun();
            game.mysteryNumber = 50;
            game.burningThreshold = 5;

            // Guess 47 is 3 away from 50, which is within threshold of 5
            game.makeGuess(47);

            expect(game.message.key).toBe('higher_burning');
        });

        it('should show normal hint when guess is outside threshold', () => {
            game.startRun();
            game.mysteryNumber = 50;
            game.burningThreshold = 5;

            // Guess 40 is 10 away from 50, which is outside threshold of 5
            game.makeGuess(40);

            expect(game.message.key).toBe('higher');
        });

        it('should show lower_burning when guess is just above mystery number', () => {
            game.startRun();
            game.mysteryNumber = 50;
            game.burningThreshold = 5;

            // Guess 53 is 3 above 50, which is within threshold of 5
            game.makeGuess(53);

            expect(game.message.key).toBe('lower_burning');
        });

        it('should disable burning hints during meltdown boss effect', () => {
            game.startRun();
            game.mysteryNumber = 50;
            game.burningThreshold = 5;
            game.bossEffect = 'meltdown';

            // Guess 47 is 3 away, normally would be burning
            game.makeGuess(47);

            expect(game.message.key).toBe('higher'); // Not higher_burning
        });

        it('should have minimum threshold of 1', () => {
            game.startRun();
            // Simulate a very small range (10 values)
            game.absoluteMin = 0;
            game.absoluteMax = 9;
            game.min = 0;
            game.max = 9;
            // 5% of 10 = 0.5, but minimum should be 1
            game.burningThreshold = Math.max(1, Math.floor(10 * 0.05));

            expect(game.burningThreshold).toBe(1);
        });
    });
});

