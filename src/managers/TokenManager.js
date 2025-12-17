
const TOKENS_KEY = 'binary_hustle_tokens';
const TOKENS_UNLOCKED_KEY = 'binary_hustle_tokens_unlocked';

export class TokenManager {
    static getTokens() {
        const tokens = localStorage.getItem(TOKENS_KEY);
        return tokens ? parseInt(tokens, 10) : 0;
    }

    static hasEverEarnedToken() {
        return localStorage.getItem(TOKENS_UNLOCKED_KEY) === 'true';
    }

    static addToken(amount = 1) {
        const current = this.getTokens();
        localStorage.setItem(TOKENS_KEY, (current + amount).toString());
        localStorage.setItem(TOKENS_UNLOCKED_KEY, 'true'); // Mark as unlocked forever
        this.updateTokenDisplay();
    }

    static awardProgressiveTokens(level) {
        // Formula: Sum of integers from 1 to semesters, where semester = floor(level / 6)
        if (level < 6) return;
        const semesters = Math.floor(level / 6);
        const tokensToAward = (semesters * (semesters + 1)) / 2;

        if (tokensToAward > 0) {
            this.addToken(tokensToAward);
        }
    }

    static updateTokenDisplay() {
        const tokenEl = document.getElementById('token-display');
        if (tokenEl) {
            // Only show if player has ever earned a token
            if (!this.hasEverEarnedToken()) {
                tokenEl.classList.add('hidden');
                return;
            }

            tokenEl.classList.remove('hidden');
            const count = this.getTokens();
            tokenEl.textContent = `🪙 ${count}`;
            tokenEl.title = count === 1 ? '1 Token' : `${count} Tokens`;
        }
    }
}
