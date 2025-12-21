
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

    static spendTokens(amount) {
        const current = this.getTokens();
        if (current < amount) {
            return false;
        }
        StorageUtils.setValue(TOKENS_KEY, current - amount);
        this.updateTokenDisplay();
        return true;
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
        const devTreeBtn = document.getElementById('skill-tree-btn');

        if (tokenEl) {
            // Only show if player has ever earned a token
            if (!this.hasEverEarnedToken()) {
                tokenEl.classList.add('hidden');
                if (devTreeBtn) devTreeBtn.classList.add('hidden');
                return;
            }

            tokenEl.classList.remove('hidden');
            const count = this.getTokens();
            tokenEl.textContent = `🪙 ${count}`;
            tokenEl.title = count === 1 ? '1 Token' : `${count} Tokens`;

            // Show DEV_TREE button once tokens have been earned
            if (devTreeBtn) devTreeBtn.classList.remove('hidden');
        }
    }
}
