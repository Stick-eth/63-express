
import { describe, it, expect, beforeEach } from 'vitest';

// Helper to calculate tokens based on levels survived
// Formula: Sum(1..semesters) where semester = floor(level/6)
function calculateTokensForLevel(level) {
    // If level < 6, 0 tokens (0 semesters)
    if (level < 6) return 0;

    // Calculate full semesters survived (every 6 levels)
    const semesters = Math.floor(level / 6);

    // Sum of integers from 1 to semesters: n(n+1)/2
    return (semesters * (semesters + 1)) / 2;
}

describe('Progressive Token Rewards', () => {
    it('should award 0 tokens for levels below 6', () => {
        expect(calculateTokensForLevel(1)).toBe(0);
        expect(calculateTokensForLevel(5)).toBe(0);
    });

    it('should award 1 token for level 6 (1 semester)', () => {
        // Semester 1: +1 token
        expect(calculateTokensForLevel(6)).toBe(1);
        expect(calculateTokensForLevel(11)).toBe(1);
    });

    it('should award 3 tokens for level 12 (2 semesters)', () => {
        // Semester 1: +1
        // Semester 2: +2
        // Total: 3
        expect(calculateTokensForLevel(12)).toBe(3);
        expect(calculateTokensForLevel(17)).toBe(3);
    });

    it('should award 6 tokens for level 18 (3 semesters)', () => {
        // Semester 1: +1
        // Semester 2: +2
        // Semester 3: +3
        // Total: 6
        expect(calculateTokensForLevel(18)).toBe(6);
    });

    it('should award 10 tokens for level 24 (4 semesters)', () => {
        // 1+2+3+4 = 10
        expect(calculateTokensForLevel(24)).toBe(10);
    });
});
