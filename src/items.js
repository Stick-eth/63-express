// --- FACTORIES ---
const createJoker = (data) => ({
    type: 'passive',
    rarity: 'common',
    trigger: 'none',
    icon: '🃏', // Default icon
    maxQuantity: Infinity, // Default to unlimited
    ...data
});

const createScript = (data) => ({
    type: 'consumable',
    icon: '📜', // Default icon
    ...data
});

export const JOKERS = [
    createJoker({
        id: 'crypto_miner',
        name: { en: 'Crypto Miner', fr: 'Crypto Mineur' },
        icon: '⛏️',
        description: { en: '+$5 for each unused attempt at round end.', fr: '+5$ pour chaque essai non utilisé à la fin du round.' },
        price: 6,
        trigger: 'onWin',
        execute: (game) => {
            const unused = game.maxAttempts - game.attempts;
            const bonus = unused * 5;
            game.cash += bonus;
            return { message: `Mining... +${bonus}$`, logOnly: true };
        }
    }),
    createJoker({
        id: 'optimist',
        name: { en: 'The Optimist', fr: 'L\'Optimiste' },
        icon: '🌞',
        description: { en: 'Gains for attempts 6 and 7 are multiplied by x10.', fr: 'Les gains des essais 6 et 7 sont multipliés par x10.' },
        price: 8,
        rarity: 'uncommon',
        maxQuantity: 1,
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.attempts >= 6) {
                return baseGain * 10;
            }
            return baseGain;
        }
    }),
    createJoker({
        id: 'sniper',
        name: { en: 'The Sniper', fr: 'Le Sniper' },
        icon: '🎯',
        description: { en: 'Exact win on attempt 4 gives +200$.', fr: 'Victoire exacte à l\'essai 4 donne +200$.' },
        price: 10,
        rarity: 'rare',
        trigger: 'onWin',
        execute: (game) => {
            if (game.attempts === 4) {
                game.cash += 200;
                return { message: 'HEADSHOT! +200$', logOnly: true };
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
    createJoker({
        id: 'fibonacci',
        name: { en: 'Fibonacci', fr: 'Fibonacci' },
        icon: '🐚',
        description: { en: 'If mystery number is a Fibonacci number, gain x2.', fr: 'Si le nombre mystère est un nombre de Fibonacci, gain x2.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
            if (fib.includes(game.mysteryNumber)) {
                return baseGain * 2;
            }
            return baseGain;
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
        id: 'root_access',
        name: { en: 'Root Access', fr: 'Root Access' },
        icon: '#️⃣',
        description: { en: 'At round start, automatically halves the interval.', fr: 'Au début du round, réduit automatiquement l\'intervalle de moitié.' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'onRoundStart',
        execute: (game) => {
            const mid = Math.floor((game.min + game.max) / 2);
            if (game.mysteryNumber <= mid) {
                game.max = mid;
            } else {
                game.min = mid + 1;
            }
            return { message: `ROOT: Zone restreinte à [${game.min}-${game.max}]`, logOnly: true };
        }
    }),
    createJoker({
        id: 'glitch_hunter',
        name: { en: 'Glitch Hunter', fr: 'Glitch Hunter' },
        icon: '👾',
        description: { en: 'If mystery number contains "7", it is visually marked.', fr: 'Si le nombre mystère contient un "7", il est marqué visuellement.' },
        price: 5,
        maxQuantity: 1,
        trigger: 'onRoundStart',
        execute: (game) => {
            if (game.mysteryNumber.toString().includes('7')) {
                return { message: 'GLITCH: Number contains "7"', logOnly: true };
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
        execute: (game, candidate) => candidate % 2 === 0
    }),
    createJoker({
        id: 'lazy_dev',
        name: { en: 'Lazy Dev', fr: 'Lazy Dev' },
        icon: '💤',
        description: { en: 'Mystery number always multiple of 10. Gains halved.', fr: 'Le nombre mystère sera toujours un multiple de 10. Gains divisés par 2.' },
        price: 12,
        rarity: 'rare',
        maxQuantity: 1,
        hooks: {
            rng_validation: (game, candidate) => candidate % 10 === 0,
            calculateGain: (game, baseGain) => Math.floor(baseGain / 2)
        }
    }),
    // --- CURSED JOKERS ---
    createJoker({
        id: 'spaghetti_code',
        name: { en: 'Spaghetti Code', fr: 'Spaghetti Code' },
        icon: '🍝',
        description: { en: '+$100 on win, but interval is hidden.', fr: '+100$ à chaque victoire, mais l\'intervalle est caché.' },
        price: 10,
        rarity: 'rare',
        maxQuantity: 1,
        trigger: 'onWin',
        execute: (game) => {
            game.cash += 100;
            return { message: 'SPAGHETTI: +100$', logOnly: true };
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
        id: 'temerraire',
        name: { en: 'Daredevil', fr: 'Téméraire' },
        icon: '�',
        description: { en: 'Cancels Boss effects.', fr: 'Annule les effets des Boss.' },
        price: 20,
        rarity: 'rare',
        trigger: 'preventBoss',
        execute: () => {}
    
    }),
    createJoker({
        id: 'temerraire',
        name: { en: 'Daredevil', fr: 'Téméraire' },
        icon: '😈',
        description: { en: 'Cancels Boss effects.', fr: 'Annule les effets des Boss.' },
        price: 20,
        rarity: 'rare',
        trigger: 'preventBoss',
        execute: () => {}
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
        id: 'tricheur',
        name: { en: 'Cheater', fr: 'Tricheur' },
        icon: '🃏',
        description: { en: 'You can hold 1 extra joker.', fr: 'Vous pouvez posséder 1 joker supplémentaire.' },
        price: 30,
        rarity: 'legendary',
        trigger: 'getMaxJokerSlots',
        execute: (game, slots) => {
            return slots + 1;
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
        execute: () => {}
    }),
    createJoker({
        id: 'firewall',
        name: { en: 'Firewall', fr: 'Pare-feu' },
        icon: '🛡️',
        description: { en: 'First error of each round does not consume an attempt.', fr: 'La première erreur de chaque round ne consomme pas d\'essai.' },
        price: 18,
        rarity: 'rare',
        trigger: 'none', // Handled in handleMiss
        execute: () => {}
    }),
    createJoker({
        id: 'script_kiddie',
        name: { en: 'Script Kiddie', fr: 'Script Kiddie' },
        icon: '🧸',
        description: { en: '10% chance to recycle used scripts (Max 50%).', fr: '10% de chance de recycler les scripts utilisés (Max 50%).' },
        price: 12,
        rarity: 'uncommon',
        trigger: 'none', // Handled in useScript
        execute: () => {}
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

export const SCRIPTS = [
    createScript({
        id: 'sudo_reveal',
        name: { en: 'sudo_reveal.exe', fr: 'sudo_reveal.exe' },
        icon: '👁️',
        description: { en: 'Reveals if number is EVEN or ODD.', fr: 'Révèle si le nombre est PAIR ou IMPAIR.' },
        price: 4,
        execute: (game) => {
            const parity = game.mysteryNumber % 2 === 0 ? 'PAIR' : 'IMPAIR';
            return { success: true, message: `SYSTEM: ${parity}` };
        }
    }),
    createScript({
        id: 'ping_range',
        name: { en: 'ping_range.sh', fr: 'ping_range.sh' },
        icon: '📡',
        description: { en: 'Shrinks range by 20%.', fr: 'Rétrécit l\'intervalle de 20% (coupe les extrêmes).' },
        price: 6,
        execute: (game) => {
            const range = game.max - game.min;
            const cut = Math.floor(range * 0.1);
            game.min += cut;
            game.max -= cut;
            if (game.mysteryNumber < game.min) game.min = game.mysteryNumber;
            if (game.mysteryNumber > game.max) game.max = game.mysteryNumber;
            return { success: true, message: `SYSTEM: Range reduced: [${game.min} - ${game.max}]` };
        }
    }),
    createScript({
        id: 'cash_inject',
        name: { en: 'cash_inject.js', fr: 'cash_inject.js' },
        icon: '💉',
        description: { en: '+$20 immediate, but -1 attempt this round.', fr: '+20$ immédiat, mais -1 essai ce round.' },
        price: 2,
        execute: (game) => {
            game.cash += 20;
            game.maxAttempts -= 1;
            return { success: true, message: 'SYSTEM: Injection success. RAM corrupted (-1 attempt).' };
        }
    }),
    createScript({
        id: 'git_bisect',
        name: { en: 'git_bisect.sh', fr: 'git_bisect.sh' },
        icon: '🌿',
        description: { en: 'Auto-plays the best mathematical guess.', fr: 'Joue automatiquement le meilleur coup mathématique.' },
        price: 3,
        execute: (game) => {
            const optimal = Math.floor((game.min + game.max) / 2);
            return { autoPlay: optimal, success: true, message: `AUTO: Guessing ${optimal}` };
        }
    }),
    createScript({
        id: 'console_log',
        name: { en: 'console.log()', fr: 'console.log()' },
        icon: '📝',
        description: { en: 'Shows 3 potential numbers. One is correct.', fr: 'Affiche 3 nombres potentiels. L\'un d\'eux est le bon.' },
        price: 5,
        execute: (game) => {
            const potential = [game.mysteryNumber];
            while (potential.length < 3) {
                let fake = Math.floor(Math.random() * 100);
                if (fake >= game.min && fake <= game.max && !potential.includes(fake)) {
                    potential.push(fake);
                }
            }
            potential.sort(() => Math.random() - 0.5);
            return { success: true, message: `LOG: [${potential.join(', ')}]` };
        }
    }),
    createScript({
        id: 'ctrl_z',
        name: { en: 'ctrl_z', fr: 'ctrl_z' },
        icon: '↩️',
        description: { en: 'Undoes last attempt (+1 Attempt).', fr: 'Annule le dernier essai (Récupère +1 Essai).' },
        price: 8,
        execute: (game) => {
            if (game.attempts < game.maxAttempts) {
                game.attempts = Math.max(0, game.attempts - 1); 
                return { success: true, message: 'UNDO success. Attempt restored.' };
            }
            return { success: false, message: 'Nothing to undo.' };
        }
    }),
    createScript({
        id: 'hotfix',
        name: { en: 'hotfix.patch', fr: 'hotfix.patch' },
        icon: '🩹',
        description: { en: 'If found next guess, gain +$50.', fr: 'Si le nombre est trouvé au prochain coup, gain +50$.' },
        price: 4,
        execute: (game) => {
            game.nextGuessBonus = 50;
            return { success: true, message: 'HOTFIX applied. Next win +50$.' };
        }
    }),
    // --- NEW COMMON SCRIPTS ---
    createScript({
        id: 'clear_cache',
        name: { en: 'clear_cache', fr: 'clear_cache' },
        icon: '🗑️',
        description: { en: 'Reduces Max Range by 10.', fr: 'Réduit la borne Max de 10.' },
        price: 10,
        execute: (game) => {
            game.max = Math.max(game.min, game.max - 10);
            return { success: true, message: `CACHE CLEARED: Max is now ${game.max}` };
        }
    }),
    createScript({
        id: 'npm_install',
        name: { en: 'npm install', fr: 'npm install' },
        icon: '📦',
        description: { en: '+1 Attempt this round.', fr: '+1 Essai pour ce round.' },
        price: 3,
        execute: (game) => {
            game.attempts = Math.max(0, game.attempts - 1);
            return { success: true, message: 'DEPENDENCIES INSTALLED: +1 Attempt' };
        }
    }),
    createScript({
        id: 'print_hello',
        name: { en: 'print("Hello")', fr: 'print("Hello")' },
        icon: '👋',
        description: { en: 'Reveals if number is > 50.', fr: 'Révèle si le nombre est > 50.' },
        price: 2,
        execute: (game) => {
            const isGreater = game.mysteryNumber > 50;
            return { success: true, message: `OUTPUT: > 50 ? ${isGreater}` };
        }
    }),
    createScript({
        id: 'debug_mode',
        name: { en: 'debug_mode', fr: 'debug_mode' },
        icon: '🐞',
        description: { en: 'Reveals if number is divisible by 3.', fr: 'Révèle si le nombre est divisible par 3.' },
        price: 2,
        execute: (game) => {
            const isDiv3 = game.mysteryNumber % 3 === 0;
            return { success: true, message: `DEBUG: Divisible by 3 ? ${isDiv3}` };
        }
    }),
    createScript({
        id: 'git_commit',
        name: { en: 'git commit', fr: 'git commit' },
        icon: '💾',
        description: { en: 'Gain +$5 immediately.', fr: 'Gain immédiat de +5$.' },
        price: 2,
        execute: (game) => {
            game.cash += 5;
            return { success: true, message: 'COMMITTED: +$5' };
        }
    }),
    createScript({
        id: 'rm_rf',
        name: { en: 'rm -rf /', fr: 'rm -rf /' },
        icon: '🔥',
        description: { en: 'Increases Min Range by 5.', fr: 'Augmente la borne Min de 5.' },
        price: 2,
        execute: (game) => {
            game.min = Math.min(game.max, game.min + 5);
            return { success: true, message: `FILES DELETED: Min is now ${game.min}` };
        }
    }),
    createScript({
        id: 'chmod_777',
        name: { en: 'chmod 777', fr: 'chmod 777' },
        icon: '🔓',
        description: { en: 'Shrinks range by 5 from both sides.', fr: 'Réduit l\'intervalle de 5 des deux côtés.' },
        price: 3,
        execute: (game) => {
            game.min = Math.min(game.max, game.min + 5);
            game.max = Math.max(game.min, game.max - 5);
            return { success: true, message: `PERMISSIONS OPEN: [${game.min}-${game.max}]` };
        }
    }),
    createScript({
        id: 'ping_localhost',
        name: { en: 'ping 127.0.0.1', fr: 'ping 127.0.0.1' },
        icon: '🔁',
        description: { en: 'Eliminates half of the current range.', fr: 'Élimine la moitié de la zone actuelle.' },
        price: 2,
        execute: (game) => {
            const mid = Math.floor((game.min + game.max) / 2);
            const isLower = game.mysteryNumber <= mid;
            
            if (isLower) {
                game.max = mid;
                return { success: true, message: `PING: Target in lower half [${game.min}-${game.max}]` };
            } else {
                game.min = mid + 1;
                return { success: true, message: `PING: Target in upper half [${game.min}-${game.max}]` };
            }
        }
    }),
    createScript({
        id: 'grep_search',
        name: { en: 'grep "1"', fr: 'grep "1"' },
        icon: '🔍',
        description: { en: 'Reveals if number contains digit "1".', fr: 'Révèle si le nombre contient le chiffre "1".' },
        price: 3,
        execute: (game) => {
            const hasOne = game.mysteryNumber.toString().includes('1');
            return { success: true, message: `GREP: Contains "1" ? ${hasOne}` };
        }
    }),
    createScript({
        id: 'kill_process',
        name: { en: 'kill -9', fr: 'kill -9' },
        icon: '💀',
        description: { en: 'Lose 1 attempt, gain $10.', fr: 'Perdez 1 essai, gagnez 10$.' },
        price: 0,
        execute: (game) => {
            if (game.attempts < game.maxAttempts - 1) {
                game.attempts += 1;
                game.cash += 10;
                return { success: true, message: 'PROCESS KILLED: +$10, -1 Attempt' };
            }
            return { success: false, message: 'Not enough attempts to kill process.' };
        }
    })
];

export const BOSSES = [
    {
        id: 'firewall',
        name: { en: 'The Firewall', fr: 'Le Pare-feu' },
        description: { en: 'No "Burning" hints.', fr: 'Aucune indication "Brûlant".' },
        level: 1
    },
    {
        id: 'packet_loss',
        name: { en: 'Packet Loss', fr: 'Perte de Paquets' },
        description: { en: '50% chance your guess gives no hint.', fr: '50% de chance que votre essai ne donne aucun indice.' },
        level: 2
    }
];
