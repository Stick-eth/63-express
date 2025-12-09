export const JOKERS = [
    {
        id: 'crypto_miner',
        name: 'Crypto Miner',
        description: '+5$ pour chaque essai non utilisé à la fin du round.',
        price: 6,
        rarity: 'common',
        type: 'passive',
        trigger: 'onWin',
        execute: (game) => {
            const unused = game.maxAttempts - game.attempts;
            const bonus = unused * 5;
            game.cash += bonus;
            return { message: `Mining... +${bonus}$` };
        }
    },
    {
        id: 'optimist',
        name: 'L\'Optimiste',
        description: 'Les gains des essais 6 et 7 sont multipliés par x10.',
        price: 8,
        rarity: 'uncommon',
        type: 'passive',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            if (game.attempts >= 6) {
                return baseGain * 10;
            }
            return baseGain;
        }
    },
    {
        id: 'sniper',
        name: 'Le Sniper',
        description: 'Victoire exacte à l\'essai 4 donne +200$.',
        price: 10,
        rarity: 'rare',
        type: 'passive',
        trigger: 'onWin',
        execute: (game) => {
            if (game.attempts === 4) {
                game.cash += 200;
                return { message: 'HEADSHOT! +200$' };
            }
        }
    },
    {
        id: 'ram_extension',
        name: 'Extension RAM',
        description: '+1 Essai max par manche.',
        price: 15,
        rarity: 'rare',
        type: 'passive',
        trigger: 'onRoundStart',
        execute: (game) => {
            game.maxAttempts += 1;
        }
    },
    {
        id: 'fibonacci',
        name: 'Fibonacci',
        description: 'Si le nombre mystère est un nombre de Fibonacci, gain x2.',
        price: 12,
        rarity: 'uncommon',
        type: 'passive',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
            if (fib.includes(game.mysteryNumber)) {
                return baseGain * 2;
            }
            return baseGain;
        }
    },
    // --- INFO & LOGIC JOKERS ---
    {
        id: 'parity_check',
        name: 'Parity Check',
        description: 'Indique en permanence si le nombre mystère est PAIR ou IMPAIR.',
        price: 8,
        rarity: 'common',
        type: 'passive',
        trigger: 'onRoundStart',
        execute: (game) => {
             // Logic handled in UI or Game state
             return { message: `PARITY: ${game.mysteryNumber % 2 === 0 ? 'EVEN' : 'ODD'}` };
        }
    },
    {
        id: 'modulo_operator',
        name: 'Modulo Operator',
        description: 'Révèle le dernier chiffre du nombre mystère (Unités).',
        price: 15,
        rarity: 'rare',
        type: 'passive',
        trigger: 'onRoundStart',
        execute: (game) => {
             return { message: `MODULO: Ends with ${game.mysteryNumber % 10}` };
        }
    },
    {
        id: 'root_access',
        name: 'Root Access',
        description: 'Au début du round, réduit automatiquement l\'intervalle de moitié.',
        price: 12,
        rarity: 'uncommon',
        type: 'passive',
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
    },
    {
        id: 'glitch_hunter',
        name: 'Glitch Hunter',
        description: 'Si le nombre mystère contient un "7", il est marqué visuellement.',
        price: 5,
        rarity: 'common',
        type: 'passive',
        trigger: 'onRoundStart',
        execute: (game) => {
            if (game.mysteryNumber.toString().includes('7')) {
                return { message: 'GLITCH: Number contains "7"' };
            }
        }
    },
    // --- RNG MANIPULATION JOKERS ---
    {
        id: 'even_flow',
        name: 'Even Flow',
        description: 'Les nombres mystères seront TOUJOURS Pairs.',
        price: 10,
        rarity: 'uncommon',
        type: 'passive'
    },
    {
        id: 'lazy_dev',
        name: 'Lazy Dev',
        description: 'Le nombre mystère sera toujours un multiple de 10. Gains divisés par 2.',
        price: 12,
        rarity: 'rare',
        type: 'passive',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            return Math.floor(baseGain / 2);
        }
    },
    {
        id: 'mirror_server',
        name: 'Mirror Server',
        description: 'Le nombre mystère est identique à celui du round précédent (1 fois par niveau).',
        price: 8,
        rarity: 'common',
        type: 'passive'
    },
    // --- CURSED JOKERS ---
    {
        id: 'spaghetti_code',
        name: 'Spaghetti Code',
        description: '+100$ à chaque victoire, mais l\'intervalle est caché.',
        price: 10,
        rarity: 'rare',
        type: 'passive',
        trigger: 'onWin',
        execute: (game) => {
            game.cash += 100;
            return { message: 'SPAGHETTI: +100$' };
        }
    },
    {
        id: 'memory_leak',
        name: 'Memory Leak',
        description: 'Score x3, mais -1 Essai Max à chaque round gagné (min 3).',
        price: 10,
        rarity: 'rare',
        type: 'passive',
        trigger: 'calculateGain',
        execute: (game, baseGain) => {
            return baseGain * 3;
        }
    }
];

export const SCRIPTS = [
    {
        id: 'sudo_reveal',
        name: 'sudo_reveal.exe',
        description: 'Révèle si le nombre est PAIR ou IMPAIR.',
        price: 4,
        type: 'consumable',
        execute: (game) => {
            const parity = game.mysteryNumber % 2 === 0 ? 'PAIR' : 'IMPAIR';
            return { success: true, message: `SYSTEM: Le nombre est ${parity}.` };
        }
    },
    {
        id: 'ping_range',
        name: 'ping_range.sh',
        description: 'Rétrécit l\'intervalle de 20% (coupe les extrêmes).',
        price: 6,
        type: 'consumable',
        execute: (game) => {
            const range = game.max - game.min;
            const cut = Math.floor(range * 0.1); // 10% each side
            game.min += cut;
            game.max -= cut;
            // Ensure mystery number is still inside (cheat check)
            if (game.mysteryNumber < game.min) game.min = game.mysteryNumber;
            if (game.mysteryNumber > game.max) game.max = game.mysteryNumber;
            
            return { success: true, message: `SYSTEM: Intervalle réduit : [${game.min} - ${game.max}]` };
        }
    },
    {
        id: 'cash_inject',
        name: 'cash_inject.js',
        description: '+20$ immédiat, mais -1 essai ce round.',
        price: 2,
        type: 'consumable',
        execute: (game) => {
            game.cash += 20;
            game.maxAttempts -= 1;
            return { success: true, message: 'SYSTEM: Injection réussie. RAM corrompue (-1 essai).' };
        }
    },
    {
        id: 'git_bisect',
        name: 'git_bisect.sh',
        description: 'Joue automatiquement le meilleur coup mathématique.',
        price: 3,
        type: 'consumable',
        execute: (game) => {
            const optimal = Math.floor((game.min + game.max) / 2);
            // The game loop will handle the guess if we return a special property or we can call makeGuess here?
            // Better to return the value and let the UI/Game handle it, or call makeGuess directly if we have access.
            // Since execute takes 'game', we can call game.makeGuess(optimal).
            // BUT, makeGuess might trigger UI updates that we want to control.
            // The user prompt suggested: return { autoPlay: optimal, message: ... }
            return { autoPlay: optimal, success: true, message: `AUTO: Guessing ${optimal}` };
        }
    },
    {
        id: 'console_log',
        name: 'console.log()',
        description: 'Affiche 3 nombres potentiels. L\'un d\'eux est le bon.',
        price: 5,
        type: 'consumable',
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
    },
    {
        id: 'ctrl_z',
        name: 'ctrl_z',
        description: 'Annule le dernier essai (Récupère +1 Essai).',
        price: 8,
        type: 'consumable',
        execute: (game) => {
            if (game.attempts < game.maxAttempts) {
                // We can't easily "undo" the history state perfectly without storing snapshots, 
                // but we can give back an attempt.
                game.attempts = Math.max(0, game.attempts - 1); 
                return { success: true, message: 'UNDO success. Attempt restored.' };
            }
            return { success: false, message: 'Rien à annuler.' };
        }
    },
    {
        id: 'hotfix',
        name: 'hotfix.patch',
        description: 'Si le nombre est trouvé au prochain coup, gain +50$.',
        price: 4,
        type: 'consumable',
        execute: (game) => {
            game.nextGuessBonus = 50;
            return { success: true, message: 'HOTFIX applied. Next win +50$.' };
        }
    }
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
