import { describe, it, expect } from 'vitest';
import { SKILL_JOKERS, getActiveSkillJokers } from '../../src/items/SkillJokers.js';

describe('SkillJokers', () => {
    describe('SKILL_JOKERS structure', () => {
        it('should have jokers for all 50 skills (30 miner + 20 browser)', () => {
            const skillIds = Object.keys(SKILL_JOKERS);
            expect(skillIds.length).toBe(50);
        });

        it('all skill jokers should be marked as hidden', () => {
            Object.values(SKILL_JOKERS).forEach(joker => {
                expect(joker.hidden).toBe(true);
            });
        });

        it('all skill jokers should have required properties', () => {
            Object.values(SKILL_JOKERS).forEach(joker => {
                expect(joker.id).toBeDefined();
                expect(joker.name).toBeDefined();
                expect(joker.name.en).toBeDefined();
                expect(joker.name.fr).toBeDefined();
                expect(joker.icon).toBeDefined();
                expect(joker.description).toBeDefined();
            });
        });

        it('skill jokers should have valid triggers or hooks', () => {
            Object.values(SKILL_JOKERS).forEach(joker => {
                const hasTrigger = Boolean(joker.trigger && joker.execute);
                const hasHooks = Boolean(joker.hooks && Object.keys(joker.hooks).length > 0);
                expect(hasTrigger || hasHooks).toBe(true);
            });
        });
    });

    describe('GAIN sub-branch jokers', () => {
        it('gain_1 should multiply gain by 1.10', () => {
            const joker = SKILL_JOKERS.miner_gain_1;
            expect(joker.trigger).toBe('calculateGain');
            expect(joker.execute(null, 100)).toBe(110);
        });

        it('gain_2 should multiply gain by 1.15', () => {
            const joker = SKILL_JOKERS.miner_gain_2;
            // Note: Math.floor(100 * 1.15) = 114 due to IEEE 754 floating point
            expect(joker.execute(null, 100)).toBe(114);
        });

        it('precision_bonus should add +50 if attempts <= 3', () => {
            const joker = SKILL_JOKERS.miner_gain_3;
            expect(joker.execute({ attempts: 2 }, 100)).toBe(150);
            expect(joker.execute({ attempts: 5 }, 100)).toBe(100);
        });

        it('streak_multiplier should multiply by streak', () => {
            const joker = SKILL_JOKERS.miner_gain_5;
            expect(joker.execute({ winStreak: 0 }, 100)).toBe(100);
            expect(joker.execute({ winStreak: 2 }, 100)).toBe(200);
        });
    });

    describe('RANGE sub-branch jokers', () => {
        it('range_1 should reduce range by 5', () => {
            const joker = SKILL_JOKERS.miner_range_1;
            expect(joker.trigger).toBe('getMaxRange');
            expect(joker.execute(null, 100)).toBe(95);
        });

        it('golden_zone should reduce range by 20%', () => {
            const joker = SKILL_JOKERS.miner_range_5;
            expect(joker.execute(null, 100)).toBe(80);
        });
    });

    describe('ATTEMPTS sub-branch jokers', () => {
        it('attempts_1 should add +1 maxAttempts', () => {
            const joker = SKILL_JOKERS.miner_attempts_1;
            expect(joker.trigger).toBe('onRoundStart');
            const game = { maxAttempts: 7 };
            joker.execute(game);
            expect(game.maxAttempts).toBe(8);
        });

        it('attempts_6 should add +2 maxAttempts', () => {
            const joker = SKILL_JOKERS.miner_attempts_6;
            const game = { maxAttempts: 7 };
            joker.execute(game);
            expect(game.maxAttempts).toBe(9);
        });
    });

    describe('ECONOMY sub-branch jokers', () => {
        it('starting_cash should add +20', () => {
            const joker = SKILL_JOKERS.miner_economy_1;
            expect(joker.trigger).toBe('onRunStart');
            const game = { cash: 100 };
            joker.execute(game);
            expect(game.cash).toBe(120);
        });

        it('rent_reduce_1 should reduce rent by 5%', () => {
            const joker = SKILL_JOKERS.miner_economy_2;
            expect(joker.trigger).toBe('calculateRent');
            expect(joker.execute(null, 100)).toBe(95);
        });

        it('compound_interest should add 3% of cash', () => {
            const joker = SKILL_JOKERS.miner_economy_3;
            expect(joker.trigger).toBe('onWin');
            const game = { cash: 1000 };
            const result = joker.execute(game);
            expect(game.cash).toBe(1030);
            expect(result.message).toContain('30');
        });
    });

    describe('MASTERY sub-branch jokers', () => {
        it('parity_sense should show EVEN/ODD', () => {
            const joker = SKILL_JOKERS.miner_mastery_3;
            expect(joker.trigger).toBe('onRoundStart');

            expect(joker.execute({ mysteryNumber: 42 }).message).toContain('EVEN');
            expect(joker.execute({ mysteryNumber: 43 }).message).toContain('ODD');
        });

        it('binary_search should show optimal guess', () => {
            const joker = SKILL_JOKERS.miner_mastery_5;
            const result = joker.execute({ min: 0, max: 100 });
            expect(result.message).toContain('50');
        });

        it('pattern_recognition should add +5% per unique guess', () => {
            const joker = SKILL_JOKERS.miner_mastery_2;
            expect(joker.execute({ uniqueGuesses: { size: 5 } }, 100)).toBe(125);
        });
    });

    describe('getActiveSkillJokers', () => {
        it('should return empty array for no skills', () => {
            expect(getActiveSkillJokers([])).toEqual([]);
        });

        it('should return matching skill jokers', () => {
            const active = getActiveSkillJokers(['miner_gain_1', 'miner_range_1']);
            expect(active.length).toBe(2);
            expect(active[0].id).toBe('skill_gain_1');
            expect(active[1].id).toBe('skill_range_flat');
        });

        it('should ignore non-miner skills', () => {
            const active = getActiveSkillJokers(['core', 'browser_1', 'miner_gain_1']);
            expect(active.length).toBe(1);
        });
    });
});
