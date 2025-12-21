/**
 * Skill Tree Data - Extended Miner Branch (30 skills)
 * Permanent unlocks stored in localStorage
 * 
 * Structure:
 * - core: Entry point
 * - miner: 30 skills in 5 sub-branches (GAIN, RANGE, ATTEMPTS, ECONOMY, MASTERY)
 * - browser: Apps & shop improvements
 * - machine: Cheat-like enhancements
 */

export const SKILL_TREE = {
    // ═══════════════════════════════════════════════════════════════
    // CORE - Entry Point (unlocks all branches)
    // ═══════════════════════════════════════════════════════════════
    core: {
        id: 'core',
        name: { en: 'Neural Core', fr: 'Cœur Neural' },
        icon: '🖤',
        description: {
            en: 'Initialize the skill tree. Unlocks all three branches.',
            fr: 'Initialise l\'arbre. Débloque les trois branches.'
        },
        cost: 1,
        requires: [],
        branch: 'core',
        effect: { type: 'unlock_tree' }
    },

    // ═══════════════════════════════════════════════════════════════
    // MINER BRANCH - GAIN Sub-branch (6 skills)
    // ═══════════════════════════════════════════════════════════════
    miner_gain_1: {
        id: 'miner_gain_1',
        name: { en: 'Overclocked Gains', fr: 'Gains Overclockés' },
        icon: '⚡',
        description: { en: '+10% to all gains.', fr: '+10% sur tous les gains.' },
        cost: 2,
        requires: ['core'],
        branch: 'miner',
        effect: { type: 'gain_multiplier', value: 0.10 }
    },
    miner_gain_2: {
        id: 'miner_gain_2',
        name: { en: 'Efficient Mining', fr: 'Minage Efficace' },
        icon: '💎',
        description: { en: '+15% to all gains.', fr: '+15% sur tous les gains.' },
        cost: 4,
        requires: ['miner_gain_1'],
        branch: 'miner',
        effect: { type: 'gain_multiplier', value: 0.15 }
    },
    miner_gain_3: {
        id: 'miner_gain_3',
        name: { en: 'Precision Bonus', fr: 'Bonus de Précision' },
        icon: '🎯',
        description: { en: '+$50 bonus if found in ≤3 attempts.', fr: '+50$ bonus si trouvé en ≤3 essais.' },
        cost: 6,
        requires: ['miner_gain_2'],
        branch: 'miner',
        effect: { type: 'precision_bonus', value: 50, threshold: 3 }
    },
    miner_gain_4: {
        id: 'miner_gain_4',
        name: { en: 'Diamond Hands', fr: 'Mains de Diamant' },
        icon: '💪',
        description: { en: '+20% to all gains.', fr: '+20% sur tous les gains.' },
        cost: 8,
        requires: ['miner_gain_3'],
        branch: 'miner',
        effect: { type: 'gain_multiplier', value: 0.20 }
    },
    miner_gain_5: {
        id: 'miner_gain_5',
        name: { en: 'Streak Multiplier', fr: 'Multiplicateur de Série' },
        icon: '🔥',
        description: { en: 'x1.5 gain for each consecutive win.', fr: 'x1.5 gain par victoire consécutive.' },
        cost: 12,
        requires: ['miner_gain_4'],
        branch: 'miner',
        effect: { type: 'streak_multiplier', value: 0.5 }
    },
    miner_gain_6: {
        id: 'miner_gain_6',
        name: { en: 'Legendary Miner', fr: 'Mineur Légendaire' },
        icon: '🏆',
        description: { en: '+30% to all gains.', fr: '+30% sur tous les gains.' },
        cost: 18,
        requires: ['miner_gain_5'],
        branch: 'miner',
        effect: { type: 'gain_multiplier', value: 0.30 }
    },

    // ═══════════════════════════════════════════════════════════════
    // MINER BRANCH - RANGE Sub-branch (6 skills)
    // ═══════════════════════════════════════════════════════════════
    miner_range_1: {
        id: 'miner_range_1',
        name: { en: 'Narrow Focus', fr: 'Focus Resserré' },
        icon: '🔍',
        description: { en: 'Max range -5.', fr: 'Range max -5.' },
        cost: 2,
        requires: ['core'],
        branch: 'miner',
        effect: { type: 'range_reduce_flat', value: 5 }
    },
    miner_range_2: {
        id: 'miner_range_2',
        name: { en: 'Tighter Bounds', fr: 'Bornes Resserrées' },
        icon: '📏',
        description: { en: 'Range size -5%.', fr: 'Taille de range -5%.' },
        cost: 4,
        requires: ['miner_range_1'],
        branch: 'miner',
        effect: { type: 'range_reduce_percent', value: 0.05 }
    },
    miner_range_3: {
        id: 'miner_range_3',
        name: { en: 'Auto-Bisect', fr: 'Auto-Bissection' },
        icon: '✂️',
        description: { en: 'First miss eliminates ±10 from wrong side.', fr: 'Premier miss élimine ±10 du mauvais côté.' },
        cost: 6,
        requires: ['miner_range_2'],
        branch: 'miner',
        effect: { type: 'auto_bisect', value: 10 }
    },
    miner_range_4: {
        id: 'miner_range_4',
        name: { en: 'Precision Scope', fr: 'Viseur de Précision' },
        icon: '🎚️',
        description: { en: 'Range size -10%.', fr: 'Taille de range -10%.' },
        cost: 8,
        requires: ['miner_range_3'],
        branch: 'miner',
        effect: { type: 'range_reduce_percent', value: 0.10 }
    },
    miner_range_5: {
        id: 'miner_range_5',
        name: { en: 'Golden Zone', fr: 'Zone Dorée' },
        icon: '✨',
        description: { en: 'Start with range already 20% smaller.', fr: 'Commence avec range déjà 20% plus petite.' },
        cost: 12,
        requires: ['miner_range_4'],
        branch: 'miner',
        effect: { type: 'starting_range_reduce', value: 0.20 }
    },
    miner_range_6: {
        id: 'miner_range_6',
        name: { en: 'Master Analyst', fr: 'Analyste Expert' },
        icon: '📊',
        description: { en: 'Range size -15%.', fr: 'Taille de range -15%.' },
        cost: 18,
        requires: ['miner_range_5'],
        branch: 'miner',
        effect: { type: 'range_reduce_percent', value: 0.15 }
    },

    // ═══════════════════════════════════════════════════════════════
    // MINER BRANCH - ATTEMPTS Sub-branch (6 skills)
    // ═══════════════════════════════════════════════════════════════
    miner_attempts_1: {
        id: 'miner_attempts_1',
        name: { en: 'Extra RAM', fr: 'RAM Supplémentaire' },
        icon: '💾',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        cost: 3,
        requires: ['core'],
        branch: 'miner',
        effect: { type: 'extra_attempts', value: 1 }
    },
    miner_attempts_2: {
        id: 'miner_attempts_2',
        name: { en: 'Buffer Extension', fr: 'Extension Buffer' },
        icon: '📀',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        cost: 5,
        requires: ['miner_attempts_1'],
        branch: 'miner',
        effect: { type: 'extra_attempts', value: 1 }
    },
    miner_attempts_3: {
        id: 'miner_attempts_3',
        name: { en: 'Safety Net', fr: 'Filet de Sécurité' },
        icon: '🛡️',
        description: { en: 'Once per run: survive 1 lost round.', fr: 'Une fois par run : survit 1 round perdu.' },
        cost: 8,
        requires: ['miner_attempts_2'],
        branch: 'miner',
        effect: { type: 'safety_net', value: 1 }
    },
    miner_attempts_4: {
        id: 'miner_attempts_4',
        name: { en: 'Memory Upgrade', fr: 'Amélioration Mémoire' },
        icon: '🧠',
        description: { en: '+1 max attempt.', fr: '+1 essai max.' },
        cost: 10,
        requires: ['miner_attempts_3'],
        branch: 'miner',
        effect: { type: 'extra_attempts', value: 1 }
    },
    miner_attempts_5: {
        id: 'miner_attempts_5',
        name: { en: 'Recursion', fr: 'Récursion' },
        icon: '♻️',
        description: { en: '50% chance to not consume attempt on miss.', fr: '50% chance de ne pas consommer l\'essai.' },
        cost: 15,
        requires: ['miner_attempts_4'],
        branch: 'miner',
        effect: { type: 'recursion_chance', value: 0.5 }
    },
    miner_attempts_6: {
        id: 'miner_attempts_6',
        name: { en: 'Infinite Loop', fr: 'Boucle Infinie' },
        icon: '∞',
        description: { en: '+2 max attempts.', fr: '+2 essais max.' },
        cost: 20,
        requires: ['miner_attempts_5'],
        branch: 'miner',
        effect: { type: 'extra_attempts', value: 2 }
    },

    // ═══════════════════════════════════════════════════════════════
    // MINER BRANCH - ECONOMY Sub-branch (6 skills)
    // ═══════════════════════════════════════════════════════════════
    miner_economy_1: {
        id: 'miner_economy_1',
        name: { en: 'Savings Account', fr: 'Compte Épargne' },
        icon: '🏦',
        description: { en: '+$20 starting cash.', fr: '+20$ cash de départ.' },
        cost: 2,
        requires: ['core'],
        branch: 'miner',
        effect: { type: 'starting_cash', value: 20 }
    },
    miner_economy_2: {
        id: 'miner_economy_2',
        name: { en: 'Tax Deduction', fr: 'Déduction Fiscale' },
        icon: '📉',
        description: { en: 'Rent -5%.', fr: 'Loyer -5%.' },
        cost: 4,
        requires: ['miner_economy_1'],
        branch: 'miner',
        effect: { type: 'rent_reduce', value: 0.05 }
    },
    miner_economy_3: {
        id: 'miner_economy_3',
        name: { en: 'Compound Interest', fr: 'Intérêts Composés' },
        icon: '📈',
        description: { en: '+3% of current cash on win.', fr: '+3% du cash actuel à chaque victoire.' },
        cost: 6,
        requires: ['miner_economy_2'],
        branch: 'miner',
        effect: { type: 'compound_interest', value: 0.03 }
    },
    miner_economy_4: {
        id: 'miner_economy_4',
        name: { en: 'Rent Control', fr: 'Contrôle de Loyer' },
        icon: '🏠',
        description: { en: 'Rent -10%.', fr: 'Loyer -10%.' },
        cost: 8,
        requires: ['miner_economy_3'],
        branch: 'miner',
        effect: { type: 'rent_reduce', value: 0.10 }
    },
    miner_economy_5: {
        id: 'miner_economy_5',
        name: { en: 'Emergency Fund', fr: 'Fonds d\'Urgence' },
        icon: '💰',
        description: { en: 'Start each level with min $50.', fr: 'Commence chaque niveau avec min 50$.' },
        cost: 12,
        requires: ['miner_economy_4'],
        branch: 'miner',
        effect: { type: 'cash_floor', value: 50 }
    },
    miner_economy_6: {
        id: 'miner_economy_6',
        name: { en: 'Financial Freedom', fr: 'Liberté Financière' },
        icon: '🎩',
        description: { en: 'Rent -15%, +$50 start.', fr: 'Loyer -15%, +50$ départ.' },
        cost: 18,
        requires: ['miner_economy_5'],
        branch: 'miner',
        effect: { type: 'financial_freedom', rent_reduce: 0.15, starting_cash: 50 }
    },

    // ═══════════════════════════════════════════════════════════════
    // MINER BRANCH - MASTERY Sub-branch (6 skills)
    // ═══════════════════════════════════════════════════════════════
    miner_mastery_1: {
        id: 'miner_mastery_1',
        name: { en: 'Warm-up', fr: 'Échauffement' },
        icon: '🔥',
        description: { en: 'Burning hint at 10% instead of 5%.', fr: 'Indice brûlant à 10% au lieu de 5%.' },
        cost: 5,
        requires: ['miner_gain_2', 'miner_range_2'],
        branch: 'miner',
        effect: { type: 'burning_threshold', value: 0.10 }
    },
    miner_mastery_2: {
        id: 'miner_mastery_2',
        name: { en: 'Pattern Recognition', fr: 'Reconnaissance de Motifs' },
        icon: '🧩',
        description: { en: '+5% gain per unique guess.', fr: '+5% gain par essai unique.' },
        cost: 8,
        requires: ['miner_mastery_1'],
        branch: 'miner',
        effect: { type: 'pattern_recognition', value: 0.05 }
    },
    miner_mastery_3: {
        id: 'miner_mastery_3',
        name: { en: 'Parity Sense', fr: 'Sens de la Parité' },
        icon: '⚖️',
        description: { en: 'Always know if target is EVEN/ODD.', fr: 'Toujours savoir si la cible est PAIR/IMPAIR.' },
        cost: 10,
        requires: ['miner_mastery_2'],
        branch: 'miner',
        effect: { type: 'parity_sense' }
    },
    miner_mastery_4: {
        id: 'miner_mastery_4',
        name: { en: 'Adaptive Learning', fr: 'Apprentissage Adaptatif' },
        icon: '🎓',
        description: { en: '+10% gain mult per level reached.', fr: '+10% mult gain par niveau atteint.' },
        cost: 14,
        requires: ['miner_mastery_3'],
        branch: 'miner',
        effect: { type: 'adaptive_learning', value: 0.10 }
    },
    miner_mastery_5: {
        id: 'miner_mastery_5',
        name: { en: 'Binary Search', fr: 'Recherche Binaire' },
        icon: '🔀',
        description: { en: 'Shows optimal guess as hint.', fr: 'Affiche le guess optimal en indice.' },
        cost: 20,
        requires: ['miner_mastery_4'],
        branch: 'miner',
        effect: { type: 'binary_search_hint' }
    },
    miner_mastery_6: {
        id: 'miner_mastery_6',
        name: { en: 'Perfect Memory', fr: 'Mémoire Parfaite' },
        icon: '🌟',
        description: { en: 'Keep 1 random Joker between runs.', fr: 'Garde 1 Joker aléatoire entre les runs.' },
        cost: 30,
        requires: ['miner_mastery_5'],
        branch: 'miner',
        effect: { type: 'keep_joker', value: 1 }
    },

    // ═══════════════════════════════════════════════════════════════
    // BROWSER BRANCH - Apps & Shop improvements (5 skills)
    // ═══════════════════════════════════════════════════════════════
    browser_1: {
        id: 'browser_1',
        name: { en: 'Network Boost', fr: 'Boost Réseau' },
        icon: '🌐',
        description: { en: '+1 item in shop.', fr: '+1 item dans le shop.' },
        cost: 2,
        requires: ['core'],
        branch: 'browser',
        effect: { type: 'shop_extra_items', value: 1 }
    },
    browser_2: {
        id: 'browser_2',
        name: { en: 'Day Trader', fr: 'Day Trader' },
        icon: '📊',
        description: { en: 'Trading unlocked from start.', fr: 'Trading débloqué dès le départ.' },
        cost: 4,
        requires: ['browser_1'],
        branch: 'browser',
        effect: { type: 'unlock_trading' }
    },
    browser_3: {
        id: 'browser_3',
        name: { en: 'Extended Scan', fr: 'Scan Étendu' },
        icon: '🛡️',
        description: { en: 'Antivirus duration +5 seconds.', fr: 'Durée antivirus +5 secondes.' },
        cost: 5,
        requires: ['browser_2'],
        branch: 'browser',
        effect: { type: 'antivirus_time', value: 5 }
    },
    browser_4: {
        id: 'browser_4',
        name: { en: 'Discount Card', fr: 'Carte de Réduction' },
        icon: '🏷️',
        description: { en: 'Shop prices -20%.', fr: 'Prix du shop -20%.' },
        cost: 7,
        requires: ['browser_3'],
        branch: 'browser',
        effect: { type: 'shop_discount', value: 0.20 }
    },
    browser_5: {
        id: 'browser_5',
        name: { en: 'Full Access', fr: 'Accès Complet' },
        icon: '🔓',
        description: { en: 'All apps unlocked from start.', fr: 'Toutes les apps débloquées dès le départ.' },
        cost: 12,
        requires: ['browser_4'],
        branch: 'browser',
        effect: { type: 'unlock_all_apps' }
    },

    // ═══════════════════════════════════════════════════════════════
    // MACHINE BRANCH - Cheat-like improvements (5 skills)
    // ═══════════════════════════════════════════════════════════════
    machine_1: {
        id: 'machine_1',
        name: { en: 'Overclock', fr: 'Overclock' },
        icon: '⚡',
        description: { en: 'Skip boot animation.', fr: 'Passe l\'animation de boot.' },
        cost: 2,
        requires: ['core'],
        branch: 'machine',
        effect: { type: 'skip_boot' }
    },
    machine_2: {
        id: 'machine_2',
        name: { en: 'Hint Bot', fr: 'Bot Indice' },
        icon: '🤖',
        description: { en: 'Shows optimal guess in placeholder.', fr: 'Affiche la suggestion optimale.' },
        cost: 4,
        requires: ['machine_1'],
        branch: 'machine',
        effect: { type: 'show_optimal_hint' }
    },
    machine_3: {
        id: 'machine_3',
        name: { en: 'Free Spin', fr: 'Tour Gratuit' },
        icon: '🎰',
        description: { en: '1 free reroll per shop visit.', fr: '1 reroll gratuit par visite du shop.' },
        cost: 6,
        requires: ['machine_2'],
        branch: 'machine',
        effect: { type: 'free_reroll', value: 1 }
    },
    machine_4: {
        id: 'machine_4',
        name: { en: 'Token Boost', fr: 'Boost Jeton' },
        icon: '🪙',
        description: { en: 'Tokens earned x2.', fr: 'Jetons gagnés x2.' },
        cost: 10,
        requires: ['machine_3'],
        branch: 'machine',
        effect: { type: 'token_multiplier', value: 2 }
    },
    machine_5: {
        id: 'machine_5',
        name: { en: 'God Mode', fr: 'Mode Dieu' },
        icon: '👑',
        description: { en: 'Infinite attempts.', fr: 'Essais infinis.' },
        cost: 50,
        requires: ['machine_4'],
        branch: 'machine',
        effect: { type: 'infinite_attempts' }
    },

    // ═══════════════════════════════════════════════════════════════
    // BROWSER BRANCH - SHOP Sub-branch (5 skills)
    // ═══════════════════════════════════════════════════════════════
    browser_shop_1: {
        id: 'browser_shop_1',
        name: { en: 'Flash Sale', fr: 'Vente Flash' },
        icon: '🏷️',
        description: { en: '-10% shop prices.', fr: '-10% prix en boutique.' },
        cost: 2,
        requires: ['core'],
        branch: 'browser',
        effect: { type: 'shop_discount', value: 0.10 }
    },
    browser_shop_2: {
        id: 'browser_shop_2',
        name: { en: 'Bulk Buyer', fr: 'Achat en Gros' },
        icon: '📦',
        description: { en: '+1 item per shop refresh.', fr: '+1 article par refresh.' },
        cost: 4,
        requires: ['browser_shop_1'],
        branch: 'browser',
        effect: { type: 'shop_items', value: 1 }
    },
    browser_shop_3: {
        id: 'browser_shop_3',
        name: { en: 'VIP Access', fr: 'Accès VIP' },
        icon: '⭐',
        description: { en: 'Uncommon items more frequent.', fr: 'Items peu communs plus fréquents.' },
        cost: 6,
        requires: ['browser_shop_2'],
        branch: 'browser',
        effect: { type: 'shop_rarity_boost', value: 'uncommon' }
    },
    browser_shop_4: {
        id: 'browser_shop_4',
        name: { en: 'Haggler', fr: 'Marchandeur' },
        icon: '🤝',
        description: { en: '-20% shop prices.', fr: '-20% prix en boutique.' },
        cost: 10,
        requires: ['browser_shop_3'],
        branch: 'browser',
        effect: { type: 'shop_discount', value: 0.20 }
    },
    browser_shop_5: {
        id: 'browser_shop_5',
        name: { en: 'Black Market', fr: 'Marché Noir' },
        icon: '🕶️',
        description: { en: 'Rare items appear in shop.', fr: 'Items rares en boutique.' },
        cost: 15,
        requires: ['browser_shop_4'],
        branch: 'browser',
        effect: { type: 'shop_rarity_boost', value: 'rare' }
    },

    // ═══════════════════════════════════════════════════════════════
    // BROWSER BRANCH - ANTIVIRUS Sub-branch (5 skills)
    // ═══════════════════════════════════════════════════════════════
    browser_av_1: {
        id: 'browser_av_1',
        name: { en: 'Quick Scan', fr: 'Scan Rapide' },
        icon: '⏱️',
        description: { en: '+5s antivirus time.', fr: '+5s temps antivirus.' },
        cost: 2,
        requires: ['core'],
        branch: 'browser',
        effect: { type: 'av_time', value: 5 }
    },
    browser_av_2: {
        id: 'browser_av_2',
        name: { en: 'Deep Scan', fr: 'Scan Profond' },
        icon: '🔬',
        description: { en: '+1 scan per round.', fr: '+1 scan par round.' },
        cost: 4,
        requires: ['browser_av_1'],
        branch: 'browser',
        effect: { type: 'av_scans', value: 1 }
    },
    browser_av_3: {
        id: 'browser_av_3',
        name: { en: 'Turbo Mode', fr: 'Mode Turbo' },
        icon: '🚀',
        description: { en: 'Faster threat spawn (+points).', fr: 'Menaces plus rapides (+points).' },
        cost: 6,
        requires: ['browser_av_2'],
        branch: 'browser',
        effect: { type: 'av_speed', value: 1.5 }
    },
    browser_av_4: {
        id: 'browser_av_4',
        name: { en: 'Bonus Points', fr: 'Points Bonus' },
        icon: '🎯',
        description: { en: '+50% scan score.', fr: '+50% score de scan.' },
        cost: 10,
        requires: ['browser_av_3'],
        branch: 'browser',
        effect: { type: 'av_score_mult', value: 0.50 }
    },
    browser_av_5: {
        id: 'browser_av_5',
        name: { en: 'Auto-Quarantine', fr: 'Auto-Quarantaine' },
        icon: '💰',
        description: { en: '+$50 per successful scan.', fr: '+50$ par scan réussi.' },
        cost: 15,
        requires: ['browser_av_4'],
        branch: 'browser',
        effect: { type: 'av_cash_bonus', value: 50 }
    },

    // ═══════════════════════════════════════════════════════════════
    // BROWSER BRANCH - TRADING Sub-branch (5 skills)
    // ═══════════════════════════════════════════════════════════════
    browser_trade_1: {
        id: 'browser_trade_1',
        name: { en: 'Day Trader', fr: 'Trader du Jour' },
        icon: '📊',
        description: { en: '+1 trade per round.', fr: '+1 trade par round.' },
        cost: 2,
        requires: ['core'],
        branch: 'browser',
        effect: { type: 'trade_limit', value: 1 }
    },
    browser_trade_2: {
        id: 'browser_trade_2',
        name: { en: 'Market Insights', fr: 'Analyse Marché' },
        icon: '📈',
        description: { en: 'See price trend indicator.', fr: 'Voir indicateur de tendance.' },
        cost: 4,
        requires: ['browser_trade_1'],
        branch: 'browser',
        effect: { type: 'trade_trend', value: true }
    },
    browser_trade_3: {
        id: 'browser_trade_3',
        name: { en: 'Commission Cut', fr: 'Réduction Commission' },
        icon: '✂️',
        description: { en: '-50% trade fees.', fr: '-50% frais de trade.' },
        cost: 6,
        requires: ['browser_trade_2'],
        branch: 'browser',
        effect: { type: 'trade_fee_reduce', value: 0.50 }
    },
    browser_trade_4: {
        id: 'browser_trade_4',
        name: { en: 'Leverage', fr: 'Levier' },
        icon: '⚡',
        description: { en: '+20% trade profit.', fr: '+20% profit de trade.' },
        cost: 10,
        requires: ['browser_trade_3'],
        branch: 'browser',
        effect: { type: 'trade_profit', value: 0.20 }
    },
    browser_trade_5: {
        id: 'browser_trade_5',
        name: { en: 'Insider Info', fr: 'Info Privilégiée' },
        icon: '🔮',
        description: { en: 'Know next candle color.', fr: 'Connaître la prochaine couleur.' },
        cost: 15,
        requires: ['browser_trade_4'],
        branch: 'browser',
        effect: { type: 'trade_predict', value: true }
    },

    // ═══════════════════════════════════════════════════════════════
    // BROWSER BRANCH - OVERCLOCK Sub-branch (5 skills)
    // ═══════════════════════════════════════════════════════════════
    browser_oc_1: {
        id: 'browser_oc_1',
        name: { en: 'Heat Sink', fr: 'Dissipateur' },
        icon: '❄️',
        description: { en: '-20% overheat rate.', fr: '-20% vitesse surchauffe.' },
        cost: 2,
        requires: ['core'],
        branch: 'browser',
        effect: { type: 'oc_heat_reduce', value: 0.20 }
    },
    browser_oc_2: {
        id: 'browser_oc_2',
        name: { en: 'Precision Tuning', fr: 'Réglage Précis' },
        icon: '🎚️',
        description: { en: 'Easier calibration targets.', fr: 'Cibles de calibration plus faciles.' },
        cost: 4,
        requires: ['browser_oc_1'],
        branch: 'browser',
        effect: { type: 'oc_calibration_easy', value: 0.20 }
    },
    browser_oc_3: {
        id: 'browser_oc_3',
        name: { en: 'Power Surge', fr: 'Surtension' },
        icon: '⚡',
        description: { en: '+10% all gains when calibrated.', fr: '+10% gains si calibré.' },
        cost: 6,
        requires: ['browser_oc_2'],
        branch: 'browser',
        effect: { type: 'oc_gain_bonus', value: 0.10 }
    },
    browser_oc_4: {
        id: 'browser_oc_4',
        name: { en: 'Turbo Boost', fr: 'Turbo Boost' },
        icon: '🔥',
        description: { en: 'Double calibration bonus.', fr: 'Double le bonus de calibration.' },
        cost: 10,
        requires: ['browser_oc_3'],
        branch: 'browser',
        effect: { type: 'oc_bonus_mult', value: 2 }
    },
    browser_oc_5: {
        id: 'browser_oc_5',
        name: { en: 'Liquid Cooling', fr: 'Refroidissement Liquide' },
        icon: '💧',
        description: { en: 'No overheat penalty.', fr: 'Pas de pénalité de surchauffe.' },
        cost: 15,
        requires: ['browser_oc_4'],
        branch: 'browser',
        effect: { type: 'oc_no_penalty', value: true }
    }
};

/**
 * Get skills organized by branch
 */
export function getSkillsByBranch() {
    const branches = {
        core: [],
        miner: [],
        browser: [],
        machine: []
    };

    Object.values(SKILL_TREE).forEach(skill => {
        branches[skill.branch].push(skill);
    });

    return branches;
}

/**
 * Get ordered skill chain for a branch (following requires)
 * For miner with sub-branches, returns all unlockable in dependency order
 */
export function getSkillChain(branch) {
    const skills = Object.values(SKILL_TREE).filter(s => s.branch === branch);

    // Sort by dependency order
    const ordered = [];
    const remaining = [...skills];

    while (remaining.length > 0) {
        const next = remaining.find(s =>
            s.requires.every(req =>
                ordered.some(o => o.id === req) ||
                SKILL_TREE[req]?.branch !== branch
            )
        );
        if (next) {
            ordered.push(next);
            remaining.splice(remaining.indexOf(next), 1);
        } else {
            break;
        }
    }

    return ordered;
}

/**
 * Get skills for a specific miner sub-branch
 */
export function getMinerSubBranch(subBranch) {
    const prefix = `miner_${subBranch}_`;
    return Object.values(SKILL_TREE)
        .filter(s => s.id.startsWith(prefix))
        .sort((a, b) => {
            const aNum = parseInt(a.id.split('_').pop());
            const bNum = parseInt(b.id.split('_').pop());
            return aNum - bNum;
        });
}

/**
 * Get all miner sub-branches
 */
export function getMinerSubBranches() {
    return ['gain', 'range', 'attempts', 'economy', 'mastery'];
}

/**
 * Get skills for a specific browser sub-branch
 */
export function getBrowserSubBranch(subBranch) {
    const prefix = `browser_${subBranch}_`;
    return Object.values(SKILL_TREE)
        .filter(s => s.id.startsWith(prefix))
        .sort((a, b) => {
            const aNum = parseInt(a.id.split('_').pop());
            const bNum = parseInt(b.id.split('_').pop());
            return aNum - bNum;
        });
}

/**
 * Get all browser sub-branches
 */
export function getBrowserSubBranches() {
    return ['shop', 'av', 'trade', 'oc'];
}

/**
 * Get skill by ID
 */
export function getSkill(id) {
    return SKILL_TREE[id] || null;
}

/**
 * Get all skill IDs
 */
export function getAllSkillIds() {
    return Object.keys(SKILL_TREE);
}

