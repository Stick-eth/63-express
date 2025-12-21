/**
 * SkillTreeManager - Manages persistent skill unlocks
 * Uses StorageUtils for obfuscated localStorage persistence
 */

import { StorageUtils } from '../utils/StorageUtils.js';
import { SKILL_TREE, getSkill } from '../systems/SkillTreeData.js';
import { TokenManager } from './TokenManager.js';

const SKILLS_KEY = 'binary_hustle_skills';

export class SkillTreeManager {
    /**
     * Get all unlocked skill IDs
     * @returns {string[]}
     */
    static getUnlockedSkills() {
        return StorageUtils.getItem(SKILLS_KEY, []);
    }

    /**
     * Check if a specific skill is unlocked
     * @param {string} skillId 
     * @returns {boolean}
     */
    static hasSkill(skillId) {
        const unlocked = this.getUnlockedSkills();
        return unlocked.includes(skillId);
    }

    /**
     * Check if a skill can be unlocked (has requirements met and enough tokens)
     * @param {string} skillId 
     * @returns {{ canUnlock: boolean, reason?: string }}
     */
    static canUnlock(skillId) {
        const skill = getSkill(skillId);
        if (!skill) {
            return { canUnlock: false, reason: 'skill_not_found' };
        }

        // Already unlocked?
        if (this.hasSkill(skillId)) {
            return { canUnlock: false, reason: 'already_unlocked' };
        }

        // Check requirements
        const unlocked = this.getUnlockedSkills();
        const missingReqs = skill.requires.filter(req => !unlocked.includes(req));
        if (missingReqs.length > 0) {
            return { canUnlock: false, reason: 'missing_requirements', missing: missingReqs };
        }

        // Check tokens
        const tokens = TokenManager.getTokens();
        if (tokens < skill.cost) {
            return { canUnlock: false, reason: 'insufficient_tokens', have: tokens, need: skill.cost };
        }

        return { canUnlock: true };
    }

    /**
     * Unlock a skill, spending the required tokens
     * @param {string} skillId 
     * @returns {{ success: boolean, reason?: string }}
     */
    static unlockSkill(skillId) {
        const check = this.canUnlock(skillId);
        if (!check.canUnlock) {
            return { success: false, reason: check.reason };
        }

        const skill = getSkill(skillId);

        // Spend tokens
        TokenManager.spendTokens(skill.cost);

        // Add to unlocked list
        const unlocked = this.getUnlockedSkills();
        unlocked.push(skillId);
        StorageUtils.setItem(SKILLS_KEY, unlocked);

        return { success: true };
    }

    /**
     * Get the effect value for a specific effect type (aggregates from all unlocked skills)
     * @param {string} effectType 
     * @returns {number|boolean}
     */
    static getEffectValue(effectType) {
        const unlocked = this.getUnlockedSkills();
        let total = 0;

        unlocked.forEach(skillId => {
            const skill = getSkill(skillId);
            if (skill && skill.effect) {
                // Handle primary effect type
                if (skill.effect.type === effectType) {
                    if (typeof skill.effect.value === 'number') {
                        total += skill.effect.value;
                    } else {
                        // Boolean effect - just mark as 1 (true)
                        total = 1;
                    }
                }
                // Handle complex effects with named properties (e.g., financial_freedom)
                if (skill.effect[effectType] !== undefined) {
                    total += skill.effect[effectType];
                }
            }
        });

        return total;
    }

    /**
     * Check if a boolean effect is active
     * @param {string} effectType 
     * @returns {boolean}
     */
    static hasEffect(effectType) {
        const unlocked = this.getUnlockedSkills();

        for (const skillId of unlocked) {
            const skill = getSkill(skillId);
            if (skill && skill.effect) {
                if (skill.effect.type === effectType) {
                    return true;
                }
                if (skill.effect[effectType] !== undefined) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get total count of unlocked skills
     * @returns {number}
     */
    static getUnlockedCount() {
        return this.getUnlockedSkills().length;
    }

    /**
     * Get total count of all skills
     * @returns {number}
     */
    static getTotalSkillCount() {
        return Object.keys(SKILL_TREE).length;
    }

    /**
     * Reset all skills (for debugging/testing)
     */
    static resetAllSkills() {
        StorageUtils.setItem(SKILLS_KEY, []);
    }

    /**
     * Check if skill tree is initialized (core unlocked)
     * @returns {boolean}
     */
    static isTreeUnlocked() {
        return this.hasSkill('core');
    }
}
