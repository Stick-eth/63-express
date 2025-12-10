export const bootSequence = [
    "Initializing Binary Hustle Kernel v1.0.0...",
    "Loading modules: [ CPU ] [ MEM ] [ GPU ] [ NET ]",
    "Mounting file system... OK",
    "Checking integrity... OK",
    "Establishing secure connection to localhost...",
    "Access granted.",
    "Starting user interface..."
];

export const loreSequenceEn = [
    "SYSTEM CHECK COMPLETE.",
    "USER: [ANONYMOUS]",
    "STATUS: CRITICAL DEBT",
    "INCOMING MESSAGE...",
    "----------------------------------------",
    "We have no money left.",
    "The landlord is demanding higher rent.",
    "I found this old machine to mine crypto manually.",
    "It's our only chance to survive.",
    "----------------------------------------",
    "INITIALIZING MINING PROTOCOL..."
];

export const loreSequenceFr = [
    "VÉRIFICATION SYSTÈME TERMINÉE.",
    "UTILISATEUR: [ANONYME]",
    "STATUT: DETTE CRITIQUE",
    "MESSAGE ENTRANT...",
    "----------------------------------------",
    "Nous n'avons plus d'argent.",
    "Le proprio nous demande des loyers de plus en plus élevés.",
    "J'ai trouvé cette vieille machine à miner de la crypto manuellement.",
    "C'est la seule chance de m'en sortir.",
    "----------------------------------------",
    "INITIALISATION DU PROTOCOLE DE MINAGE..."
];

export const bankSequenceEn = [
    "CONNECTING TO SECURE SERVER...",
    "AUTHENTICATION: SUCCES",
    "INBOX (1 NEW MESSAGE)",
    "----------------------------------------",
    "FROM: GOLIATH NATONAL BANK",
    "SUBJECT: LOAN REPAYMENT NOTIFICATION",
    "----------------------------------------",
    "Dear Customer,",
    "We confirm recept of your final interest payment.",
    "Your student loan status is now: PA1D_OFF.",
    "Congratulations on staying curent.",
    "We have a special 0ffer for you...",
    "Downloding attachment: future_secure.exe..."
];

export const bankSequenceFr = [
    "CONNEXION AU SERVEUR SÉCURISÉ...",
    "AUTHENTIFICATION: SUCCÈS",
    "BOÎTE DE RÉCEPTION (1 NOUVEAU MESSAGE)",
    "----------------------------------------",
    "DE: GOLIATH NATONAL BANK",
    "OBJET: NOTIFICATION DE REMBOURSEMENT",
    "----------------------------------------",
    "Cher Client,",
    "Nous confirmons la réception de votre dernier paiement d'intérêts.",
    "Statut de votre prêt étudiant: REMBOUR%S3&.",
    "Félitations pour votre régularité.",
    "Nous avons une 0ffre spéciale pour vous...",
    "Téléchargment de la pièce jointe: future_secure.exe..."
];

export const bugSequenceEn = [
    "Download: 10%...",
    "Download: 45%...",
    "Download: 99%...",
    "ERROR: CHECKSUM MISMATCH",
    "WARNING: UNKNOWN EXECUTABLE DETECTED",
    "SYSTEM COMPROMISED",
    "INITIATING DEFENSE PROTOCOLS...",
    "BOSS DETECTED."
];

export const bugSequenceFr = [
    "Téléchargement: 10%...",
    "Téléchargement: 45%...",
    "Téléchargement: 99%...",
    "ERREUR: SOMME DE CONTRÔLE INVALIDE",
    "ATTENTION: EXÉCUTABLE INCONNU DÉTECTÉ",
    "SYSTÈME COMPROMIS",
    "LANCEMENT DES PROTOCOLES DE DÉFENSE...",
    "BOSS DÉTECTÉ."
];

export const phishingSequenceEn = [
    "INCOMING SECURE MESSAGE...",
    "FROM: GOLIATH NATIONAL BANK SECURITY TEAM",
    "SUBJECT: URGENT SECURITY ALERT - PHISHING CAMPAIGN",
    "----------------------------------------",
    "Dear Valued Customer,",
    "We have detected a massive phishing campaign targeting our users.",
    "Fraudulent emails are offering suspicious deals or loan forgiveness.",
    "DO NOT OPEN ANY ATTACHMENTS.",
    "They contain irreversible viruses that may compromise your system.",
    "Stay safe.",
    "----------------------------------------",
    "SYSTEM CLEANUP INITIATED..."
];

export const phishingSequenceFr = [
    "MESSAGE SÉCURISÉ ENTRANT...",
    "DE: ÉQUIPE DE SÉCURITÉ GOLIATH NATIONAL BANK",
    "OBJET: ALERTE SÉCURITÉ URGENTE - CAMPAGNE DE PHISHING",
    "----------------------------------------",
    "Cher Client,",
    "Nous avons détecté une campagne de phishing massive ciblant nos utilisateurs.",
    "Des emails frauduleux proposent des offres suspectes ou des annulations de dettes.",
    "N'OUVREZ AUCUNE PIÈCE JOINTE.",
    "Elles contiennent des virus irréversibles pouvant compromettre votre système.",
    "Restez vigilant.",
    "----------------------------------------",
    "NETTOYAGE SYSTÈME LANCÉ..."
];

export const translations = {
    en: {
        'welcome_hustle': 'Welcome to the Binary Hustle. Crack the code.',
        'run_start': (p) => `MISSION: Find the code (0-99) in ${p?.maxAttempts} attempts. Rent Due: $${p?.rent}.`,
        'round_start': (p) => `Level ${p?.level} - Round ${p?.round}. Rent Due: $${p?.rent}`,
        'boss_round': (p) => `BOSS DETECTED: ${p?.name}. ${p?.desc}`,
        'invalid_guess': 'Invalid input. Enter 0-99.',
        'won_round': (p) => `Access Granted! Gain: $${p?.gain}. Total: $${p?.cash}`,
        'lost_round': (p) => `Access Denied. The code was ${p?.number}.`,
        'higher': (p) => `🔼 HIGHER. Range: [${p?.min} - ${p?.max}]`,
        'lower': (p) => `🔽 LOWER. Range: [${p?.min} - ${p?.max}]`,
        'higher_burning': (p) => `🔥 BURNING! Range: [${p?.min} - ${p?.max}]`,
        'lower_burning': (p) => `🔥 BURNING! Range: [${p?.min} - ${p?.max}]`,
        'shop_welcome': 'Welcome to the Dark Web Market.',
        'browser_welcome': 'Netscape Navigator v1.0. Connected.',
        'game_over_rent': (p) => `Evicted! Cash: $${p?.cash} < Rent: $${p?.rent}`,
        'item_bought': 'Item acquired.',
        'insufficient_funds': 'Insufficient funds.',
        'inventory_full': 'Inventory full.',
        'script_effect': (p) => `> ${p?.text}`
    },
    fr: {
        'welcome_hustle': 'Bienvenue dans le Binary Hustle. Craquez le code.',
        'run_start': (p) => `MISSION: Trouvez le code (0-99) en ${p?.maxAttempts} essais. Loyer: $${p?.rent}.`,
        'round_start': (p) => `Niveau ${p?.level} - Manche ${p?.round}. Loyer: $${p?.rent}`,
        'boss_round': (p) => `BOSS DÉTECTÉ: ${p?.name}. ${p?.desc}`,
        'invalid_guess': 'Entrée invalide. Entrez 0-99.',
        'won_round': (p) => `Accès Autorisé! Gain: $${p?.gain}. Total: $${p?.cash}`,
        'lost_round': (p) => `Accès Refusé. Le code était ${p?.number}.`,
        'higher': (p) => `🔼 PLUS GRAND. Intervalle: [${p?.min} - ${p?.max}]`,
        'lower': (p) => `🔽 PLUS PETIT. Intervalle: [${p?.min} - ${p?.max}]`,
        'higher_burning': (p) => `🔥 BRÛLANT! Intervalle: [${p?.min} - ${p?.max}]`,
        'lower_burning': (p) => `🔥 BRÛLANT! Intervalle: [${p?.min} - ${p?.max}]`,
        'shop_welcome': 'Bienvenue au Marché du Dark Web.',
        'browser_welcome': 'Netscape Navigator v1.0. Connecté.',
        'game_over_rent': (p) => `Expulsé! Cash: $${p?.cash} < Loyer: $${p?.rent}`,
        'item_bought': 'Objet acquis.',
        'insufficient_funds': 'Fonds insuffisants.',
        'inventory_full': 'Inventaire plein.',
        'script_effect': (p) => `> ${p?.text}`
    }
};

export const staticTexts = {
    en: {
        start: '> INITIALIZE_RUN',
        lang: 'LANG: EN',
        theme: (label) => `COLOR: ${label}`,
        resume: '> RESUME_SESSION',
        quit: '> ABORT_RUN',
        paused: 'SYSTEM PAUSED',
        enter: '[ ENTER ]',
        exitShop: '> EXIT_MARKET',
        continue: '> CONTINUE'
    },
    fr: {
        start: '> INITIALISER_RUN',
        lang: 'LANG: FR',
        theme: (label) => `COULEUR: ${label}`,
        resume: '> REPRENDRE',
        quit: '> ABANDONNER',
        paused: 'SYSTÈME EN PAUSE',
        enter: '[ ENTRER ]',
        exitShop: '> QUITTER_MARCHÉ',
        continue: '> CONTINUER'
    }
};
