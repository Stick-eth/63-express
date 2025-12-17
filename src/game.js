import { JOKERS, SCRIPTS, BOSSES } from './items.js';
import { ARCS, STANDARD_ARC } from './arcs.js';
import { ShopSystem } from './systems/ShopSystem.js';
import { TradingSystem } from './systems/TradingSystem.js';
import { AntivirusSystem } from './systems/AntivirusSystem.js';

export class Game {
    constructor() {
        this.cash = 10; // Starting cash
        this.rent = 50; // Starting rent
        this.level = 1;
        this.round = 1;
        this.maxRounds = 3; // Rounds per level

        this.gameState = 'IDLE'; // IDLE, PLAYING, SHOP, GAME_OVER
        this.mysteryNumber = null;
        this.attempts = 0;
        this.maxAttempts = 7; // Base attempts

        this.min = 0;
        this.max = 99;

        this.jokers = []; // Active jokers
        this.scripts = []; // Active scripts
        this.shopInventory = [];
        this.rerollCost = 5;

        this.message = { key: 'welcome_hustle' };
        this.history = [];

        // Base gains for 7 attempts
        this.baseGains = [200, 100, 50, 25, 10, 5, 1];

        this.bossEffect = null;
        this.devMode = false;

        // Arc System
        this.arcQueue = [];
        this.currentArc = null;
        this.monthInArc = 1;

        this.monthBossPersistent = null; // e.g., ransomware boss active all month
        this.monthBossAnnounced = false;

        // Trading App State
        this.tradingUnlocked = false;
        this.tradingHoldings = 0;
        this.tradingInvested = 0;
        this.currentTradingPrice = 100;
        this.tradingCandles = [];

        // tradingData moved to TradingSystem
        this.hasTradedThisRound = false;

        // Antivirus App State
        this.antivirusUnlocked = false;
        this.ransomwareFinishedLevel = null;
        this.antivirusActive = false;
        this.antivirusScore = 0;
        this.antivirusActive = false;
        this.antivirusScore = 0;
        this.antivirusTimeLeft = 0;
        this.antivirusScansThisRound = 0;
        this.maxAntivirusScans = 3;

        // System Monitor App State
        this.systemMonitorUnlocked = false;
        this.overclockFinishedLevel = null;
        this.systemOverheatLevel = 0; // 0-100
        this.systemCalibratedThisRound = false;
        this.systemSliders = [50, 50, 50]; // Current values
        this.systemTargets = [50, 50, 50]; // Target values

        this.uniqueGuesses = new Set(); // For Blockchain Joker
        this.logs = []; // Persisted System Logs

        // Initialize Systems
        this.shopSystem = new ShopSystem(this);
        this.tradingSystem = new TradingSystem(this);
        this.antivirusSystem = new AntivirusSystem(this);
    }


    toggleDevMode(enabled) {
        this.devMode = enabled;
        this.log(`Dev Mode: ${this.devMode}`);
    }

    revealMysteryNumber() {
        return this.mysteryNumber;
    }

    addAttempt() {
        this.attempts = Math.max(0, this.attempts - 1);
    }

    log(msg) {
        console.log(`[GAME] ${msg}`);
        // Could be hooked to UI later
    }

    startRun() {
        this.cash = 100;
        this.level = 1;
        this.rent = 50;
        this.round = 1;
        this.jokers = [];
        this.scripts = [];
        this.monthBossPersistent = null;
        this.monthBossAnnounced = false;
        this.tradingUnlocked = false;
        this.tradingHoldings = 0;
        this.currentTradingPrice = 100;
        this.tradingCandles = [];

        // Initialize Arcs
        this.initArcs();

        this.startRound();
        // Override message for onboarding
        this.message = { key: 'run_start', params: { rent: this.rent, maxAttempts: this.maxAttempts } };
    }

    initArcs() {
        // Always start with Tutorial Virus Arc
        const tutorialArc = ARCS.find(a => a.id === 'tutorial_virus');

        // Shuffle other arcs
        const otherArcs = ARCS.filter(a => a.id !== 'tutorial_virus');
        otherArcs.sort(() => Math.random() - 0.5);

        // Interleave Standard Arcs
        this.arcQueue = [tutorialArc];
        otherArcs.forEach(arc => {
            this.arcQueue.push(STANDARD_ARC);
            this.arcQueue.push(arc);
        });

        // Add one final Standard Arc at the end (or loop logic later)
        this.arcQueue.push(STANDARD_ARC);

        this.currentArc = this.arcQueue[0];
        this.monthInArc = 1;
    }

    triggerJokers(triggerName, initialValue = null) {
        let currentValue = initialValue;

        this.jokers.forEach(joker => {
            const count = joker.quantity || 1;
            for (let i = 0; i < count; i++) {
                // Check primary trigger
                if (joker.trigger === triggerName) {
                    const result = joker.execute(this, currentValue, joker);
                    if (['calculateGain', 'rng_validation', 'getMaxRange', 'getMinRange', 'calculateRent', 'calculateShopPrice', 'getMaxJokerSlots'].includes(triggerName)) {
                        currentValue = result;
                    } else if (result && result.message) {
                        if
                            (!result.logOnly) {
                            this.message = { key: 'script_effect', params: { text: result.message } };
                        }
                        if (this.roundLogs) this.roundLogs.push(result.message);
                        if (this.logs) this.logs.push(result.message);
                    }
                }

                // Check hooks
                if (joker.hooks && joker.hooks[triggerName]) {
                    const result = joker.hooks[triggerName](this, currentValue, joker);
                    if (['calculateGain', 'rng_validation', 'getMaxRange', 'getMinRange', 'calculateRent', 'calculateShopPrice', 'getMaxJokerSlots'].includes(triggerName)) {
                        currentValue = result;
                    } else if (result && result.message) {
                        if (!result.logOnly) {
                            this.message = { key: 'script_effect', params: { text: result.message } };
                        }
                        if (this.roundLogs) this.roundLogs.push(result.message);
                        if (this.logs) this.logs.push(result.message);
                    }
                }
            }
        });

        return currentValue;
    }

    checkJokerConstraints(triggerName, value) {
        return this.jokers.every(joker => {
            const count = joker.quantity || 1;
            let valid = true;
            for (let i = 0; i < count; i++) {
                if (joker.trigger === triggerName) {
                    valid = valid && joker.execute(this, value, joker);
                }
                if (joker.hooks && joker.hooks[triggerName]) {
                    valid = valid && joker.hooks[triggerName](this, value, joker);
                }
            }
            return valid;
        });
    }

    startRound() {
        this.gameState = 'PLAYING';
        this.hasTradedThisRound = false;
        this.antivirusScansThisRound = 0; // Reset antivirus scans for new round


        // System Monitor Logic
        if (this.systemMonitorUnlocked) {
            if (!this.systemCalibratedThisRound && this.round > 1) {
                // Penalty for not calibrating previous round
                this.systemOverheatLevel = Math.min(100, this.systemOverheatLevel + 20);

                // Cooling Cost
                if (this.systemOverheatLevel > 0) {
                    let coolingCost;
                    if (this.systemOverheatLevel >= 100) {
                        coolingCost = Math.floor(this.cash * 0.05);
                    } else {
                        coolingCost = Math.floor(this.systemOverheatLevel * 0.5);
                    }

                    this.cash = Math.max(0, this.cash - coolingCost);
                    this.log(`System Overheat: -$${coolingCost} for emergency cooling`);
                    if (coolingCost > 0) {
                        this.message = { key: 'script_effect', params: { text: `WARNING: System Overheat. Emergency Cooling: -$${coolingCost}` } };
                    }
                }

                // Critical Failure
                if (this.systemOverheatLevel >= 100) {
                    this.attempts = Math.max(1, this.attempts - 2);
                    this.message = { key: 'script_effect', params: { text: 'CRITICAL ERROR: SYSTEM MELTDOWN. INTEGRITY COMPROMISED.' } };
                } else if (this.systemOverheatLevel >= 20) {
                    this.message = { key: 'script_effect', params: { text: 'WARNING: System Overheating. Recalibrate immediately.' } };
                }
            }

            // Reset calibration status for new round
            this.systemCalibratedThisRound = false;

            // Randomize targets for this round
            this.systemTargets = [
                Math.floor(Math.random() * 80) + 10,
                Math.floor(Math.random() * 80) + 10,
                Math.floor(Math.random() * 80) + 10
            ];
            // Randomize current values (drift)
            this.systemSliders = this.systemSliders.map(v => {
                const drift = (Math.random() - 0.5) * 40;
                return Math.max(0, Math.min(100, v + drift));
            });
        }

        // Store previous number
        if (this.mysteryNumber !== null) {
            this.previousMysteryNumber = this.mysteryNumber;
        }

        // RNG Manipulation
        let candidate = 0;
        let valid = false;

        // Determine Max Range (Default 100 for 0-99)
        let rangeSize = this.triggerJokers('getMaxRange', 100);
        let minStart = this.triggerJokers('getMinRange', 0);

        this.absoluteMin = minStart;
        this.absoluteMax = minStart + rangeSize - 1;

        // Calculate burning threshold (5% of initial range)
        this.burningThreshold = Math.max(1, Math.floor(rangeSize * 0.05));

        this.max = this.absoluteMax;
        this.min = this.absoluteMin;

        while (!valid) {
            candidate = minStart + Math.floor(Math.random() * rangeSize);
            valid = this.checkJokerConstraints('rng_validation', candidate);
        }
        this.mysteryNumber = candidate;

        this.attempts = 0;
        this.maxAttempts = 7; // Reset to base

        // this.min and this.max are set above
        this.history = [];
        this.roundLogs = [];
        this.bossEffect = null;
        this.nextGuessBonus = 0;
        this.reverseGuessed = false; // For Mirror Dimension
        this.quantumChanged = false; // For Quantum Tens
        this.firewallUsedThisRound = false; // For Firewall

        if (this.round === 1) {
            this.monthBossPersistent = null;
            this.monthBossAnnounced = false;
        }

        // Handle delayed trading cashout countdown
        if (this.tradingPendingRounds > 0) {
            this.tradingPendingRounds -= 1;
            if (this.tradingPendingRounds === 0 && this.tradingHoldings > 0) {
                const price = this.getTradingPrice();
                const proceeds = this.tradingHoldings * price;
                this.cash += Math.floor(proceeds);
                this.tradingHoldings = 0;
                this.message = { key: 'script_effect', params: { text: `Trading cashout executed at $${price.toFixed(2)} for $${proceeds.toFixed(2)}.` } };
            }
        }

        const arcBossData = this.currentArc.bosses[this.monthInArc];
        const preventBoss = this.jokers.some(j => j.id === 'temerraire');
        const isRansomwareArc = this.currentArc.id === 'ransomware';

        if (preventBoss) {
            this.monthBossPersistent = null;
        }

        if (isRansomwareArc && arcBossData && !preventBoss && !this.monthBossPersistent) {
            this.monthBossPersistent = arcBossData;
        }

        const bossForThisRound = (!preventBoss && this.monthBossPersistent)
            ? this.monthBossPersistent
            : (!preventBoss && this.round === 3 ? arcBossData : null);

        if (bossForThisRound) {
            this.bossEffect = bossForThisRound.effect;
            const shouldAnnounceBoss = !this.monthBossAnnounced || (!this.monthBossPersistent && this.round === 3);
            if (shouldAnnounceBoss) {
                this.message = { key: 'boss_round', params: { name: bossForThisRound.name, desc: bossForThisRound.description } };
                this.monthBossAnnounced = true;
            } else {
                this.message = {
                    key: 'round_start',
                    params: {
                        level: this.level,
                        round: this.round,
                        rent: this.rent,
                        min: this.absoluteMin,
                        max: this.absoluteMax
                    }
                };
            }
        } else {
            this.message = {
                key: 'round_start',
                params: {
                    level: this.level,
                    round: this.round,
                    rent: this.rent,
                    min: this.absoluteMin,
                    max: this.absoluteMax
                }
            };
        }

        // Apply Joker Hooks: onRoundStart
        this.triggerJokers('onRoundStart');
    }

    makeGuess(guess) {
        if (this.gameState !== 'PLAYING') return;

        guess = parseInt(guess);

        const lower = this.absoluteMin !== undefined ? this.absoluteMin : 0;
        const upper = this.absoluteMax !== undefined ? this.absoluteMax : 99;

        if (isNaN(guess) || guess < lower || guess > upper) {
            this.message = { key: 'invalid_guess', params: { min: lower, max: upper } };
            return;
        }

        this.history.push(guess);

        // Track unique guesses for Blockchain
        if (this.gameState === 'WON') { // Wait, this is before win check.
            // Logic moved to handleWin to ensure we only count winning runs? 
            // No, "unique guess made in this run".
            this.uniqueGuesses.add(guess);
        } else {
            this.uniqueGuesses.add(guess);
        }

        // Trigger Jokers: onGuess
        this.triggerJokers('onGuess', guess);

        // Check for Generous Joker Tolerance
        let tolerance = 0;
        this.jokers.forEach(j => {
            if (j.id === 'generous') {
                tolerance += (j.quantity || 1) * 2;
            }
        });

        if (Math.abs(guess - this.mysteryNumber) <= tolerance) {
            this.handleWin();
        } else {
            this.handleMiss(guess);
        }
    }

    handleMiss(guess) {
        // Check Firewall
        const firewall = this.jokers.find(j => j.id === 'firewall');
        if (firewall && !this.firewallUsedThisRound) {
            this.firewallUsedThisRound = true;
            this.message = { key: 'firewall_blocked' };
            return;
        }

        this.attempts++;

        if (this.attempts >= this.maxAttempts) {
            this.gameState = 'LOST_ROUND';
            this.message = { key: 'lost_round', params: { number: this.mysteryNumber } };
        } else {
            // Check if burning (close to mystery number)
            const distance = Math.abs(guess - this.mysteryNumber);
            const isBurning = distance <= this.burningThreshold;

            // Check for meltdown boss effect (no burning hints)
            const noBurningHint = this.bossEffect === 'meltdown';

            if (guess < this.mysteryNumber) {
                this.min = Math.max(this.min, guess + 1);
                if (isBurning && !noBurningHint) {
                    this.message = { key: 'higher_burning', params: { min: this.min, max: this.max } };
                } else {
                    this.message = { key: 'higher', params: { min: this.min, max: this.max } };
                }
            } else {
                this.max = Math.min(this.max, guess - 1);
                if (isBurning && !noBurningHint) {
                    this.message = { key: 'lower_burning', params: { min: this.min, max: this.max } };
                } else {
                    this.message = { key: 'lower', params: { min: this.min, max: this.max } };
                }
            }
        }
    }

    handleWin() {
        this.gameState = 'WON';

        this.attempts++;
        // Calculate Gain
        let gain = this.baseGains[this.attempts - 1] || 0;

        // Hotfix Bonus
        if (this.nextGuessBonus) {
            gain += this.nextGuessBonus;
            this.nextGuessBonus = 0;
        }

        // Apply Joker Hooks: calculateGain
        gain = this.triggerJokers('calculateGain', gain);

        // Apply Joker Hooks: onWin
        this.triggerJokers('onWin');

        this.cash += gain;
        this.message = { key: 'won_round', params: { gain: Math.floor(gain), cash: Math.floor(this.cash) } };
    }

    nextAction() {
        if (this.gameState === 'WON' || this.gameState === 'LOST_ROUND') {
            // Check if End of Level (Round == MaxRounds)
            if (this.round === this.maxRounds) {
                let effectiveRent = this.triggerJokers('calculateRent', this.rent);
                const canGoDebt = this.jokers.some(j => j.id === 'endette');

                if (this.cash < effectiveRent && !canGoDebt) {
                    this.gameState = 'GAME_OVER';
                    this.message = { key: 'game_over_rent', params: { cash: this.cash, rent: effectiveRent } };
                    return;
                }

                // Pay Rent and Trigger Transition
                this.cash -= effectiveRent;
                this.gameState = 'LEVEL_TRANSITION';
                return;
            }

            // Go to Browser
            this.generateShop(); // Generate shop so it's ready
            this.gameState = 'BROWSER';
            this.message = { key: 'browser_welcome' };
        } else if (this.gameState === 'BROWSER') {
            if (this.newMonthStarted) {
                this.newMonthStarted = false;
                this.startRound();
            } else {
                this.round++;
                this.startRound();
            }
        }
    }

    enterNewMonth() {
        this.level++;
        this.round = 1;
        this.rent = Math.floor(this.rent * 1.3); // Exponential rent
        this.newMonthStarted = true;
        this.monthBossPersistent = null;
        this.monthBossAnnounced = false;

        // Check for Antivirus Unlock (1 month after Ransomware)
        if (this.ransomwareFinishedLevel && this.level >= this.ransomwareFinishedLevel + 1) {
            this.antivirusUnlocked = true;
        }

        // Check for System Monitor Unlock (1 month after Overclock)
        if (this.overclockFinishedLevel && this.level >= this.overclockFinishedLevel + 1) {
            this.systemMonitorUnlocked = true;
        }

        // Advance Arc Progress
        this.monthInArc++;

        // Check if Arc is finished
        if (this.monthInArc > this.currentArc.duration) {
            // Record completion
            if (this.currentArc.id === 'ransomware') {
                this.ransomwareFinishedLevel = this.level;
            }
            if (this.currentArc.id === 'overclock') {
                this.overclockFinishedLevel = this.level;
            }
            if (this.currentArc.id === 'audit') {
                this.tradingUnlocked = true;
            }

            // Move to next Arc
            this.arcQueue.shift(); // Remove finished arc
            if (this.arcQueue.length > 0) {
                this.currentArc = this.arcQueue[0];
                this.monthInArc = 1;
                this.gameState = 'ARC_INTRO'; // Trigger Arc Intro Cutscene
                return;
            } else {
                // No more arcs? Loop or Generic?
                // Re-init Arcs (excluding tutorial if desired, but for now full reset logic with shuffle)
                // To avoid re-playing tutorial, we can filter it out here

                // Shuffle other arcs again
                const otherArcs = ARCS.filter(a => a.id !== 'tutorial_virus');
                otherArcs.sort(() => Math.random() - 0.5);

                // Rebuild Queue: Standard -> Arc -> Standard -> Arc...
                this.arcQueue = [];
                otherArcs.forEach(arc => {
                    this.arcQueue.push(STANDARD_ARC);
                    this.arcQueue.push(arc);
                });
                this.arcQueue.push(STANDARD_ARC);

                this.currentArc = this.arcQueue[0];
                this.monthInArc = 1;
                this.gameState = 'ARC_INTRO';
                return;
            }
        }

        this.generateShop();
        this.gameState = 'BROWSER';
        this.message = { key: 'browser_welcome' };
    }

    openApp(appName) {
        if (this.gameState === 'BROWSER') {
            if (appName === 'SHOP') {
                this.gameState = 'SHOP';
                const isAuditArc = this.currentArc && this.currentArc.id === 'audit';
                this.message = { key: isAuditArc ? 'shop_welcome_audit' : 'shop_welcome' };
            } else if (appName === 'TRADING' && this.tradingUnlocked) {
                this.gameState = 'TRADING';
                this.message = { key: 'script_effect', params: { text: 'TRADING DESK ONLINE.' } };
            } else if (appName === 'ANTIVIRUS' && this.antivirusUnlocked) {
                this.gameState = 'ANTIVIRUS';
                this.message = { key: 'script_effect', params: { text: 'SYSTEM CLEANER READY.' } };
            }
        }
    }

    closeApp() {
        if (this.gameState === 'SHOP' || this.gameState === 'TRADING' || this.gameState === 'ANTIVIRUS') {
            this.gameState = 'BROWSER';
            this.message = { key: 'browser_welcome' };
            this.antivirusActive = false; // Ensure game stops if closed
        }
    }

    generateShop() {
        this.shopSystem.generate();
    }

    rerollShop() {
        return this.shopSystem.reroll();
    }

    buyItem(uniqueId) {
        return this.shopSystem.buyItem(uniqueId);
    }

    getBoss() {
        if (this.round === this.maxRounds) {
            return BOSSES[Math.min(this.level - 1, BOSSES.length - 1)];
        }
        return null;
    }

    // --- TRADING HELPERS ---
    getTradingPrice() {
        return this.tradingSystem.getPrice();
    }

    addTradingCandle() {
        this.tradingSystem.addCandle();
    }

    buyTrading(amount) {
        return this.tradingSystem.buy(amount);
    }

    sellTrading(amount) {
        return this.tradingSystem.sell(amount);
    }

    // --- ANTIVIRUS HELPERS ---

    startAntivirusGame() {
        return this.antivirusSystem.start();
    }

    hitAntivirusTarget() {
        this.antivirusSystem.hitTarget();
    }

    endAntivirusGame() {
        this.antivirusSystem.end();
    }


    useScript(index) {
        if (this.gameState !== 'PLAYING') return;

        const script = this.scripts[index];
        if (script) {
            const result = script.execute(this);
            if (result && result.success) {
                this.scripts.splice(index, 1);
                if (result.message) {
                    this.message = { key: 'script_effect', params: { text: result.message } };
                    this.roundLogs.push(result.message);
                }
                if (result.autoPlay !== undefined) {
                    this.makeGuess(result.autoPlay);
                }
            }
        }
    }

    sellItem(type, index) {
        if (this.gameState !== 'SHOP') return false;

        let item = null;
        if (type === 'joker') {
            item = this.jokers[index];
            if (item) {
                // Credit half the price when selling a joker
                this.cash += Math.floor(item.price / 2);
                if (item.quantity && item.quantity > 1) {
                    item.quantity--;
                } else {
                    this.jokers.splice(index, 1);
                }
                this.triggerJokers('onSell', item);
                return true;
            }
        } else if (type === 'script') {
            item = this.scripts[index];
            if (item) {
                this.cash += Math.floor(item.price / 2);
                this.scripts.splice(index, 1);
                this.triggerJokers('onSell', item);
                return true;
            }
        }
        return false;
    }

    // --- SAVE/LOAD SYSTEM ---
    toSaveData() {
        return {
            // Core state
            cash: this.cash,
            rent: this.rent,
            level: this.level,
            round: this.round,
            maxRounds: this.maxRounds,
            gameState: this.gameState,
            mysteryNumber: this.mysteryNumber,
            attempts: this.attempts,
            maxAttempts: this.maxAttempts,
            min: this.min,
            max: this.max,
            absoluteMin: this.absoluteMin,
            absoluteMax: this.absoluteMax,
            burningThreshold: this.burningThreshold,
            history: this.history,
            rerollCost: this.rerollCost,
            bossEffect: this.bossEffect,

            // Logs
            logs: this.logs,

            // Jokers & Scripts (save by id and quantity)
            jokers: this.jokers.map(j => ({
                id: j.id,
                quantity: j.quantity || 1,
                modifier: j.modifier // For Neural Network
            })),
            scripts: this.scripts.map(s => ({ id: s.id })),
            shopInventory: this.shopInventory.map(item => ({
                id: item.id,
                type: item.type,
                price: item.price,
                uniqueId: item.uniqueId
            })),

            // Arc System
            arcQueueIds: this.arcQueue.map(a => a.id),
            currentArcId: this.currentArc ? this.currentArc.id : null,
            monthInArc: this.monthInArc,
            monthBossPersistent: this.monthBossPersistent,
            monthBossAnnounced: this.monthBossAnnounced,

            // Trading App
            tradingUnlocked: this.tradingUnlocked,
            tradingHoldings: this.tradingHoldings,
            tradingInvested: this.tradingInvested,
            currentTradingPrice: this.currentTradingPrice,
            tradingDataIndex: this.tradingSystem ? this.tradingSystem.dataIndex : 0,
            hasTradedThisRound: this.hasTradedThisRound,

            // Antivirus App
            antivirusUnlocked: this.antivirusUnlocked,
            ransomwareFinishedLevel: this.ransomwareFinishedLevel,
            antivirusScansThisRound: this.antivirusScansThisRound,

            // System Monitor App
            systemMonitorUnlocked: this.systemMonitorUnlocked,
            overclockFinishedLevel: this.overclockFinishedLevel,
            systemOverheatLevel: this.systemOverheatLevel,
            systemCalibratedThisRound: this.systemCalibratedThisRound,
            systemSliders: this.systemSliders,
            systemTargets: this.systemTargets,

            // Misc
            uniqueGuesses: Array.from(this.uniqueGuesses),
            firewallUsedThisRound: this.firewallUsedThisRound,
            reverseGuessed: this.reverseGuessed,
            nextGuessBonus: this.nextGuessBonus,
            memoryLeakStacks: this.memoryLeakStacks,

            // Timestamp
            savedAt: Date.now()
        };
    }

    loadFromSaveData(data) {
        if (!data) return false;

        // Core state
        this.cash = data.cash;
        this.rent = data.rent;
        this.level = data.level;
        this.round = data.round;
        this.maxRounds = data.maxRounds || 3;
        this.gameState = data.gameState;
        this.mysteryNumber = data.mysteryNumber;
        this.attempts = data.attempts;
        this.maxAttempts = data.maxAttempts;
        this.min = data.min;
        this.max = data.max;
        this.absoluteMin = data.absoluteMin;
        this.absoluteMax = data.absoluteMax;
        this.burningThreshold = data.burningThreshold || 5;
        this.history = data.history || [];
        this.rerollCost = data.rerollCost || 5;
        this.bossEffect = data.bossEffect;

        // Restore Logs
        this.logs = data.logs || [];

        // Restore Jokers
        this.jokers = data.jokers.map(savedJoker => {
            const template = JOKERS.find(j => j.id === savedJoker.id);
            if (template) {
                return {
                    ...template,
                    quantity: savedJoker.quantity || 1,
                    modifier: savedJoker.modifier
                };
            }
            return null;
        }).filter(Boolean);

        // Restore Scripts
        this.scripts = data.scripts.map(savedScript => {
            const template = SCRIPTS.find(s => s.id === savedScript.id);
            return template ? { ...template } : null;
        }).filter(Boolean);

        // Restore Shop Inventory
        this.shopInventory = data.shopInventory.map(savedItem => {
            const allItems = [...JOKERS, ...SCRIPTS];
            const template = allItems.find(i => i.id === savedItem.id);
            if (template) {
                return {
                    ...template,
                    price: savedItem.price,
                    uniqueId: savedItem.uniqueId
                };
            }
            return null;
        }).filter(Boolean);

        // Restore Arc System
        this.arcQueue = data.arcQueueIds.map(id => {
            if (id === 'standard') return STANDARD_ARC;
            return ARCS.find(a => a.id === id);
        }).filter(Boolean);

        this.currentArc = data.currentArcId === 'standard'
            ? STANDARD_ARC
            : (ARCS.find(a => a.id === data.currentArcId) || this.arcQueue[0] || STANDARD_ARC);
        this.monthInArc = data.monthInArc || 1;
        this.monthBossPersistent = data.monthBossPersistent;
        this.monthBossAnnounced = data.monthBossAnnounced || false;

        // Trading App
        this.tradingUnlocked = data.tradingUnlocked || false;
        this.tradingHoldings = data.tradingHoldings || 0;
        this.tradingInvested = data.tradingInvested || 0;
        this.currentTradingPrice = data.currentTradingPrice || 100;
        if (this.tradingSystem) this.tradingSystem.dataIndex = data.tradingDataIndex || 0;
        this.hasTradedThisRound = data.hasTradedThisRound || false;

        // Antivirus App
        this.antivirusUnlocked = data.antivirusUnlocked || false;
        this.ransomwareFinishedLevel = data.ransomwareFinishedLevel;
        this.antivirusScansThisRound = data.antivirusScansThisRound || 0;

        // System Monitor App
        this.systemMonitorUnlocked = data.systemMonitorUnlocked || false;
        this.overclockFinishedLevel = data.overclockFinishedLevel;
        this.systemOverheatLevel = data.systemOverheatLevel || 0;
        this.systemCalibratedThisRound = data.systemCalibratedThisRound || false;
        this.systemSliders = data.systemSliders || [50, 50, 50];
        this.systemTargets = data.systemTargets || [50, 50, 50];

        // Misc
        this.uniqueGuesses = new Set(data.uniqueGuesses || []);
        this.firewallUsedThisRound = data.firewallUsedThisRound || false;
        this.reverseGuessed = data.reverseGuessed || false;
        this.nextGuessBonus = data.nextGuessBonus || 0;
        this.memoryLeakStacks = data.memoryLeakStacks || 0;

        // Restore message based on state
        if (this.attempts === 0) {
            this.message = { key: 'round_start', params: { level: this.level, round: this.round, min: this.min, max: this.max, rent: this.rent } };
        } else {
            this.message = { key: 'resume_game', params: { level: this.level, round: this.round, min: this.min, max: this.max, rent: this.rent } };
        }

        return true;
    }

}

