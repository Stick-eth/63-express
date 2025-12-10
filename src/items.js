// --- FACTORIES ---
const createJoker = (data) => ({
    type: 'passive',
    rarity: 'common',
    trigger: 'none',
    icon: '🃏', // Default icon
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
            return { message: `Mining... +${bonus}$` };
        }
    }),
    createJoker({
        id: 'optimist',
        name: { en: 'The Optimist', fr: 'L\'Optimiste' },
        icon: '🌞',
        description: { en: 'Gains for attempts 6 and 7 are multiplied by x10.', fr: 'Les gains des essais 6 et 7 sont multipliés par x10.' },
        price: 8,
        rarity: 'uncommon',
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
                return { message: 'HEADSHOT! +200$' };
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
        price: 8,
        trigger: 'onRoundStart',
        execute: (game) => {
             return { message: `PARITY: ${game.mysteryNumber % 2 === 0 ? 'EVEN' : 'ODD'}` };
        }
    }),
    createJoker({
        id: 'modulo_operator',
        name: { en: 'Modulo Operator', fr: 'Modulo Operator' },
        icon: '➗',
        description: { en: 'Reveals the last digit of the mystery number.', fr: 'Révèle le dernier chiffre du nombre mystère (Unités).' },
        price: 15,
        rarity: 'rare',
        trigger: 'onRoundStart',
        execute: (game) => {
             return { message: `MODULO: Ends with ${game.mysteryNumber % 10}` };
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
            return { message: `ROOT: Zone restreinte à [${game.min}-${game.max}]` };
        }
    }),
    createJoker({
        id: 'glitch_hunter',
        name: { en: 'Glitch Hunter', fr: 'Glitch Hunter' },
        icon: '👾',
        description: { en: 'If mystery number contains "7", it is visually marked.', fr: 'Si le nombre mystère contient un "7", il est marqué visuellement.' },
        price: 5,
        trigger: 'onRoundStart',
        execute: (game) => {
            if (game.mysteryNumber.toString().includes('7')) {
                return { message: 'GLITCH: Number contains "7"' };
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
        trigger: 'onWin',
        execute: (game) => {
            game.cash += 100;
            return { message: 'SPAGHETTI: +100$' };
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
        id: 'quantum_tens',
        name: { en: 'Quantum Tens', fr: 'Quantum Tens' },
        icon: '⚛️',
        description: { en: 'Reveals tens, but unit changes once per round.', fr: 'Révèle les dizaines, mais l\'unité change une fois par round.' },
        price: 14,
        rarity: 'rare',
        hooks: {
            onRoundStart: (game) => {
                const tens = Math.floor(game.mysteryNumber / 10);
                return { message: `QUANTUM: Starts with ${tens}X` };
            },
            onGuess: (game) => {
                if (!game.quantumChanged && Math.random() < 0.25) {
                    const tens = Math.floor(game.mysteryNumber / 10);
                    let newNumber = -1;
                    let attempts = 0;
                    while (attempts < 20) {
                        const newUnits = Math.floor(Math.random() * 10);
                        const candidate = (tens * 10) + newUnits;
                        if (game.checkJokerConstraints('rng_validation', candidate)) {
                            newNumber = candidate;
                            break;
                        }
                        attempts++;
                    }
                    if (newNumber !== -1 && newNumber !== game.mysteryNumber) {
                        game.mysteryNumber = newNumber;
                        game.quantumChanged = true;
                    }
                }
            }
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
        hooks: {
            onGuess: (game, guess) => {
                const targetStr = game.mysteryNumber.toString().padStart(2, '0');
                const reverseTarget = parseInt(targetStr.split('').reverse().join(''));
                if (guess === reverseTarget && guess !== game.mysteryNumber) {
                    game.reverseGuessed = true;
                    return { message: "MIRROR: Reverse pattern matched!" };
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
                return { message: `Yield: +$${interest}` };
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
                return { message: `Scanner: Range tightened by ${shrink}` };
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
                    return { message: 'Troll: +$13 (6+7)' };
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
            return { message: `Batman: +$${bonus}` };
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
