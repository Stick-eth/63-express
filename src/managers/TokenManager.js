
import { StorageUtils } from '../utils/StorageUtils.js';

const TOKENS_KEY = 'binary_hustle_tokens';
const TOKENS_UNLOCKED_KEY = 'binary_hustle_tokens_unlocked';

export class TokenManager {
    static getTokens() {
        return StorageUtils.getValue(TOKENS_KEY, 0);
    }

    static hasEverEarnedToken() {
        return StorageUtils.getValue(TOKENS_UNLOCKED_KEY, false) === true;
    }

    static addToken(amount = 1) {
        const current = this.getTokens();
        StorageUtils.setValue(TOKENS_KEY, current + amount);
        StorageUtils.setValue(TOKENS_UNLOCKED_KEY, true);
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
