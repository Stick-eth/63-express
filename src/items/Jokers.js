import { createJoker } from './ItemFactory.js';
export const JOKERS = [
    createJoker({
        id: 'crypto_miner',
        name: { en: 'Crypto Miner', fr: 'Crypto Mineur' },
        icon: '⛏️',
        description: { en: 'Gain increases by 50% for each unused attempt.', fr: 'Le gain augmente de 50% pour chaque essai non utilisé.' },
        price: 6,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            const unused = game.maxAttempts - game.attempts;
            if (unused > 0) {
                return baseGain * (1 + (0.5 * unused));
            }
            return baseGain;
        }
    }),
    createJoker({
        id: 'optimist',
        name: { en: 'The Optimist', fr: 'L\'Optimiste' },
        icon: '🌞',
        description: { en: 'Gains for attempts 6 and 7 are multiplied by x12.', fr: 'Les gains des essais 6 et 7 sont multipliés par x12.' },
        price: 8,
        rarity: 'uncommon',
        maxQuantity: 1,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.attempts >= 6) {
                return baseGain * 12;
            }
            return baseGain;
        }
    }),
    createJoker({
        id: 'sniper',
        name: { en: 'The Sniper', fr: 'Le Sniper' },
        icon: '🎯',
        description: { en: 'Exact win on attempt 4 gives +1000$.', fr: 'Victoire exacte à l\'essai 4 donne +1000$.' },
        price: 10,
        rarity: 'rare',
        trigger: 'onWin',
        execute: (game) => {
            if (game.attempts === 4) {
                game.cash += 1000;
                return { message: 'HEADSHOT! +1000$', logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'ram_extension',
        name: { en: 'RAM Extension', fr: 'Extension RAM' },
        icon: '💾',
        description: { en: '+1 Max Attempt per round.', fr: '+1 Essai max par manche.' },
        price: 15,
        rarity: 'rare',
        trigger: 'onRoundStart',
        execute: (game) => {
            game.maxAttempts += 1;
        }
    }),
    // --- INFO & LOGIC JOKERS ---
    createJoker({
        id: 'parity_check',
        name: { en: 'Parity Check', fr: 'Parity Check' },
        icon: '⚖️',
        description: { en: 'Permanently indicates if mystery number is EVEN or ODD.', fr: 'Indique en permanence si le nombre mystère est PAIR ou IMPAIR.' },
        maxQuantity: 1,
        trigger: 'onRoundStart',
        execute: (game) => {
            return { message: `PARITY: ${game.mysteryNumber % 2 === 0 ? 'EVEN' : 'ODD'}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'modulo_operator',
        name: { en: 'Modulo Operator', fr: 'Modulo Operator' },
        icon: '➗',
        description: { en: 'Reveals the last digit of the mystery number.', fr: 'Révèle le dernier chiffre du nombre mystère (Unités).' },
        price: 15,
        rarity: 'rare',
        maxQuantity: 1,
        trigger: 'onRoundStart',
        execute: (game) => {
            return { message: `MODULO: Ends with ${game.mysteryNumber % 10}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'checksum',
        name: { en: 'Checksum', fr: 'Checksum' },
        icon: '🔢',
        description: { en: 'Reveals the sum of digits of the mystery number (e.g., 42 → 6).', fr: 'Révèle la somme des chiffres du nombre mystère (ex: 42 → 6).' },
        price: 12,
        rarity: 'uncommon',
        maxQuantity: 1,
        trigger: 'onRoundStart',
        execute: (game) => {
            const digitSum = game.mysteryNumber.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
            return { message: `CHECKSUM: Digit sum = ${digitSum}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'root_access',
        name: { en: 'Root Access', fr: 'Root Access' },
        icon: '#️⃣',
        description: { en: 'At round start, reduces interval range by 1.5x.', fr: 'Au début du round, réduit la taille de l\'intervalle de 1.5x.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'onRoundStart',
        execute: (game) => {
            const currentRange = game.max - game.min;
            const targetSize = Math.floor(currentRange / 1.5);

            // Determine possible start positions for the new window
            // The window must contain the mysteryNumber
            // Window Start <= mysteryNumber
            // Window End >= mysteryNumber -> Window Start + targetSize >= mysteryNumber -> Window Start >= mysteryNumber - targetSize

            // Also must be within game bounds
            // Window Start >= game.min
            // Window Start + targetSize <= game.max -> Window Start <= game.max - targetSize

            const minPossibleStart = Math.max(game.min, game.mysteryNumber - targetSize);
            const maxPossibleStart = Math.min(game.mysteryNumber, game.max - targetSize);

            // If range is valid (should be unless targetSize > currentRange which shouldn't happen with divisor > 1)
            if (minPossibleStart <= maxPossibleStart) {
                const newMin = Math.floor(Math.random() * (maxPossibleStart - minPossibleStart + 1)) + minPossibleStart;
                const newMax = newMin + targetSize;

                game.min = newMin;
                game.max = newMax;
                return { message: `ROOT: Range reduced to [${newMin}-${newMax}]`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'glitch_hunter',
        name: { en: 'Glitch Hunter', fr: 'Glitch Hunter' },
        icon: '👾',
        description: { en: 'If mystery number contains "3" or "7", it is visually marked.', fr: 'Si le nombre mystère contient un "3" ou un "7", il est marqué visuellement.' },
        price: 5,
        maxQuantity: 1,
        trigger: 'onRoundStart',
        execute: (game) => {
            const str = game.mysteryNumber.toString();
            if (str.includes('7') || str.includes('3')) {
                return { message: 'GLITCH: Number contains "3" or "7"', logOnly: true };
            }
        }
    }),
    // --- RNG MANIPULATION JOKERS ---
    createJoker({
        id: 'even_flow',
        name: { en: 'Even Flow', fr: 'Even Flow' },
        icon: '🌊',
        description: { en: 'Mystery numbers will ALWAYS be Even.', fr: 'Les nombres mystères seront TOUJOURS Pairs.' },
        price: 10,
        rarity: 'uncommon',
        maxQuantity: 1,
        trigger: 'rng_validation',
        execute: (game, candidate) => candidate % 2 === 0,
        hooks: {
            onRoundStart: (game) => {
                return { message: 'EVEN FLOW: Mystery Number is EVEN', logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'odd_flow',
        name: { en: 'Odd Flow', fr: 'Odd Flow' },
        icon: '🌊',
        description: { en: 'Mystery numbers will ALWAYS be Odd.', fr: 'Les nombres mystères seront TOUJOURS Impairs.' },
        price: 10,
        rarity: 'uncommon',
        trigger: 'rng_validation',
        execute: (game, candidate) => candidate % 2 === 1,
        hooks: {
            onRoundStart: (game) => {
                return { message: 'ODD FLOW: Mystery Number is ODD', logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'lazy_dev',
        name: { en: 'Lazy Dev', fr: 'Lazy Dev' },
        icon: '💤',
        description: { en: 'Mystery number always multiple of 10. Gains halved. Max Attempts -25%.', fr: 'Le nombre mystère est un multiple de 10. Gains / 2. Essais Max -25%.' },
        price: 12,
        rarity: 'rare',
        maxQuantity: 1,
        hooks: {
            rng_validation: (game, candidate) => candidate % 10 === 0,
            calculateGain: (game, baseGain) => Math.floor(baseGain / 2),
            onRoundStart: (game) => {
                game.maxAttempts = Math.floor(game.maxAttempts * 0.75);
            }
        }
    }),
    // --- CURSED JOKERS ---
    createJoker({
        id: 'spaghetti_code',
        name: { en: 'Spaghetti Code', fr: 'Spaghetti Code' },
        icon: '🍝',
        description: { en: '+$1000 to base gain, but interval is hidden.', fr: '+1000$ au gain, mais l\'intervalle est caché.' },
        price: 10,
        rarity: 'rare',
        maxQuantity: 1,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            return baseGain + 1000;
        }
    }),
    createJoker({
        id: 'memory_leak',
        name: { en: 'Memory Leak', fr: 'Memory Leak' },
        icon: '💧',
        description: { en: 'Score x3, but -1 Max Attempt each won round (min 3).', fr: 'Score x3, mais -1 Essai Max à chaque round gagné (min 3).' },
        price: 10,
        rarity: 'rare',
        hooks: {
            calculateGain: (game, baseGain) => baseGain * 3,
            onRoundStart: (game) => {
                game.maxAttempts = Math.max(3, game.maxAttempts - (game.memoryLeakStacks || 0));
            },
            onWin: (game) => {
                game.memoryLeakStacks = (game.memoryLeakStacks || 0) + 1;
            }
        }
    }),
    // --- NEW JOKERS ---
    createJoker({
        id: 'speedrunner',
        name: { en: 'Speedrunner', fr: 'Speedrunner' },
        icon: '⏱️',
        description: { en: 'Gain x2 if found in 3 attempts or less. Else Gain / 2.', fr: 'Gain x2 si trouvé en 3 essais ou moins. Sinon, Gain / 2.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.attempts <= 3) {
                return baseGain * 2;
            }
            return Math.floor(baseGain / 2);
        }
    }),
    createJoker({
        id: 'big_data',
        name: { en: 'Big Data', fr: 'Big Data' },
        icon: '📊',
        description: { en: 'Adds +100 to max range. Gains increased (x1.5).', fr: 'Ajoute +100 à la borne max. Gains augmentés (x1.5).' },
        price: 15,
        rarity: 'rare',
        hooks: {
            getMaxRange: (game, currentRange) => currentRange + 100,
            calculateGain: (game, baseGain) => Math.floor(baseGain * 1.5)
        }
    }),
    createJoker({
        id: 'mirror_dimension',
        name: { en: 'Mirror Dimension', fr: 'Mirror Dimension' },
        icon: '🪞',
        description: { en: 'Gain x2 if you guess the reverse number before winning.', fr: 'Gain x2 si vous devinez l\'inverse du nombre avant de gagner (ex: 45 avant 54).' },
        price: 12,
        rarity: 'uncommon',
        maxQuantity: 1,
        hooks: {
            onGuess: (game, guess) => {
                const targetStr = game.mysteryNumber.toString().padStart(2, '0');
                const reverseTarget = parseInt(targetStr.split('').reverse().join(''));
                if (guess === reverseTarget && guess !== game.mysteryNumber) {
                    game.reverseGuessed = true;
                    return { message: "MIRROR: Reverse pattern matched!", logOnly: true };
                }
            },
            calculateGain: (game, baseGain) => {
                if (game.reverseGuessed) return baseGain * 2;
                return baseGain;
            }
        }
    }),
    createJoker({
        id: 'high_roller',
        name: { en: 'High Roller', fr: 'High Roller' },
        icon: '🎰',
        description: { en: 'Win 2x the mystery number value as bonus.', fr: 'Gagnez 2x la valeur du nombre mystère en bonus.' },
        price: 18,
        rarity: 'legendary',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            return baseGain + (game.mysteryNumber * 2);
        }
    }),
    createJoker({
        id: 'yield_protocol',
        name: { en: 'Yield Protocol', fr: 'Yield Protocol' },
        icon: '📈',
        description: { en: 'Earn 10% interest on current cash on win.', fr: 'Gagnez 10% d\'intérêts sur votre cash actuel à chaque victoire.' },
        price: 15,
        rarity: 'rare',
        trigger: 'onWin',
        execute: (game) => {
            const interest = Math.floor(game.cash * 0.10);
            if (interest > 0) {
                game.cash += interest;
                return { message: `Yield: +$${interest}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'volatility_engine',
        name: { en: 'Volatility Engine', fr: 'Volatility Engine' },
        icon: '📉',
        description: { en: 'Range becomes 0 - [Your Cash]. Win = Mystery Number amount.', fr: 'La range devient 0 - [Votre Cash]. Victoire = Gagnez le montant du nombre secret.' },
        price: 20,
        rarity: 'legendary',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return Math.max(10, game.cash + 1);
        },
        hooks: {
            calculateGain: (game, currentGain) => {
                return game.mysteryNumber;
            }
        }
    }),
    createJoker({
        id: 'heuristic_scanner',
        name: { en: 'Heuristic Scanner', fr: 'Heuristic Scanner' },
        icon: '📡',
        description: { en: 'Tightens range by extra 10% on miss.', fr: 'Réduit l\'écart des bornes de 10% supplémentaires après chaque erreur.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'onMiss',
        execute: (game, guess) => {
            const gap = game.max - game.min;
            const shrink = Math.floor(gap * 0.10);
            if (shrink > 0) {
                if (guess < game.mysteryNumber) {
                    game.min = Math.min(game.max, game.min + shrink);
                } else {
                    game.max = Math.max(game.min, game.max - shrink);
                }
                return { message: `Scanner: Range tightened by ${shrink}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'courageux',
        name: { en: 'Courageous', fr: 'Courageux' },
        icon: '🦁',
        description: { en: 'Increases range by 15%.', fr: 'Augmente la range de 15% (Plus de risques, plus de gains potentiels).' },
        price: 10,
        rarity: 'common',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return Math.floor(currentRange * 1.15);
        }
    }),
    createJoker({
        id: 'econome',
        name: { en: 'Thrifty', fr: 'Économe' },
        icon: '🐷',
        description: { en: 'Shop prices reduced by 20%.', fr: 'Réduit le prix des objets du shop de 20%.' },
        price: 15,
        rarity: 'uncommon',
        trigger: 'calculateShopPrice',
        execute: (game, price) => {
            return Math.floor(price * 0.8);
        }
    }),
    createJoker({
        id: 'endette',
        name: { en: 'Indebted', fr: 'Endetté' },
        icon: '💳',
        description: { en: 'You can have negative cash without losing.', fr: 'Vous pouvez avoir un solde négatif sans perdre la partie.' },
        price: 25,
        rarity: 'legendary',
        trigger: 'checkGameOver',
        execute: () => { }
    }),
    createJoker({
        id: 'temerraire',
        name: { en: 'Daredevil', fr: 'Téméraire' },
        icon: '😈',
        description: { en: 'Cancels Boss effects.', fr: 'Annule les effets des Boss.' },
        price: 20,
        rarity: 'rare',
        trigger: 'preventBoss',
        execute: () => { }
    }),
    createJoker({
        id: 'joueur',
        name: { en: 'Gambler', fr: 'Joueur' },
        icon: '🎲',
        description: { en: 'Adds +21 to max range.', fr: 'Ajoute +21 à la range max.' },
        price: 8,
        rarity: 'common',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return currentRange + 21;
        }
    }),
    createJoker({
        id: 'tres_joueur',
        name: { en: 'Risk Taker', fr: 'Très Joueur' },
        icon: '🎰',
        description: { en: 'Adds +51 to max range.', fr: 'Ajoute +51 à la range max.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return currentRange + 51;
        }
    }),
    createJoker({
        id: 'cosmique',
        name: { en: 'Cosmic', fr: 'Cosmique' },
        icon: '🌌',
        description: { en: 'Shifts range by +100 (e.g. 100-199).', fr: 'Décale les bornes de +100 (ex: 100-199).' },
        price: 18,
        rarity: 'rare',
        trigger: 'getMinRange',
        execute: (game, currentMin) => {
            return currentMin + 100;
        }
    }),
    createJoker({
        id: 'troll',
        name: { en: 'Troll', fr: 'Troll' },
        icon: '🤡',
        description: { en: 'Guess 67 on attempts 6 & 7 consecutively to win $13.', fr: 'Si vous devinez 67 aux essais 6 et 7 consécutivement, gagnez 13$.' },
        price: 6,
        rarity: 'common',
        trigger: 'onGuess',
        execute: (game, guess) => {
            if (game.attempts === 7 && guess === 67) {
                if (game.history[5] === 67) {
                    game.cash += 13;
                    return { message: 'Troll: +$13 (6+7)', logOnly: true };
                }
            }
        }
    }),
    createJoker({
        id: 'rentier',
        name: { en: 'Rentier', fr: 'Rentier' },
        icon: '🏠',
        description: { en: 'Rent divided by 1.2.', fr: 'La rent est divisée par 1.2.' },
        price: 20,
        rarity: 'rare',
        trigger: 'calculateRent',
        execute: (game, rent) => {
            return Math.floor(rent / 1.2);
        }
    }),
    createJoker({
        id: 'allocataire',
        name: { en: 'Beneficiary', fr: 'Allocataire' },
        icon: '🤲',
        description: { en: 'Rent divided by 1.4.', fr: 'La rent est divisée par 1.4.' },
        price: 25,
        rarity: 'legendary',
        trigger: 'calculateRent',
        execute: (game, rent) => {
            return Math.floor(rent / 1.4);
        }
    }),
    createJoker({
        id: 'batman',
        name: { en: 'Batman', fr: 'Batman' },
        icon: '🦇',
        description: { en: 'Gain +$5 per joker owned at round end.', fr: 'Gagnez +5$ par joker possédé à la fin du round.' },
        price: 22,
        rarity: 'rare',
        trigger: 'onWin',
        execute: (game) => {
            const bonus = game.jokers.length * 5;
            game.cash += bonus;
            return { message: `Batman: +$${bonus}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'dark_web',
        name: { en: 'Dark Web', fr: 'Dark Web' },
        icon: '🕸️',
        description: { en: 'Earn 2% daily interest (capped at $50).', fr: 'Gagnez 2% d\'intérêts quotidiens (max 50$).' },
        price: 15,
        rarity: 'rare',
        trigger: 'onRoundStart',
        execute: (game) => {
            const interest = Math.min(50, Math.floor(game.cash * 0.02));
            if (interest > 0) {
                game.cash += interest;
                return { message: `DARK WEB: +$${interest}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'neural_network',
        name: { en: 'Neural Network', fr: 'Reseau Neuronal' },
        icon: '🧠',
        description: { en: 'Gain multiplier increases by 0.1 each round.', fr: 'Le multiplicateur de gain augmente de 0.1 chaque round.' },
        price: 12,
        rarity: 'rare',
        modifier: 1,
        trigger: 'onRoundStart',
        execute: (game, val, joker) => {
            joker.modifier = (joker.modifier || 1) + 0.1;
            return { message: `NEURAL: Learning... x${joker.modifier.toFixed(1)}` };
        },
        hooks: {
            calculateGain: (game, baseGain, joker) => {
                return Math.floor(baseGain * (joker.modifier || 1));
            }
        }
    }),
    // --- NEW COMMON JOKERS ---
    createJoker({
        id: 'bug_bounty',
        name: { en: 'Bug Bounty', fr: 'Bug Bounty' },
        icon: '🐛',
        description: { en: 'Gain 2% of Rent on win (Min $5).', fr: 'Gagnez 2% du Loyer par victoire (Min 5$).' },
        price: 4,
        rarity: 'common',
        trigger: 'onWin',
        execute: (game) => {
            const amount = Math.max(5, Math.floor(game.rent * 0.02));
            game.cash += amount;
            return { message: `Bounty: +$${amount}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'junior_dev',
        name: { en: 'Junior Dev', fr: 'Junior Dev' },
        icon: '👶',
        description: { en: 'Gain 1% of Rent on buy (Min $2).', fr: 'Gagnez 1% du Loyer à l\'achat (Min 2$).' },
        price: 5,
        rarity: 'common',
        trigger: 'onBuy',
        execute: (game) => {
            const amount = Math.max(2, Math.floor(game.rent * 0.01));
            game.cash += amount;
            return { message: `Junior: +$${amount}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'clean_code',
        name: { en: 'Clean Code', fr: 'Clean Code' },
        icon: '🧹',
        description: { en: 'Gain 1% of Rent at round start (Min $2).', fr: 'Gagnez 1% du Loyer au début du round (Min 2$).' },
        price: 6,
        rarity: 'common',
        trigger: 'onRoundStart',
        execute: (game) => {
            const amount = Math.max(2, Math.floor(game.rent * 0.01));
            game.cash += amount;
            return { message: `Clean: +$${amount}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'patch_tuesday',
        name: { en: 'Patch Tuesday', fr: 'Patch Tuesday' },
        icon: '📅',
        description: { en: 'Max Range reduced by Level.', fr: 'Borne Max réduite du Niveau actuel.' },
        price: 4,
        rarity: 'common',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return currentRange - Math.max(1, game.level);
        }
    }),
    createJoker({
        id: 'legacy_support',
        name: { en: 'Legacy Support', fr: 'Legacy Support' },
        icon: '🏛️',
        description: { en: 'Min Range increased by Level.', fr: 'Borne Min augmentée du Niveau actuel.' },
        price: 4,
        rarity: 'common',
        trigger: 'getMinRange',
        execute: (game, currentMin) => {
            return currentMin + Math.max(1, game.level);
        }
    }),
    createJoker({
        id: 'unit_test',
        name: { en: 'Unit Test', fr: 'Unit Test' },
        icon: '✅',
        description: { en: 'Gain 0.5% of Rent on ODD guess (Min $1).', fr: 'Gagnez 0.5% du Loyer sur IMPAIR (Min 1$).' },
        price: 5,
        rarity: 'common',
        trigger: 'onGuess',
        execute: (game, guess) => {
            if (guess % 2 !== 0) {
                const amount = Math.max(1, Math.floor(game.rent * 0.005));
                game.cash += amount;
                return { message: `Unit Test: +$${amount}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'code_review',
        name: { en: 'Code Review', fr: 'Code Review' },
        icon: '👓',
        description: { en: 'Gain 0.5% of Rent on EVEN guess (Min $1).', fr: 'Gagnez 0.5% du Loyer sur PAIR (Min 1$).' },
        price: 5,
        rarity: 'common',
        trigger: 'onGuess',
        execute: (game, guess) => {
            if (guess % 2 === 0) {
                const amount = Math.max(1, Math.floor(game.rent * 0.005));
                game.cash += amount;
                return { message: `Review: +$${amount}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'refactoring',
        name: { en: 'Refactoring', fr: 'Refactoring' },
        icon: '♻️',
        description: { en: 'Gain 1% of Rent on sell (Min $2).', fr: 'Gagnez 1% du Loyer à la vente (Min 2$).' },
        price: 5,
        rarity: 'common',
        trigger: 'onSell',
        execute: (game) => {
            const amount = Math.max(2, Math.floor(game.rent * 0.01));
            game.cash += amount;
            return { message: `Refactor: +$${amount}`, logOnly: true };
        }
    }),
    createJoker({
        id: 'open_source',
        name: { en: 'Open Source', fr: 'Open Source' },
        icon: '🐧',
        description: { en: 'Shop prices -0.5% of Rent (Min $1).', fr: 'Prix du shop -0.5% du Loyer (Min 1$).' },
        price: 8,
        rarity: 'common',
        trigger: 'calculateShopPrice',
        execute: (game, price) => {
            const discount = Math.max(1, Math.floor(game.rent * 0.005));
            return Math.max(1, price - discount);
        }
    }),
    createJoker({
        id: 'stack_overflow',
        name: { en: 'Stack Overflow', fr: 'Stack Overflow' },
        icon: '🥞',
        description: { en: 'Gain 1% of Rent on duplicate guess (Min $2).', fr: 'Gagnez 1% du Loyer sur doublon (Min 2$).' },
        price: 3,
        rarity: 'common',
        trigger: 'onGuess',
        execute: (game, guess) => {
            const count = game.history.filter(h => h === guess).length;
            if (count > 1) {
                const amount = Math.max(2, Math.floor(game.rent * 0.01));
                game.cash += amount;
                return { message: `Overflow: +$${amount}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'snowball',
        name: { en: 'Snowball', fr: 'Boule de Neige' },
        icon: '❄️',
        description: { en: 'Each round, gain a copy of a random owned joker (except Snowball).', fr: 'Chaque round, recevez une copie d\'un joker possédé au hasard (sauf Boule de Neige).' },
        price: 25,
        rarity: 'legendary',
        trigger: 'onRoundStart',
        execute: (game) => {
            const candidates = game.jokers.filter(j => j.id !== 'snowball');
            if (candidates.length > 0) {
                const target = candidates[Math.floor(Math.random() * candidates.length)];
                if (target.quantity < (target.maxQuantity || Infinity)) {
                    target.quantity++;
                    return { message: `Snowball: +1 ${target.name.en}`, logOnly: true };
                }
            }
        }
    }),
    createJoker({
        id: 'compound_interest',
        name: { en: 'Compound Interest', fr: 'Intérêts Composés' },
        icon: '🏦',
        description: { en: 'Gain +1% of your cash on win.', fr: 'Gagnez +1% de votre cash à chaque victoire.' },
        price: 10,
        rarity: 'uncommon',
        trigger: 'onWin',
        execute: (game) => {
            const interest = Math.floor(game.cash * 0.01);
            if (interest > 0) {
                game.cash += interest;
                return { message: `Interest: +$${interest}`, logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'range_extender',
        name: { en: 'Range Extender', fr: 'Extension de Portée' },
        icon: '🔭',
        description: { en: '+10 to Max Range.', fr: '+10 à la borne Max.' },
        price: 6,
        rarity: 'common',
        trigger: 'getMaxRange',
        execute: (game, currentRange) => {
            return currentRange + 10;
        }
    }),
    createJoker({
        id: 'generous',
        name: { en: 'Generous', fr: 'Généreux' },
        icon: '🎁',
        description: { en: 'Win if guess is within +/- 2 (Stackable).', fr: 'Victoire si le nombre est à +/- 2 près (Cumulable).' },
        price: 20,
        rarity: 'rare',
        trigger: 'none',
        execute: () => { }
    }),
    createJoker({
        id: 'firewall',
        name: { en: 'Firewall', fr: 'Pare-feu' },
        icon: '🛡️',
        description: { en: 'First error of each round does not consume an attempt.', fr: 'La première erreur de chaque round ne consomme pas d\'essai.' },
        price: 18,
        rarity: 'rare',
        trigger: 'none', // Handled in handleMiss
        execute: () => { }
    }),
    createJoker({
        id: 'script_kiddie',
        name: { en: 'Script Kiddie', fr: 'Script Kiddie' },
        icon: '🧸',
        description: { en: '10% chance to recycle used scripts (Max 50%).', fr: '10% de chance de recycler les scripts utilisés (Max 50%).' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'none', // Handled in useScript
        execute: () => { }
    }),
    createJoker({
        id: 'garbage_collector',
        name: { en: 'Garbage Collector', fr: 'Ramasse-miettes' },
        icon: '🗑️',
        description: { en: 'Gain $2 when using a script.', fr: 'Gagnez 2$ lors de l\'utilisation d\'un script.' },
        price: 8,
        rarity: 'common',
        trigger: 'onScriptUse',
        execute: (game) => {
            game.cash += 2;
            return { message: 'GC: +$2', logOnly: true };
        }
    }),
    createJoker({
        id: 'loan_shark',
        name: { en: 'Loan Shark', fr: 'Usurier' },
        icon: '🦈',
        description: { en: '+$50 Cash now, but Rent +$5 permanently.', fr: '+50$ Cash maintenant, mais Loyer +5$ permanent.' },
        price: 0,
        rarity: 'common',
        trigger: 'onBuy',
        execute: (game) => {
            game.cash += 50;
            return { message: 'LOAN: +$50', logOnly: true };
        },
        hooks: {
            calculateRent: (game, rent) => rent + 5
        }
    }),
    createJoker({
        id: 'zero_day',
        name: { en: 'Zero Day', fr: 'Zero Day' },
        icon: '☢️',
        description: { en: 'Win on first attempt gives +$100.', fr: 'Gagner du premier coup donne +100$.' },
        price: 25,
        rarity: 'legendary',
        trigger: 'onWin',
        execute: (game) => {
            if (game.attempts === 1) {
                game.cash += 100;
                return { message: 'ZERO DAY: +$100', logOnly: true };
            }
        }
    }),
    createJoker({
        id: 'blockchain',
        name: { en: 'Blockchain', fr: 'Blockchain' },
        icon: '🔗',
        description: { en: 'Gain $1 for every unique guess made this run.', fr: 'Gagnez 1$ pour chaque nombre unique deviné dans cette partie.' },
        price: 15,
        rarity: 'rare',
        trigger: 'onWin',
        execute: (game) => {
            const bonus = game.uniqueGuesses.size;
            game.cash += bonus;
            return { message: `BLOCKCHAIN: +$${bonus}`, logOnly: true };
        }
    })
];
