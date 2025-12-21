import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock SkillTreeManager before importing Game
vi.mock('../../src/managers/SkillTreeManager.js', () => ({
    SkillTreeManager: {
        getEffectValue: vi.fn(() => 0),
        hasEffect: vi.fn(() => false),
        hasSkill: vi.fn(() => false),
        getUnlockedSkills: vi.fn(() => [])
    }
}));

import { Game } from '../../src/game.js';
import { JOKERS, SCRIPTS } from '../../src/items.js';

describe('Item Logic', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.log = vi.fn();
        game.startRun();
    });

    it('should apply Crypto Miner effect (Multiplier)', () => {
        // Crypto Miner: Gain +50% per unused attempt
        const miner = JOKERS.find(j => j.id === 'crypto_miner');
        game.jokers.push(miner);

        // Assume round won on attempt 1. Total 7. Unused 6.
        // Base Gain assumption: 200 (attempt 0 in array? no, attempt count is 1)
        // Wait, game attempts is 1 after 1 guess.
        // Unused = 7 - 1 = 6.
        // Multiplier = 1 + (0.5 * 6) = 1 + 3 = 4x.

        game.attempts = 1;
        const baseGain = 200;
        const newGain = game.triggerJokers('calculateGain', baseGain);

        expect(newGain).toBe(baseGain * 4);
    });

    it('should apply Glitch Hunter effect (3 or 7)', () => {
        const scanner = JOKERS.find(j => j.id === 'glitch_hunter');
        game.jokers.push(scanner);

        game.mysteryNumber = 32;
        game.triggerJokers('onRoundStart');
        // We can't easily check internal hook result return without mocking logs or message, 
        // but let's assume if it doesn't crash it works?
        // Better: check execute return value manually
        const res3 = scanner.execute(game);
        expect(res3).toBeTruthy();
        expect(res3.message).toContain('GLITCH');

        game.mysteryNumber = 71;
        const res7 = scanner.execute(game);
        expect(res7).toBeTruthy();

        game.mysteryNumber = 42; // No 3 or 7
        const res42 = scanner.execute(game);
        expect(res42).toBeUndefined();
    });

    it('should apply Lazy Dev effect', () => {
        const lazy = JOKERS.find(j => j.id === 'lazy_dev');
        game.jokers.push(lazy);

        // 1. Check Max Attempts Reduced
        const initialMax = game.maxAttempts; // 7
        game.triggerJokers('onRoundStart');
        // 7 * 0.75 = 5.25 -> floor 5
        expect(game.maxAttempts).toBe(5);

        // 2. Check Gain Halved
        const gain = game.triggerJokers('calculateGain', 100);
        expect(gain).toBe(50);

        // 3. check RNG (manual call to hook)
        expect(lazy.hooks.rng_validation(game, 20)).toBe(true);
        expect(lazy.hooks.rng_validation(game, 25)).toBe(false);
    });

    it('should apply Spaghetti Code effect', () => {
        const spag = JOKERS.find(j => j.id === 'spaghetti_code');
        game.jokers.push(spag);

        const baseGain = 100;
        const newGain = game.triggerJokers('calculateGain', baseGain);

        expect(newGain).toBe(baseGain + 1000);
    });

    it('should apply The Optimist effect', () => {
        // Optimist: Gain x12 on attempt 6 or 7
        const optimist = JOKERS.find(j => j.id === 'optimist');
        game.jokers.push(optimist);

        game.attempts = 6;

        const baseGain = 5;
        const newGain = game.triggerJokers('calculateGain', baseGain);

        expect(newGain).toBe(baseGain * 12);
    });

    it('should execute scripts correctly (cash_inject)', () => {
        const cashInject = SCRIPTS.find(s => s.id === 'cash_inject');
        game.scripts.push(cashInject);

        const initialCash = game.cash;
        const initialMaxAttempts = game.maxAttempts; // 7

        // cash_inject: +25 cash, -1 max attempt
        game.useScript(0);

        expect(game.cash).toBe(initialCash + 25);
        expect(game.maxAttempts).toBe(initialMaxAttempts - 1);
        expect(game.scripts.length).toBe(0); // Consumed
    });

    it('should apply Root Access effect (1.5x reduction, randomized)', () => {
        const root = JOKERS.find(j => j.id === 'root_access');

        // Mock game state
        game.min = 0;
        game.max = 100;
        game.mysteryNumber = 50;

        // Run logic
        root.execute(game);

        const newRange = game.max - game.min;
        // Expected reduction: 100 / 1.5 = 66.6 -> floor 66
        const expectedSize = Math.floor(100 / 1.5);

        expect(newRange).toBe(expectedSize);
        expect(game.min).toBeLessThan(game.max);
        expect(game.mysteryNumber).toBeGreaterThanOrEqual(game.min);
        expect(game.mysteryNumber).toBeLessThanOrEqual(game.max);
    });

    it('should update Neural Network modifier', () => {
        const neural = JOKERS.find(j => j.id === 'neural_network');
        game.jokers.push({ ...neural }); // Clone to avoid modifying global singleton state if mutated (though factory usually handles this)
        const instance = game.jokers[0];

        // x0.1 per round
        instance.execute(game, null, instance);
        expect(instance.modifier).toBeCloseTo(1.1);

        instance.execute(game, null, instance);
        expect(instance.modifier).toBeCloseTo(1.2);
    });

    it('should apply Bug Bounty effect', () => {
        const bugBounty = JOKERS.find(j => j.id === 'bug_bounty');
        game.rent = 200; // 2% of 200 = 4, but min is 5

        // 2% of Rent on win (Min $5)
        const initialCash = game.cash;
        bugBounty.execute(game);
        expect(game.cash).toBe(initialCash + 5); // Min $5

        // Test with higher rent
        game.rent = 500; // 2% of 500 = 10
        const cashBefore = game.cash;
        bugBounty.execute(game);
        expect(game.cash).toBe(cashBefore + 10);
    });


    it('should apply Dark Web effect (Interest)', () => {
        const darkWeb = JOKERS.find(j => j.id === 'dark_web');
        // 2% per $10, capped at $50

        game.cash = 200; // Expected: 4
        let result = darkWeb.execute(game);
        expect(game.cash).toBe(204);

        // Cap check
        game.cash = 10000; // Expected 200 -> but capped at 50
        const cashBefore = game.cash;
        result = darkWeb.execute(game);
        expect(game.cash).toBe(cashBefore + 50);
    });
});
