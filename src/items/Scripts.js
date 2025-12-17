import { createScript } from './ItemFactory.js';
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
        description: { en: '+$25 immediate, but -1 attempt this round.', fr: '+25$ immédiat, mais -1 essai ce round.' },
        price: 2,
        execute: (game) => {
            game.cash += 25;
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
