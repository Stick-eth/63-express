import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../../src/game.js';

describe('Save System Bug Fixes', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.log = vi.fn(); // Mock console.log/UI updates if needed
    });

    describe('System Logs Persistence', () => {
        it('should persist logs across save/load', () => {
            game.logs = ['Log 1', 'Log 2'];

            const saveData = game.toSaveData();

            const newGame = new Game();
            newGame.loadFromSaveData(saveData);

            expect(newGame.logs).toHaveLength(2);
            expect(newGame.logs).toContain('Log 1');
            expect(newGame.logs).toContain('Log 2');
        });
    });

    describe('Resume Message', () => {
        it('should include rent in resume message params', () => {
            game.startRun();
            game.rent = 1500;
            // Advance state so it's not "start of round" (attempts > 0)
            game.attempts = 1;

            const saveData = game.toSaveData();

            const newGame = new Game();
            newGame.loadFromSaveData(saveData);

            expect(newGame.message.key).toBe('resume_game');
            expect(newGame.message.params).toBeDefined();
            expect(newGame.message.params.rent).toBe(1500);
        });
    });

    describe('Checksum Log Persistence', () => {
        it('should add logs to game.logs when triggered', () => {
            game.logs = [];
            // Mock a joker that triggers a log
            const mockJoker = {
                trigger: 'testTrigger',
                execute: () => ({ message: 'Checksum Verified' })
            };
            game.jokers = [mockJoker];

            // Trigger it
            game.triggerJokers('testTrigger');

            expect(game.logs).toContain('Checksum Verified');

            // Verify persistence
            const saveData = game.toSaveData();
            const newGame = new Game();
            newGame.loadFromSaveData(saveData);

            expect(newGame.logs).toContain('Checksum Verified');
        });
    });
});
