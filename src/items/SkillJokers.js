/**
 * SkillJokers - Hidden permanent jokers created from skill tree unlocks
 * These are NOT shown in player UI, cannot be sold, don't take slots
 * They use the same hook system as regular jokers
 */

import { createJoker } from './ItemFactory.js';

/**
 * Map of skill ID to joker definition
 * Only skills that need hook-based effects are defined here
 * (Range/attempt base modifications are still applied directly)
 */
export const SKILL_JOKERS = {
    // ═══════════════════════════════════════════════════════════════
    // GAIN Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    miner_gain_1: createJoker({
        id: 'skill_gain_1',
        name: { en: '[SKILL] Overclocked Gains', fr: '[SKILL] Gains Overclockés' },
        icon: '⚡',
        description: { en: '+10% to all gains.', fr: '+10% sur tous les gains.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => Math.floor(baseGain * 1.10)
    }),

    miner_gain_2: createJoker({
        id: 'skill_gain_2',
        name: { en: '[SKILL] Efficient Mining', fr: '[SKILL] Minage Efficace' },
        icon: '💎',
        description: { en: '+15% to all gains.', fr: '+15% sur tous les gains.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => Math.floor(baseGain * 1.15)
    }),

    miner_gain_3: createJoker({
        id: 'skill_precision_bonus',
        name: { en: '[SKILL] Precision Bonus', fr: '[SKILL] Bonus de Précision' },
        icon: '🎯',
        description: { en: '+$50 if found in ≤3 attempts.', fr: '+50$ si trouvé en ≤3 essais.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.attempts <= 3) {
                return baseGain + 50;
            }
            return baseGain;
        }
    }),

    miner_gain_4: createJoker({
        id: 'skill_gain_4',
        name: { en: '[SKILL] Diamond Hands', fr: '[SKILL] Mains de Diamant' },
        icon: '💪',
        description: { en: '+20% to all gains.', fr: '+20% sur tous les gains.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => Math.floor(baseGain * 1.20)
    }),

    miner_gain_5: createJoker({
        id: 'skill_streak_multiplier',
        name: { en: '[SKILL] Streak Multiplier', fr: '[SKILL] Multiplicateur de Série' },
        icon: '🔥',
        description: { en: 'x1.5 gain for each consecutive win.', fr: 'x1.5 gain par victoire consécutive.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            const streak = game.winStreak || 0;
            if (streak > 0) {
                return Math.floor(baseGain * (1 + 0.5 * streak));
            }
            return baseGain;
        }
    }),

    miner_gain_6: createJoker({
        id: 'skill_gain_6',
        name: { en: '[SKILL] Legendary Miner', fr: '[SKILL] Mineur Légendaire' },
        icon: '🏆',
        description: { en: '+30% to all gains.', fr: '+30% sur tous les gains.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => Math.floor(baseGain * 1.30)
    }),

    // ═══════════════════════════════════════════════════════════════
    // RANGE Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    miner_range_1: createJoker({
        id: 'skill_range_flat',
        name: { en: '[SKILL] Narrow Focus', fr: '[SKILL] Focus Resserré' },
        icon: '🔍',
        description: { en: 'Max range -5.', fr: 'Range max -5.' },
        hidden: true,
        trigger: 'getMaxRange',
        execute: (game, currentRange) => Math.max(10, currentRange - 5)
    }),

    miner_range_2: createJoker({
        id: 'skill_range_percent_1',
        name: { en: '[SKILL] Tighter Bounds', fr: '[SKILL] Bornes Resserrées' },
        icon: '📏',
        description: { en: 'Range size -5%.', fr: 'Taille de range -5%.' },
        hidden: true,
        trigger: 'getMaxRange',
        execute: (game, currentRange) => Math.floor(currentRange * 0.95)
    }),

    miner_range_3: createJoker({
        id: 'skill_auto_bisect',
        name: { en: '[SKILL] Auto-Bisect', fr: '[SKILL] Auto-Bissection' },
        icon: '✂️',
        description: { en: 'First miss eliminates ±10 from wrong side.', fr: 'Premier miss élimine ±10.' },
        hidden: true,
        trigger: 'onMiss',
        execute: (game, guess) => {
            if (!game.firstMissProcessed) {
                game.firstMissProcessed = true;
                if (guess < game.mysteryNumber) {
                    game.min = Math.min(game.mysteryNumber, game.min + 10);
                } else {
                    game.max = Math.max(game.mysteryNumber, game.max - 10);
                }
                return { message: 'AUTO-BISECT: Range tightened by 10', logOnly: true };
            }
        }
    }),

    miner_range_4: createJoker({
        id: 'skill_range_percent_2',
        name: { en: '[SKILL] Precision Scope', fr: '[SKILL] Viseur de Précision' },
        icon: '🎚️',
        description: { en: 'Range size -10%.', fr: 'Taille de range -10%.' },
        hidden: true,
        trigger: 'getMaxRange',
        execute: (game, currentRange) => Math.floor(currentRange * 0.90)
    }),

    miner_range_5: createJoker({
        id: 'skill_golden_zone',
        name: { en: '[SKILL] Golden Zone', fr: '[SKILL] Zone Dorée' },
        icon: '✨',
        description: { en: 'Start with range 20% smaller.', fr: 'Range 20% plus petite au départ.' },
        hidden: true,
        trigger: 'getMaxRange',
        execute: (game, currentRange) => Math.floor(currentRange * 0.80)
    }),

    miner_range_6: createJoker({
        id: 'skill_range_percent_3',
        name: { en: '[SKILL] Master Analyst', fr: '[SKILL] Analyste Expert' },
        icon: '📊',
        description: { en: 'Range size -15%.', fr: 'Taille de range -15%.' },
        hidden: true,
        trigger: 'getMaxRange',
        execute: (game, currentRange) => Math.floor(currentRange * 0.85)
    }),

    // ═══════════════════════════════════════════════════════════════
    // ATTEMPTS Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    miner_attempts_1: createJoker({
        id: 'skill_attempts_1',
        name: { en: '[SKILL] Extra RAM', fr: '[SKILL] RAM Supplémentaire' },
        icon: '💾',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => { game.maxAttempts += 1; }
    }),

    miner_attempts_2: createJoker({
        id: 'skill_attempts_2',
        name: { en: '[SKILL] Buffer Extension', fr: '[SKILL] Extension Buffer' },
        icon: '📀',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => { game.maxAttempts += 1; }
    }),

    miner_attempts_3: createJoker({
        id: 'skill_safety_net',
        name: { en: '[SKILL] Safety Net', fr: '[SKILL] Filet de Sécurité' },
        icon: '🛡️',
        description: { en: 'Survive 1 lost round per run.', fr: 'Survit 1 round perdu par run.' },
        hidden: true,
        trigger: 'onLostRound',
        execute: (game) => {
            if (game.safetyNetAvailable) {
                game.safetyNetAvailable = false;
                game.attempts = game.maxAttempts - 1;
                return { preventLoss: true, message: 'SAFETY NET activated!' };
            }
        }
    }),

    miner_attempts_4: createJoker({
        id: 'skill_attempts_4',
        name: { en: '[SKILL] Memory Upgrade', fr: '[SKILL] Amélioration Mémoire' },
        icon: '🧠',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => { game.maxAttempts += 1; }
    }),

    miner_attempts_5: createJoker({
        id: 'skill_recursion',
        name: { en: '[SKILL] Recursion', fr: '[SKILL] Récursion' },
        icon: '♻️',
        description: { en: '50% chance to not consume attempt.', fr: '50% de ne pas consommer l\'essai.' },
        hidden: true,
        trigger: 'onMiss',
        execute: (game) => {
            if (Math.random() < 0.5) {
                game.attempts = Math.max(0, game.attempts - 1);
                return { message: 'RECURSION: Attempt recovered!', logOnly: true };
            }
        }
    }),

    miner_attempts_6: createJoker({
        id: 'skill_attempts_6',
        name: { en: '[SKILL] Infinite Loop', fr: '[SKILL] Boucle Infinie' },
        icon: '∞',
        description: { en: '+2 max attempts.', fr: '+2 essais max.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => { game.maxAttempts += 2; }
    }),

    // ═══════════════════════════════════════════════════════════════
    // ECONOMY Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    miner_economy_1: createJoker({
        id: 'skill_starting_cash',
        name: { en: '[SKILL] Savings Account', fr: '[SKILL] Compte Épargne' },
        icon: '🏦',
        description: { en: '+$20 starting cash.', fr: '+20$ cash de départ.' },
        hidden: true,
        trigger: 'onRunStart',
        execute: (game) => { game.cash += 20; }
    }),

    miner_economy_2: createJoker({
        id: 'skill_rent_reduce_1',
        name: { en: '[SKILL] Tax Deduction', fr: '[SKILL] Déduction Fiscale' },
        icon: '📉',
        description: { en: 'Rent -5%.', fr: 'Loyer -5%.' },
        hidden: true,
        trigger: 'calculateRent',
        execute: (game, rent) => Math.floor(rent * 0.95)
    }),

    miner_economy_3: createJoker({
        id: 'skill_compound_interest',
        name: { en: '[SKILL] Compound Interest', fr: '[SKILL] Intérêts Composés' },
        icon: '📈',
        description: { en: '+3% of cash on win.', fr: '+3% du cash à chaque victoire.' },
        hidden: true,
        trigger: 'onWin',
        execute: (game) => {
            const interest = Math.floor(game.cash * 0.03);
            game.cash += interest;
            return { message: `COMPOUND: +$${interest}`, logOnly: true };
        }
    }),

    miner_economy_4: createJoker({
        id: 'skill_rent_reduce_2',
        name: { en: '[SKILL] Rent Control', fr: '[SKILL] Contrôle de Loyer' },
        icon: '🏠',
        description: { en: 'Rent -10%.', fr: 'Loyer -10%.' },
        hidden: true,
        trigger: 'calculateRent',
        execute: (game, rent) => Math.floor(rent * 0.90)
    }),

    miner_economy_5: createJoker({
        id: 'skill_cash_floor',
        name: { en: '[SKILL] Emergency Fund', fr: '[SKILL] Fonds d\'Urgence' },
        icon: '💰',
        description: { en: 'Min $50 per level.', fr: 'Min 50$ par niveau.' },
        hidden: true,
        trigger: 'onLevelStart',
        execute: (game) => {
            if (game.cash < 50) {
                game.cash = 50;
                return { message: 'EMERGENCY FUND: Cash set to $50', logOnly: true };
            }
        }
    }),

    miner_economy_6: createJoker({
        id: 'skill_financial_freedom',
        name: { en: '[SKILL] Financial Freedom', fr: '[SKILL] Liberté Financière' },
        icon: '🎩',
        description: { en: 'Rent -15%, +$50 start.', fr: 'Loyer -15%, +50$ départ.' },
        hidden: true,
        hooks: {
            calculateRent: (game, rent) => Math.floor(rent * 0.85),
            onRunStart: (game) => { game.cash += 50; }
        }
    }),

    // ═══════════════════════════════════════════════════════════════
    // MASTERY Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    miner_mastery_1: createJoker({
        id: 'skill_burning_threshold',
        name: { en: '[SKILL] Warm-up', fr: '[SKILL] Échauffement' },
        icon: '🔥',
        description: { en: 'Burning hint at 10%.', fr: 'Indice brûlant à 10%.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => {
            // Set burning threshold to 10% instead of 5%
            game.burningThreshold = Math.max(1, Math.floor((game.absoluteMax - game.absoluteMin) * 0.10));
        }
    }),

    miner_mastery_2: createJoker({
        id: 'skill_pattern_recognition',
        name: { en: '[SKILL] Pattern Recognition', fr: '[SKILL] Reconnaissance de Motifs' },
        icon: '🧩',
        description: { en: '+5% gain per unique guess.', fr: '+5% gain par essai unique.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            const uniqueCount = game.uniqueGuesses?.size || game.history?.length || 0;
            return Math.floor(baseGain * (1 + 0.05 * uniqueCount));
        }
    }),

    miner_mastery_3: createJoker({
        id: 'skill_parity_sense',
        name: { en: '[SKILL] Parity Sense', fr: '[SKILL] Sens de la Parité' },
        icon: '⚖️',
        description: { en: 'Always shows EVEN/ODD.', fr: 'Affiche toujours PAIR/IMPAIR.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => {
            const parity = game.mysteryNumber % 2 === 0 ? 'EVEN' : 'ODD';
            return { message: `PARITY SENSE: ${parity}`, logOnly: true };
        }
    }),

    miner_mastery_4: createJoker({
        id: 'skill_adaptive_learning',
        name: { en: '[SKILL] Adaptive Learning', fr: '[SKILL] Apprentissage Adaptatif' },
        icon: '🎓',
        description: { en: '+10% gain per level.', fr: '+10% gain par niveau.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            return Math.floor(baseGain * (1 + 0.10 * game.level));
        }
    }),

    miner_mastery_5: createJoker({
        id: 'skill_binary_search',
        name: { en: '[SKILL] Binary Search', fr: '[SKILL] Recherche Binaire' },
        icon: '🔀',
        description: { en: 'Shows optimal guess.', fr: 'Affiche le guess optimal.' },
        hidden: true,
        trigger: 'onRoundStart',
        execute: (game) => {
            const optimal = Math.floor((game.min + game.max) / 2);
            return { message: `BINARY HINT: Try ${optimal}`, logOnly: true };
        }
    }),

    miner_mastery_6: createJoker({
        id: 'skill_perfect_memory',
        name: { en: '[SKILL] Perfect Memory', fr: '[SKILL] Mémoire Parfaite' },
        icon: '🌟',
        description: { en: 'Keep 1 Joker between runs.', fr: 'Garde 1 Joker entre runs.' },
        hidden: true,
        trigger: 'onRunEnd',
        execute: (game) => {
            // This will be handled specially in run end logic
            if (game.jokers.length > 0) {
                const randomJoker = game.jokers[Math.floor(Math.random() * game.jokers.length)];
                game.preservedJoker = { ...randomJoker };
                return { message: `PERFECT MEMORY: ${randomJoker.name?.en || randomJoker.id} saved!`, logOnly: true };
            }
        }
    }),

    // ═══════════════════════════════════════════════════════════════
    // BROWSER - SHOP Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    browser_shop_1: createJoker({
        id: 'skill_shop_discount_1',
        name: { en: '[SKILL] Flash Sale', fr: '[SKILL] Vente Flash' },
        icon: '🏷️',
        description: { en: '-10% shop prices.', fr: '-10% prix boutique.' },
        hidden: true,
        trigger: 'calculateShopPrice',
        execute: (game, price) => Math.floor(price * 0.90)
    }),

    browser_shop_2: createJoker({
        id: 'skill_shop_items',
        name: { en: '[SKILL] Bulk Buyer', fr: '[SKILL] Achat en Gros' },
        icon: '📦',
        description: { en: '+1 shop item.', fr: '+1 article boutique.' },
        hidden: true,
        trigger: 'getShopItemCount',
        execute: (game, count) => count + 1
    }),

    browser_shop_3: createJoker({
        id: 'skill_shop_uncommon',
        name: { en: '[SKILL] VIP Access', fr: '[SKILL] Accès VIP' },
        icon: '⭐',
        description: { en: 'More uncommon items.', fr: 'Plus d\'items peu communs.' },
        hidden: true,
        trigger: 'shopRarityBoost',
        execute: () => ({ boostRarity: 'uncommon', chance: 0.3 })
    }),

    browser_shop_4: createJoker({
        id: 'skill_shop_discount_2',
        name: { en: '[SKILL] Haggler', fr: '[SKILL] Marchandeur' },
        icon: '🤝',
        description: { en: '-20% shop prices.', fr: '-20% prix boutique.' },
        hidden: true,
        trigger: 'calculateShopPrice',
        execute: (game, price) => Math.floor(price * 0.80)
    }),

    browser_shop_5: createJoker({
        id: 'skill_shop_rare',
        name: { en: '[SKILL] Black Market', fr: '[SKILL] Marché Noir' },
        icon: '🕶️',
        description: { en: 'Rare items in shop.', fr: 'Items rares en boutique.' },
        hidden: true,
        trigger: 'shopRarityBoost',
        execute: () => ({ boostRarity: 'rare', chance: 0.2 })
    }),

    // ═══════════════════════════════════════════════════════════════
    // BROWSER - ANTIVIRUS Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    browser_av_1: createJoker({
        id: 'skill_av_time',
        name: { en: '[SKILL] Quick Scan', fr: '[SKILL] Scan Rapide' },
        icon: '⏱️',
        description: { en: '+5s antivirus time.', fr: '+5s temps antivirus.' },
        hidden: true,
        trigger: 'getAntivirusTime',
        execute: (game, time) => time + 5
    }),

    browser_av_2: createJoker({
        id: 'skill_av_scans',
        name: { en: '[SKILL] Deep Scan', fr: '[SKILL] Scan Profond' },
        icon: '🔬',
        description: { en: '+1 scan per round.', fr: '+1 scan par round.' },
        hidden: true,
        trigger: 'getMaxAntivirusScans',
        execute: (game, scans) => scans + 1
    }),

    browser_av_3: createJoker({
        id: 'skill_av_speed',
        name: { en: '[SKILL] Turbo Mode', fr: '[SKILL] Mode Turbo' },
        icon: '🚀',
        description: { en: 'Faster threat spawn.', fr: 'Menaces plus rapides.' },
        hidden: true,
        trigger: 'getAntivirusSpeed',
        execute: (game, speed) => speed * 1.5
    }),

    browser_av_4: createJoker({
        id: 'skill_av_score',
        name: { en: '[SKILL] Bonus Points', fr: '[SKILL] Points Bonus' },
        icon: '🎯',
        description: { en: '+50% scan score.', fr: '+50% score de scan.' },
        hidden: true,
        trigger: 'calculateAntivirusScore',
        execute: (game, score) => Math.floor(score * 1.50)
    }),

    browser_av_5: createJoker({
        id: 'skill_av_cash',
        name: { en: '[SKILL] Auto-Quarantine', fr: '[SKILL] Auto-Quarantaine' },
        icon: '💰',
        description: { en: '+$50 per scan.', fr: '+50$ par scan.' },
        hidden: true,
        trigger: 'onAntivirusScan',
        execute: (game) => {
            game.cash += 50;
            return { message: 'AUTO-QUARANTINE: +$50', logOnly: true };
        }
    }),

    // ═══════════════════════════════════════════════════════════════
    // BROWSER - TRADING Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    browser_trade_1: createJoker({
        id: 'skill_trade_limit',
        name: { en: '[SKILL] Day Trader', fr: '[SKILL] Trader du Jour' },
        icon: '📊',
        description: { en: '+1 trade per round.', fr: '+1 trade par round.' },
        hidden: true,
        trigger: 'getMaxTrades',
        execute: (game, max) => max + 1
    }),

    browser_trade_2: createJoker({
        id: 'skill_trade_trend',
        name: { en: '[SKILL] Market Insights', fr: '[SKILL] Analyse Marché' },
        icon: '📈',
        description: { en: 'See price trend.', fr: 'Voir tendance prix.' },
        hidden: true,
        trigger: 'showTradeTrend',
        execute: () => true
    }),

    browser_trade_3: createJoker({
        id: 'skill_trade_fees',
        name: { en: '[SKILL] Commission Cut', fr: '[SKILL] Réduction Commission' },
        icon: '✂️',
        description: { en: '-50% trade fees.', fr: '-50% frais de trade.' },
        hidden: true,
        trigger: 'calculateTradeFee',
        execute: (game, fee) => Math.floor(fee * 0.50)
    }),

    browser_trade_4: createJoker({
        id: 'skill_trade_profit',
        name: { en: '[SKILL] Leverage', fr: '[SKILL] Levier' },
        icon: '⚡',
        description: { en: '+20% trade profit.', fr: '+20% profit de trade.' },
        hidden: true,
        trigger: 'calculateTradeProfit',
        execute: (game, profit) => Math.floor(profit * 1.20)
    }),

    browser_trade_5: createJoker({
        id: 'skill_trade_predict',
        name: { en: '[SKILL] Insider Info', fr: '[SKILL] Info Privilégiée' },
        icon: '🔮',
        description: { en: 'Know next candle.', fr: 'Connaître prochaine bougie.' },
        hidden: true,
        trigger: 'showNextCandle',
        execute: () => true
    }),

    // ═══════════════════════════════════════════════════════════════
    // BROWSER - OVERCLOCK Sub-branch Effects
    // ═══════════════════════════════════════════════════════════════
    browser_oc_1: createJoker({
        id: 'skill_oc_heat',
        name: { en: '[SKILL] Heat Sink', fr: '[SKILL] Dissipateur' },
        icon: '❄️',
        description: { en: '-20% overheat rate.', fr: '-20% surchauffe.' },
        hidden: true,
        trigger: 'calculateOverheat',
        execute: (game, heat) => Math.floor(heat * 0.80)
    }),

    browser_oc_2: createJoker({
        id: 'skill_oc_calibration',
        name: { en: '[SKILL] Precision Tuning', fr: '[SKILL] Réglage Précis' },
        icon: '🎚️',
        description: { en: 'Easier calibration.', fr: 'Calibration plus facile.' },
        hidden: true,
        trigger: 'getCalibrationTolerance',
        execute: (game, tolerance) => tolerance + 10
    }),

    browser_oc_3: createJoker({
        id: 'skill_oc_gain',
        name: { en: '[SKILL] Power Surge', fr: '[SKILL] Surtension' },
        icon: '⚡',
        description: { en: '+10% gains when calibrated.', fr: '+10% gains calibré.' },
        hidden: true,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.systemCalibratedThisRound) {
                return Math.floor(baseGain * 1.10);
            }
            return baseGain;
        }
    }),

    browser_oc_4: createJoker({
        id: 'skill_oc_bonus_mult',
        name: { en: '[SKILL] Turbo Boost', fr: '[SKILL] Turbo Boost' },
        icon: '🔥',
        description: { en: 'Double calibration bonus.', fr: 'Double bonus calibration.' },
        hidden: true,
        trigger: 'getCalibrationBonus',
        execute: (game, bonus) => bonus * 2
    }),

    browser_oc_5: createJoker({
        id: 'skill_oc_no_penalty',
        name: { en: '[SKILL] Liquid Cooling', fr: '[SKILL] Refroidissement Liquide' },
        icon: '💧',
        description: { en: 'No overheat penalty.', fr: 'Pas de pénalité surchauffe.' },
        hidden: true,
        trigger: 'applyOverheatPenalty',
        execute: () => false // Skip penalty
    })
};

/**
 * Get all skill jokers for unlocked skills
 * @param {string[]} unlockedSkillIds - Array of unlocked skill IDs
 * @returns {Object[]} Array of joker objects
 */
export function getActiveSkillJokers(unlockedSkillIds) {
    const activeJokers = [];

    for (const skillId of unlockedSkillIds) {
        if (SKILL_JOKERS[skillId]) {
            activeJokers.push(SKILL_JOKERS[skillId]);
        }
    }

    return activeJokers;
}
