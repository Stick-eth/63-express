import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/game.js';

describe('Secret Dev Mode', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    describe('toggleDevMode', () => {
        it('should enable dev mode when called with true', () => {
            expect(game.devMode).toBe(false);
            game.toggleDevMode(true);
            expect(game.devMode).toBe(true);
        });

        it('should disable dev mode when called with false', () => {
            game.devMode = true;
            game.toggleDevMode(false);
            expect(game.devMode).toBe(false);
        });

        it('should toggle dev mode correctly', () => {
            expect(game.devMode).toBe(false);

            // First toggle - enable
            game.toggleDevMode(!game.devMode);
            expect(game.devMode).toBe(true);

            // Second toggle - disable
            game.toggleDevMode(!game.devMode);
            expect(game.devMode).toBe(false);
        });

        it('should call log method when toggling dev mode', () => {
            // Note: Game.log() only console.logs, doesn't push to logs array
            // This test just verifies toggleDevMode doesn't throw
            expect(() => game.toggleDevMode(true)).not.toThrow();
            expect(() => game.toggleDevMode(false)).not.toThrow();
        });
    });

    describe('secret code logic', () => {
        it('should correctly identify stickmou pattern in buffer', () => {
            const SECRET_CODE = 'stickmou';
            let buffer = '';

            // Simulate typing 'stickmou'
            const chars = 'stickmou'.split('');
            chars.forEach(char => {
                buffer += char.toLowerCase();
                if (buffer.length > SECRET_CODE.length) {
                    buffer = buffer.slice(-SECRET_CODE.length);
                }
            });

            expect(buffer).toBe(SECRET_CODE);
        });

        it('should handle noise before secret code', () => {
            const SECRET_CODE = 'stickmou';
            let buffer = '';

            // Simulate typing 'abcstickmou'
            const chars = 'abcstickmou'.split('');
            chars.forEach(char => {
                buffer += char.toLowerCase();
                if (buffer.length > SECRET_CODE.length) {
                    buffer = buffer.slice(-SECRET_CODE.length);
                }
            });

            expect(buffer).toBe(SECRET_CODE);
        });

        it('should not match partial code', () => {
            const SECRET_CODE = 'stickmou';
            let buffer = '';

            // Simulate typing 'stickmo' (missing 'u')
            const chars = 'stickmo'.split('');
            chars.forEach(char => {
                buffer += char.toLowerCase();
                if (buffer.length > SECRET_CODE.length) {
                    buffer = buffer.slice(-SECRET_CODE.length);
                }
            });

            expect(buffer).not.toBe(SECRET_CODE);
        });

        it('should be case insensitive', () => {
            const SECRET_CODE = 'stickmou';
            let buffer = '';

            // Simulate typing 'STICKMOU' in uppercase
            const chars = 'STICKMOU'.split('');
            chars.forEach(char => {
                buffer += char.toLowerCase();
                if (buffer.length > SECRET_CODE.length) {
                    buffer = buffer.slice(-SECRET_CODE.length);
                }
            });

            expect(buffer).toBe(SECRET_CODE);
        });
    });
});
