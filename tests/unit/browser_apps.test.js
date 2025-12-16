import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../../src/game.js';
import { ARCS } from '../../src/arcs.js';

describe('Browser Apps', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.log = vi.fn();
        game.startRun();
        // Move to browser state for app testing
        game.gameState = 'BROWSER';
    });

    describe('Navigation', () => {
        it('should open SHOP app', () => {
            game.openApp('SHOP');
            expect(game.gameState).toBe('SHOP');
        });

        it('should close SHOP app', () => {
            game.gameState = 'SHOP';
            game.closeApp();
            expect(game.gameState).toBe('BROWSER');
        });

        it('should NOT open locked apps (Trading)', () => {
            game.tradingUnlocked = false;
            game.openApp('TRADING');
            expect(game.gameState).toBe('BROWSER');
        });

        it('should NOT open locked apps (Antivirus)', () => {
            game.antivirusUnlocked = false;
            game.openApp('ANTIVIRUS');
            expect(game.gameState).toBe('BROWSER');
        });
    });

    describe('Trading App', () => {
        it('should unlock Trading App after Audit arc', () => {
            // Setup: Current arc is Audit, and we finish it.
            // Assuming finish condition triggers in enterNewMonth or similar
            // We need to trace how arc completion works exactly.
            // Based on analysis: enterNewMonth checks if arc is finished.

            // Find Audit Arc
            const auditArc = ARCS.find(a => a.id === 'audit');
            game.currentArc = auditArc;
            game.monthInArc = auditArc.duration + 1; // Finished
            game.level = 5; // Arbitrary level

            // Trigger month transition
            game.enterNewMonth();

            // We expect tradingUnlocked to be true
            // NOTE: This test might fail if the logic is missing!
            expect(game.tradingUnlocked).toBe(true);
        });

        it('should open Trading App when unlocked', () => {
            game.tradingUnlocked = true;
            game.openApp('TRADING');
            expect(game.gameState).toBe('TRADING');
        });

        it('should handle buy/sell logic', () => {
            game.tradingUnlocked = true;
            game.openApp('TRADING');
            game.cash = 1000;
            // Mock price
            game.getTradingPrice = () => 100;

            // Buy
            game.buyTrading(500);
            expect(game.cash).toBe(500);
            expect(game.tradingHoldings).toBe(5);

            // Sell
            game.hasTradedThisRound = false; // Reset restriction
            game.sellTrading(-1); // Sell all
            expect(game.cash).toBe(1000); // 5 * 100
        });
    });

    describe('Antivirus App', () => {
        it('should unlock Antivirus App 1 month after Ransomware arc', () => {
            // Logic in game.js: if (this.ransomwareFinishedLevel && this.level >= this.ransomwareFinishedLevel + 1)

            // 1. Finish Ransomware
            const ransomArc = ARCS.find(a => a.id === 'ransomware');
            game.currentArc = ransomArc;
            game.monthInArc = ransomArc.duration + 1;
            game.level = 10;

            game.enterNewMonth();
            // Now ransomwareFinishedLevel should be 11 (game.level was incremented to 11 inside enterNewMonth)
            expect(game.ransomwareFinishedLevel).toBe(11);

            // Antivirus unlocks 1 month *after*. (level >= finished + 1)
            // Current level is 11. finished is 11. 11 >= 11+1 (12)? False.
            expect(game.antivirusUnlocked).toBeFalsy();

            // 2. Next Month
            game.enterNewMonth(); // Level becomes 12
            expect(game.level).toBe(12);
            expect(game.antivirusUnlocked).toBe(true);
        });

        it('should play antivirus game', () => {
            game.antivirusUnlocked = true;
            game.openApp('ANTIVIRUS');

            const startRes = game.startAntivirusGame();
            expect(startRes.success).toBe(true);
            expect(game.antivirusActive).toBe(true);

            const invalidRes = game.startAntivirusGame(); // Already active? Or check scan limits
            // Logic says check maxAntivirusScans. If 0 used, should be fine.
            // Oh, startAntivirusGame doesn't check if already active, just if scans exhausted?
            // Actually it sets antivirusActive = true.

            // Hit target
            const initialCash = game.cash;
            game.hitAntivirusTarget();
            expect(game.cash).toBe(initialCash + 2);

            game.endAntivirusGame();
            expect(game.antivirusActive).toBe(false);
        });

        it('should limit antivirus scans to 3 per round', () => {
            game.antivirusUnlocked = true;
            game.openApp('ANTIVIRUS');

            // 1st Scan
            expect(game.startAntivirusGame().success).toBe(true);
            game.endAntivirusGame();

            // 2nd Scan
            expect(game.startAntivirusGame().success).toBe(true);
            game.endAntivirusGame();

            // 3rd Scan
            expect(game.startAntivirusGame().success).toBe(true);
            game.endAntivirusGame();

            // 4th Scan (Should Fail)
            const res = game.startAntivirusGame();
            expect(res.success).toBe(false);
        });
    });
});
