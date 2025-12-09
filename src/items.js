// --- FACTORIES ---
const createJoker = (data) => ({
    type: 'passive',
    rarity: 'common',
    trigger: 'none',
    ...data
});

const createScript = (data) => ({
    type: 'consumable',
    ...data
});

export const JOKERS = [
    createJoker({
        id: 'crypto_miner',
        name: 'Crypto Miner',
        description: '+5$ pour chaque essai non utilisé à la fin du round.',
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
        name: 'L\'Optimiste',
        description: 'Les gains des essais 6 et 7 sont multipliés par x10.',
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
        name: 'Le Sniper',
        description: 'Victoire exacte à l\'essai 4 donne +200$.',
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
        name: 'Extension RAM',
        description: '+1 Essai max par manche.',
        price: 15,
        rarity: 'rare',
        trigger: 'onRoundStart',
        execute: (game) => {
            game.maxAttempts += 1;
        }
    }),
    createJoker({
        id: 'fibonacci',
        name: 'Fibonacci',
        description: 'Si le nombre mystère est un nombre de Fibonacci, gain x2.',
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
        name: 'Parity Check',
        description: 'Indique en permanence si le nombre mystère est PAIR ou IMPAIR.',
        price: 8,
        trigger: 'onRoundStart',
        execute: (game) => {
             return { message: `PARITY: ${game.mysteryNumber % 2 === 0 ? 'EVEN' : 'ODD'}` };
        }
    }),
    createJoker({
        id: 'modulo_operator',
        name: 'Modulo Operator',
        description: 'Révèle le dernier chiffre du nombre mystère (Unités).',
        price: 15,
        rarity: 'rare',
        trigger: 'onRoundStart',
        execute: (game) => {
             return { message: `MODULO: Ends with ${game.mysteryNumber % 10}` };
        }
    }),
    createJoker({
        id: 'root_access',
        name: 'Root Access',
        description: 'Au début du round, réduit automatiquement l\'intervalle de moitié.',
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
        name: 'Glitch Hunter',
        description: 'Si le nombre mystère contient un "7", il est marqué visuellement.',
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
        name: 'Even Flow',
        description: 'Les nombres mystères seront TOUJOURS Pairs.',
        price: 10,
        rarity: 'uncommon',
        trigger: 'rng_validation',
        execute: (game, candidate) => candidate % 2 === 0
    }),
    createJoker({
        id: 'lazy_dev',
        name: 'Lazy Dev',
        description: 'Le nombre mystère sera toujours un multiple de 10. Gains divisés par 2.',
        price: 12,
        rarity: 'rare',
        trigger: 'rng_validation', // Also has calculateGain effect? Needs multi-trigger support or separate items. 
        // For now, we can handle the gain reduction in a separate property or check.
        // Or we can register it twice? No, ID must be unique.
        // Let's use a special 'hooks' object or just handle it in game.js by checking ID for the secondary effect?
        // OR: The user's request is to refactor for scalability.
        // Let's make 'trigger' an array? Or just add 'triggers' object?
        // For simplicity, let's keep 'trigger' as primary, and maybe 'secondaryTriggers'?
        // Actually, 'lazy_dev' has 2 effects: RNG constraint AND Gain reduction.
        // I'll implement 'rng_validation' here, and for the gain reduction, I'll add a 'calculateGain' hook.
        // But the current structure supports one 'trigger'.
        // I will change the structure to support multiple hooks if needed, or just use the ID check for the secondary effect for now to keep it simple, 
        // BUT the goal is to remove ID checks.
        // So, I will change the structure to allow an array of hooks.
        hooks: {
            rng_validation: (game, candidate) => candidate % 10 === 0,
            calculateGain: (game, baseGain) => Math.floor(baseGain / 2)
        }
    }),
    createJoker({
        id: 'mirror_server',
        name: 'Mirror Server',
        description: 'Le nombre mystère est identique à celui du round précédent (1 fois par niveau).',
        price: 8,
        trigger: 'onRoundStart',
        execute: (game) => {
            if (game.round === 2 && game.previousMysteryNumber !== undefined) {
                game.mysteryNumber = game.previousMysteryNumber;
                return { message: "MIRROR: Reusing previous number." };
            }
        }
    }),
    // --- CURSED JOKERS ---
    createJoker({
        id: 'spaghetti_code',
        name: 'Spaghetti Code',
        description: '+100$ à chaque victoire, mais l\'intervalle est caché.',
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
        name: 'Memory Leak',
        description: 'Score x3, mais -1 Essai Max à chaque round gagné (min 3).',
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
    })
];

export const SCRIPTS = [
    createScript({
        id: 'sudo_reveal',
        name: 'sudo_reveal.exe',
        description: 'Révèle si le nombre est PAIR ou IMPAIR.',
        price: 4,
        execute: (game) => {
            const parity = game.mysteryNumber % 2 === 0 ? 'PAIR' : 'IMPAIR';
            return { success: true, message: `SYSTEM: Le nombre est ${parity}.` };
        }
    }),
    createScript({
        id: 'ping_range',
        name: 'ping_range.sh',
        description: 'Rétrécit l\'intervalle de 20% (coupe les extrêmes).',
        price: 6,
        execute: (game) => {
            const range = game.max - game.min;
            const cut = Math.floor(range * 0.1); // 10% each side
            game.min += cut;
            game.max -= cut;
            if (game.mysteryNumber < game.min) game.min = game.mysteryNumber;
            if (game.mysteryNumber > game.max) game.max = game.mysteryNumber;
            return { success: true, message: `SYSTEM: Intervalle réduit : [${game.min} - ${game.max}]` };
        }
    }),
    createScript({
        id: 'cash_inject',
        name: 'cash_inject.js',
        description: '+20$ immédiat, mais -1 essai ce round.',
        price: 2,
        execute: (game) => {
            game.cash += 20;
            game.maxAttempts -= 1;
            return { success: true, message: 'SYSTEM: Injection réussie. RAM corrompue (-1 essai).' };
        }
    }),
    createScript({
        id: 'git_bisect',
        name: 'git_bisect.sh',
        description: 'Joue automatiquement le meilleur coup mathématique.',
        price: 3,
        execute: (game) => {
            const optimal = Math.floor((game.min + game.max) / 2);
            return { autoPlay: optimal, success: true, message: `AUTO: Guessing ${optimal}` };
        }
    }),
    createScript({
        id: 'console_log',
        name: 'console.log()',
        description: 'Affiche 3 nombres potentiels. L\'un d\'eux est le bon.',
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
        name: 'ctrl_z',
        description: 'Annule le dernier essai (Récupère +1 Essai).',
        price: 8,
        execute: (game) => {
            if (game.attempts < game.maxAttempts) {
                game.attempts = Math.max(0, game.attempts - 1); 
                return { success: true, message: 'UNDO success. Attempt restored.' };
            }
            return { success: false, message: 'Rien à annuler.' };
        }
    }),
    createScript({
        id: 'hotfix',
        name: 'hotfix.patch',
        description: 'Si le nombre est trouvé au prochain coup, gain +50$.',
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
        name: 'The Firewall',
        description: 'Aucune indication "Brûlant".',
        level: 1
    },
    {
        id: 'packet_loss',
        name: 'Packet Loss',
        description: '50% de chance que votre essai ne donne aucun indice (mais consomme un essai).',
        level: 2
    }
];
