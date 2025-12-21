import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock StorageUtils and TokenManager before importing SkillTreeManager
vi.mock('../../src/utils/StorageUtils.js', () => {
    let mockStorage = {};
    return {
        StorageUtils: {
            getItem: vi.fn((key, defaultValue) => mockStorage[key] ?? defaultValue),
            setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
            getValue: vi.fn((key, defaultValue) => mockStorage[key]?.v ?? defaultValue),
            setValue: vi.fn((key, value) => { mockStorage[key] = { v: value }; }),
            _reset: () => { mockStorage = {}; }
        }
    };
});

vi.mock('../../src/managers/TokenManager.js', () => {
    let tokens = 10;
    return {
        TokenManager: {
            getTokens: vi.fn(() => tokens),
            spendTokens: vi.fn((amount) => {
                if (tokens >= amount) {
                    tokens -= amount;
                    return true;
                }
                return false;
            }),
            updateTokenDisplay: vi.fn(),
            _setTokens: (val) => { tokens = val; },
            _reset: () => { tokens = 10; }
        }
    };
});

import { SkillTreeManager } from '../../src/managers/SkillTreeManager.js';
import { StorageUtils } from '../../src/utils/StorageUtils.js';
import { TokenManager } from '../../src/managers/TokenManager.js';

describe('SkillTreeManager', () => {
    beforeEach(() => {
        // Reset mocks before each test
        StorageUtils._reset();
        TokenManager._reset();
        vi.clearAllMocks();
    });

    describe('getUnlockedSkills', () => {
        it('should return empty array by default', () => {
            const unlocked = SkillTreeManager.getUnlockedSkills();
            expect(unlocked).toEqual([]);
        });

        it('should return stored skills', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'miner_gain_1']);
            const unlocked = SkillTreeManager.getUnlockedSkills();
            expect(unlocked).toEqual(['core', 'miner_gain_1']);
        });
    });

    describe('hasSkill', () => {
        it('should return false for unlocked skill', () => {
            expect(SkillTreeManager.hasSkill('core')).toBe(false);
        });

        it('should return true for unlocked skill', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core']);
            expect(SkillTreeManager.hasSkill('core')).toBe(true);
        });
    });

    describe('canUnlock', () => {
        it('should allow unlocking core with sufficient tokens', () => {
            TokenManager._setTokens(5);
            const result = SkillTreeManager.canUnlock('core');
            expect(result.canUnlock).toBe(true);
        });

        it('should not unlock nonexistent skill', () => {
            const result = SkillTreeManager.canUnlock('fake_skill');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toBe('skill_not_found');
        });

        it('should not unlock already unlocked skill', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core']);
            const result = SkillTreeManager.canUnlock('core');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toBe('already_unlocked');
        });

        it('should not unlock without requirements met', () => {
            TokenManager._setTokens(10);
            const result = SkillTreeManager.canUnlock('miner_gain_1');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toBe('missing_requirements');
        });

        it('should not unlock without enough tokens', () => {
            TokenManager._setTokens(0);
            const result = SkillTreeManager.canUnlock('core');
            expect(result.canUnlock).toBe(false);
            expect(result.reason).toBe('insufficient_tokens');
        });

        it('should allow unlocking branch skill after core', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core']);
            TokenManager._setTokens(5);
            const result = SkillTreeManager.canUnlock('miner_gain_1');
            expect(result.canUnlock).toBe(true);
        });
    });

    describe('unlockSkill', () => {
        it('should unlock core and spend tokens', () => {
            TokenManager._setTokens(5);
            const result = SkillTreeManager.unlockSkill('core');

            expect(result.success).toBe(true);
            expect(TokenManager.spendTokens).toHaveBeenCalledWith(1);
            expect(SkillTreeManager.hasSkill('core')).toBe(true);
        });

        it('should fail if cannot unlock', () => {
            TokenManager._setTokens(0);
            const result = SkillTreeManager.unlockSkill('core');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('insufficient_tokens');
        });

        it('should unlock chain of skills', () => {
            TokenManager._setTokens(100);

            SkillTreeManager.unlockSkill('core');
            expect(SkillTreeManager.hasSkill('core')).toBe(true);

            SkillTreeManager.unlockSkill('miner_gain_1');
            expect(SkillTreeManager.hasSkill('miner_gain_1')).toBe(true);

            SkillTreeManager.unlockSkill('miner_gain_2');
            expect(SkillTreeManager.hasSkill('miner_gain_2')).toBe(true);
        });
    });

    describe('getEffectValue', () => {
        it('should return 0 for no unlocked skills', () => {
            const value = SkillTreeManager.getEffectValue('range_reduce');
            expect(value).toBe(0);
        });

        it('should return effect value for unlocked skill', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'miner_range_1']);
            const value = SkillTreeManager.getEffectValue('range_reduce_flat');
            expect(value).toBe(5); // miner_range_1 has range_reduce_flat: 5
        });

        it('should aggregate multiple skills with same effect', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'miner_gain_1', 'miner_gain_2']);

            const gainMult = SkillTreeManager.getEffectValue('gain_multiplier');
            expect(gainMult).toBe(0.25); // miner_gain_1 (0.10) + miner_gain_2 (0.15)
        });

        it('should return true for boolean effects', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'machine_1']);
            const hasSkipBoot = SkillTreeManager.hasEffect('skip_boot');
            expect(hasSkipBoot).toBe(true);
        });
    });

    describe('hasEffect', () => {
        it('should return false when effect not unlocked', () => {
            expect(SkillTreeManager.hasEffect('skip_boot')).toBe(false);
        });

        it('should return true when effect is unlocked', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'machine_1']);
            expect(SkillTreeManager.hasEffect('skip_boot')).toBe(true);
        });
    });

    describe('isTreeUnlocked', () => {
        it('should return false when core not unlocked', () => {
            expect(SkillTreeManager.isTreeUnlocked()).toBe(false);
        });

        it('should return true when core is unlocked', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core']);
            expect(SkillTreeManager.isTreeUnlocked()).toBe(true);
        });
    });

    describe('getUnlockedCount and getTotalSkillCount', () => {
        it('should return correct counts', () => {
            expect(SkillTreeManager.getUnlockedCount()).toBe(0);
            expect(SkillTreeManager.getTotalSkillCount()).toBe(61); // 1 core + 30 miner + 25 browser + 5 machine

            StorageUtils.setItem('binary_hustle_skills', ['core', 'miner_gain_1']);
            expect(SkillTreeManager.getUnlockedCount()).toBe(2);
        });
    });

    describe('resetAllSkills', () => {
        it('should clear all unlocked skills', () => {
            StorageUtils.setItem('binary_hustle_skills', ['core', 'miner_gain_1', 'browser_1']);
            expect(SkillTreeManager.getUnlockedCount()).toBe(3);

            SkillTreeManager.resetAllSkills();
            expect(SkillTreeManager.getUnlockedCount()).toBe(0);
        });
    });
});
