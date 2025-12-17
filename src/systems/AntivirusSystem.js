export class AntivirusSystem {
    constructor(game) {
        this.game = game;
    }

    start() {
        // Check if can start (haven't used all scans yet)
        if (this.game.antivirusScansThisRound >= this.game.maxAntivirusScans) {
            return { success: false };
        }

        this.game.antivirusActive = true;
        this.game.antivirusScore = 0;
        this.game.antivirusTimeLeft = 10;
        // Don't increment here - increment when game ends
        return { success: true };
    }

    hitTarget() {
        if (!this.game.antivirusActive) return;
        this.game.antivirusScore++;
        this.game.cash += 2;
    }

    end() {
        this.game.antivirusActive = false;
        // Increment scan count when game ends
        this.game.antivirusScansThisRound++;
    }
}
