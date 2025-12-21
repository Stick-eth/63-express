import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SKILL_TREE, getSkillsByBranch, getSkillChain, getSkill, getAllSkillIds, getMinerSubBranch, getMinerSubBranches } from '../../src/systems/SkillTreeData.js';

describe('SkillTreeData', () => {
    describe('SKILL_TREE structure', () => {
        it('should have a core skill', () => {
            expect(SKILL_TREE.core).toBeDefined();
            expect(SKILL_TREE.core.id).toBe('core');
            expect(SKILL_TREE.core.cost).toBe(1);
            expect(SKILL_TREE.core.requires).toEqual([]);
        });

        it('should have 30 miner skills, 25 browser skills, 5 machine skills', () => {
            const branches = getSkillsByBranch();
            expect(branches.miner.length).toBe(30);
            expect(branches.browser.length).toBe(25); // 5 old + 20 new
            expect(branches.machine.length).toBe(5);
        });

        it('should have 61 total skills (1 core + 30 miner + 25 browser + 5 machine)', () => {
            const allIds = getAllSkillIds();
            expect(allIds.length).toBe(61);
        });

        it('all skills should have required properties', () => {
            Object.values(SKILL_TREE).forEach(skill => {
                expect(skill.id).toBeDefined();
                expect(skill.name).toBeDefined();
                expect(skill.name.en).toBeDefined();
                expect(skill.name.fr).toBeDefined();
                expect(skill.icon).toBeDefined();
                expect(skill.description).toBeDefined();
                expect(skill.cost).toBeGreaterThan(0);
                expect(Array.isArray(skill.requires)).toBe(true);
                expect(skill.branch).toMatch(/^(core|miner|browser|machine)$/);
                expect(skill.effect).toBeDefined();
            });
        });

        it('all root branch skills should require core', () => {
            // Check miner sub-branches root skills
            ['gain', 'range', 'attempts', 'economy'].forEach(sub => {
                const skill = getSkill(`miner_${sub}_1`);
                expect(skill.requires).toContain('core');
            });
            // Browser sub-branches root skills
            ['shop', 'av', 'trade', 'oc'].forEach(sub => {
                const skill = getSkill(`browser_${sub}_1`);
                expect(skill.requires).toContain('core');
            });
            // Machine
            expect(getSkill('machine_1').requires).toContain('core');
        });
    });

    describe('Miner Sub-branches', () => {
        it('should have 5 sub-branches', () => {
            const subs = getMinerSubBranches();
            expect(subs).toEqual(['gain', 'range', 'attempts', 'economy', 'mastery']);
        });

        it('each sub-branch should have 6 skills', () => {
            getMinerSubBranches().forEach(sub => {
                const skills = getMinerSubBranch(sub);
                expect(skills.length).toBe(6);
            });
        });

        it('gain sub-branch should have correct effect types', () => {
            expect(getSkill('miner_gain_1').effect.type).toBe('gain_multiplier');
            expect(getSkill('miner_gain_3').effect.type).toBe('precision_bonus');
            expect(getSkill('miner_gain_5').effect.type).toBe('streak_multiplier');
        });

        it('range sub-branch should have correct effect types', () => {
            expect(getSkill('miner_range_1').effect.type).toBe('range_reduce_flat');
            expect(getSkill('miner_range_2').effect.type).toBe('range_reduce_percent');
            expect(getSkill('miner_range_3').effect.type).toBe('auto_bisect');
            expect(getSkill('miner_range_5').effect.type).toBe('starting_range_reduce');
        });

        it('attempts sub-branch should have correct effect types', () => {
            expect(getSkill('miner_attempts_1').effect.type).toBe('extra_attempts');
            expect(getSkill('miner_attempts_3').effect.type).toBe('safety_net');
            expect(getSkill('miner_attempts_5').effect.type).toBe('recursion_chance');
        });

        it('economy sub-branch should have correct effect types', () => {
            expect(getSkill('miner_economy_1').effect.type).toBe('starting_cash');
            expect(getSkill('miner_economy_2').effect.type).toBe('rent_reduce');
            expect(getSkill('miner_economy_3').effect.type).toBe('compound_interest');
            expect(getSkill('miner_economy_5').effect.type).toBe('cash_floor');
        });

        it('mastery sub-branch should have correct effect types', () => {
            expect(getSkill('miner_mastery_1').effect.type).toBe('burning_threshold');
            expect(getSkill('miner_mastery_3').effect.type).toBe('parity_sense');
            expect(getSkill('miner_mastery_5').effect.type).toBe('binary_search_hint');
            expect(getSkill('miner_mastery_6').effect.type).toBe('keep_joker');
        });

        it('mastery should require skills from gain and range', () => {
            const masterySub = getSkill('miner_mastery_1');
            expect(masterySub.requires).toContain('miner_gain_2');
            expect(masterySub.requires).toContain('miner_range_2');
        });
    });

    describe('getSkillsByBranch', () => {
        it('should return skills organized by branch', () => {
            const branches = getSkillsByBranch();
            expect(branches).toHaveProperty('core');
            expect(branches).toHaveProperty('miner');
            expect(branches).toHaveProperty('browser');
            expect(branches).toHaveProperty('machine');
        });
    });

    describe('getSkill', () => {
        it('should return skill by ID', () => {
            const skill = getSkill('miner_gain_1');
            expect(skill).toBeDefined();
            expect(skill.id).toBe('miner_gain_1');
        });

        it('should return null for invalid ID', () => {
            const skill = getSkill('nonexistent_skill');
            expect(skill).toBeNull();
        });
    });

    describe('Browser and Machine Skills', () => {
        it('browser skills should have correct effect types', () => {
            expect(getSkill('browser_1').effect.type).toBe('shop_extra_items');
            expect(getSkill('browser_2').effect.type).toBe('unlock_trading');
            expect(getSkill('browser_3').effect.type).toBe('antivirus_time');
            expect(getSkill('browser_4').effect.type).toBe('shop_discount');
            expect(getSkill('browser_5').effect.type).toBe('unlock_all_apps');
        });

        it('machine skills should have correct effect types', () => {
            expect(getSkill('machine_1').effect.type).toBe('skip_boot');
            expect(getSkill('machine_2').effect.type).toBe('show_optimal_hint');
            expect(getSkill('machine_3').effect.type).toBe('free_reroll');
            expect(getSkill('machine_4').effect.type).toBe('token_multiplier');
            expect(getSkill('machine_5').effect.type).toBe('infinite_attempts');
        });
    });

    describe('Skill Costs', () => {
        it('skills should generally increase in cost along sub-branches', () => {
            getMinerSubBranches().forEach(sub => {
                const skills = getMinerSubBranch(sub);
                for (let i = 1; i < skills.length; i++) {
                    expect(skills[i].cost).toBeGreaterThanOrEqual(skills[i - 1].cost);
                }
            });
        });

        it('god mode should be the most expensive skill', () => {
            const godMode = getSkill('machine_5');
            expect(godMode.cost).toBe(50);
        });

        it('perfect memory should be expensive', () => {
            const perfectMemory = getSkill('miner_mastery_6');
            expect(perfectMemory.cost).toBe(30);
        });
    });
});
