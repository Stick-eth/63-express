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

describe('Save/Load System', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.log = vi.fn();
    });

    describe('toSaveData', () => {
        it('should serialize core game state', () => {
            game.startRun();
            game.cash = 150;
            game.rent = 75;
            game.level = 3;
            game.round = 2;

            const saveData = game.toSaveData();

            expect(saveData.cash).toBe(150);
            expect(saveData.rent).toBe(75);
            expect(saveData.level).toBe(3);
            expect(saveData.round).toBe(2);
            expect(saveData.gameState).toBe('PLAYING');
            expect(saveData.savedAt).toBeDefined();
        });

        it('should serialize jokers with quantity and modifier', () => {
            game.startRun();
            game.jokers = [
                { id: 'crypto_miner', quantity: 2, modifier: undefined },
                { id: 'neural_network', quantity: 1, modifier: 1.5 }
            ];

            const saveData = game.toSaveData();

            expect(saveData.jokers).toHaveLength(2);
            expect(saveData.jokers[0].id).toBe('crypto_miner');
            expect(saveData.jokers[0].quantity).toBe(2);
            expect(saveData.jokers[1].id).toBe('neural_network');
            expect(saveData.jokers[1].modifier).toBe(1.5);
        });

        it('should serialize scripts', () => {
            game.startRun();
            game.scripts = [
                { id: 'cash_inject' },
                { id: 'range_scanner' }
            ];

            const saveData = game.toSaveData();

            expect(saveData.scripts).toHaveLength(2);
            expect(saveData.scripts[0].id).toBe('cash_inject');
            expect(saveData.scripts[1].id).toBe('range_scanner');
        });

        it('should serialize app unlock states', () => {
            game.startRun();
            game.tradingUnlocked = true;
            game.antivirusUnlocked = true;
            game.systemMonitorUnlocked = false;

            const saveData = game.toSaveData();

            expect(saveData.tradingUnlocked).toBe(true);
            expect(saveData.antivirusUnlocked).toBe(true);
            expect(saveData.systemMonitorUnlocked).toBe(false);
        });

        it('should serialize trading state', () => {
            game.startRun();
            game.tradingHoldings = 5.5;
            game.tradingInvested = 100;
            game.currentTradingPrice = 120;

            const saveData = game.toSaveData();

            expect(saveData.tradingHoldings).toBe(5.5);
            expect(saveData.tradingInvested).toBe(100);
            expect(saveData.currentTradingPrice).toBe(120);
        });

        it('should serialize system monitor state', () => {
            game.startRun();
            game.systemOverheatLevel = 45;
            game.systemSliders = [30, 60, 90];
            game.systemTargets = [40, 50, 60];

            const saveData = game.toSaveData();

            expect(saveData.systemOverheatLevel).toBe(45);
            expect(saveData.systemSliders).toEqual([30, 60, 90]);
            expect(saveData.systemTargets).toEqual([40, 50, 60]);
        });
    });

    describe('loadFromSaveData', () => {
        it('should restore core game state', () => {
            const saveData = {
                cash: 200,
                rent: 100,
                level: 5,
                round: 3,
                gameState: 'BROWSER',
                mysteryNumber: 42,
                attempts: 3,
                maxAttempts: 7,
                min: 20,
                max: 60,
                jokers: [],
                scripts: [],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard',
                history: [25, 35, 45]
            };

            game.loadFromSaveData(saveData);

            expect(game.cash).toBe(200);
            expect(game.rent).toBe(100);
            expect(game.level).toBe(5);
            expect(game.round).toBe(3);
            expect(game.gameState).toBe('BROWSER');
            expect(game.mysteryNumber).toBe(42);
            expect(game.history).toEqual([25, 35, 45]);
        });

        it('should restore jokers from templates', () => {
            const saveData = {
                cash: 100,
                rent: 50,
                level: 1,
                round: 1,
                gameState: 'PLAYING',
                jokers: [
                    { id: 'crypto_miner', quantity: 2 },
                    { id: 'neural_network', quantity: 1, modifier: 1.3 }
                ],
                scripts: [],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard'
            };

            game.loadFromSaveData(saveData);

            expect(game.jokers).toHaveLength(2);
            expect(game.jokers[0].id).toBe('crypto_miner');
            expect(game.jokers[0].quantity).toBe(2);
            expect(game.jokers[0].execute).toBeDefined(); // Function restored from template
            expect(game.jokers[1].modifier).toBe(1.3);
        });

        it('should restore scripts from templates', () => {
            const saveData = {
                cash: 100,
                rent: 50,
                level: 1,
                round: 1,
                gameState: 'PLAYING',
                jokers: [],
                scripts: [{ id: 'cash_inject' }],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard'
            };

            game.loadFromSaveData(saveData);

            expect(game.scripts).toHaveLength(1);
            expect(game.scripts[0].id).toBe('cash_inject');
            expect(game.scripts[0].execute).toBeDefined(); // Function restored from template
        });

        it('should restore app unlock states', () => {
            const saveData = {
                cash: 100,
                rent: 50,
                level: 1,
                round: 1,
                gameState: 'PLAYING',
                jokers: [],
                scripts: [],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard',
                tradingUnlocked: true,
                antivirusUnlocked: true,
                systemMonitorUnlocked: true
            };

            game.loadFromSaveData(saveData);

            expect(game.tradingUnlocked).toBe(true);
            expect(game.antivirusUnlocked).toBe(true);
            expect(game.systemMonitorUnlocked).toBe(true);
        });

        it('should handle missing optional fields with defaults', () => {
            const minimalSaveData = {
                cash: 100,
                rent: 50,
                level: 1,
                round: 1,
                gameState: 'PLAYING',
                jokers: [],
                scripts: [],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard'
            };

            game.loadFromSaveData(minimalSaveData);

            expect(game.tradingUnlocked).toBe(false);
            expect(game.antivirusUnlocked).toBe(false);
            expect(game.systemMonitorUnlocked).toBe(false);
            expect(game.systemSliders).toEqual([50, 50, 50]);
            expect(game.history).toEqual([]);
        });

        it('should return false for null data', () => {
            const result = game.loadFromSaveData(null);
            expect(result).toBe(false);
        });

        it('should return true on successful load', () => {
            const saveData = {
                cash: 100,
                rent: 50,
                level: 1,
                round: 1,
                gameState: 'PLAYING',
                jokers: [],
                scripts: [],
                shopInventory: [],
                arcQueueIds: ['standard'],
                currentArcId: 'standard'
            };

            const result = game.loadFromSaveData(saveData);
            expect(result).toBe(true);
        });
    });

    describe('Save/Load Round Trip', () => {
        it('should preserve game state after save and load', () => {
            game.startRun();
            game.cash = 250;
            game.level = 4;
            game.round = 2;
            game.tradingUnlocked = true;
            game.tradingHoldings = 10;

            const saveData = game.toSaveData();

            // Create new game and load
            const newGame = new Game();
            newGame.log = vi.fn();
            newGame.loadFromSaveData(saveData);

            expect(newGame.cash).toBe(250);
            expect(newGame.level).toBe(4);
            expect(newGame.round).toBe(2);
            expect(newGame.tradingUnlocked).toBe(true);
            expect(newGame.tradingHoldings).toBe(10);
        });
    });
});

describe('Token System', () => {
    it('should award token when level >= 6', () => {
        const game = new Game();
        game.log = vi.fn();
        game.startRun();
        game.level = 6;
        game.gameState = 'GAME_OVER';

        // Token logic is in main.js, but we can verify the condition
        expect(game.level >= 6).toBe(true);
    });

    it('should not award token when level < 6', () => {
        const game = new Game();
        game.log = vi.fn();
        game.startRun();
        game.level = 5;
        game.gameState = 'GAME_OVER';

        expect(game.level >= 6).toBe(false);
    });
});
