import { JOKERS, SCRIPTS, BOSSES } from './items.js';
import { ARCS, STANDARD_ARC } from './arcs.js';
import stockDataRaw from './assets/stock_prices.csv?raw';

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
    
    this.tradingData = this.parseStockData(stockDataRaw);
    this.tradingDataIndex = 0;
    this.hasTradedThisRound = false;

    // Antivirus App State
    this.antivirusUnlocked = false;
    this.ransomwareFinishedLevel = null;
    this.antivirusActive = false;
    this.antivirusScore = 0;
    this.antivirusTimeLeft = 0;

    // System Monitor App State
    this.systemMonitorUnlocked = false;
    this.overclockFinishedLevel = null;
    this.systemOverheatLevel = 0; // 0-100
    this.systemCalibratedThisRound = false;
    this.systemSliders = [50, 50, 50]; // Current values
    this.systemTargets = [50, 50, 50]; // Target values
  }

  parseStockData(csv) {
      const lines = csv.split('\n');
      const data = [];
      // Skip header (line 0)
      for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          // Format: Date, Open, High, Low, Close
          if (parts.length >= 5) {
              data.push({
                  open: parseFloat(parts[1]),
                  high: parseFloat(parts[2]),
                  low: parseFloat(parts[3]),
                  close: parseFloat(parts[4])
              });
          }
      }
      return data;
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
          // Check primary trigger
          if (joker.trigger === triggerName) {
              const result = joker.execute(this, currentValue);
              if (['calculateGain', 'rng_validation', 'getMaxRange'].includes(triggerName)) {
                  currentValue = result;
              } else if (result && result.message) {
                   if (!result.logOnly) {
                       this.message = { key: 'script_effect', params: { text: result.message } };
                   }
                   if (this.roundLogs) this.roundLogs.push(result.message);
              }
          }
          
          // Check hooks
          if (joker.hooks && joker.hooks[triggerName]) {
              const result = joker.hooks[triggerName](this, currentValue);
              if (['calculateGain', 'rng_validation', 'getMaxRange'].includes(triggerName)) {
                  currentValue = result;
              } else if (result && result.message) {
                   if (!result.logOnly) {
                       this.message = { key: 'script_effect', params: { text: result.message } };
                   }
                   if (this.roundLogs) this.roundLogs.push(result.message);
              }
          }
      });
      
      return currentValue;
  }

  checkJokerConstraints(triggerName, value) {
      return this.jokers.every(joker => {
          let valid = true;
          if (joker.trigger === triggerName) {
              valid = valid && joker.execute(this, value);
          }
          if (joker.hooks && joker.hooks[triggerName]) {
              valid = valid && joker.hooks[triggerName](this, value);
          }
          return valid;
      });
  }

  startRound() {
      this.gameState = 'PLAYING';
      this.hasTradedThisRound = false;
      
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

    this.attempts++;
    this.history.push(guess);

    // Trigger Jokers: onGuess
    this.triggerJokers('onGuess', guess);

    if (guess === this.mysteryNumber) {
      this.handleWin();
    } else {
        this.handleMiss(guess);
    }
  }

  handleWin() {
      this.gameState = 'WON';
      
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
      this.message = { key: 'won_round', params: { gain, cash: this.cash } };

      // Unlock Trading after defeating Audit boss (month 1 of audit arc at week 3)
      if (this.currentArc && this.currentArc.id === 'audit' && this.round === this.maxRounds) {
          this.tradingUnlocked = true;
      }
  }

  handleMiss(guess) {
      this.nextGuessBonus = 0; // Reset hotfix bonus
      // Update bounds (unless Boss prevents it)
      if (this.bossEffect !== 'latency') {
        if (guess < this.mysteryNumber) {
            this.min = Math.max(this.min, guess + 1);
        } else {
            this.max = Math.min(this.max, guess - 1);
        }
      }

      // Apply Joker Hooks: onMiss (Allows modifying bounds further)
      this.triggerJokers('onMiss', guess);

      // Boss Effect: Tax (Audit Arc)
      if (this.bossEffect === 'tax') {
          this.cash = Math.max(0, this.cash - 1);
      }

      if (this.attempts >= this.maxAttempts) {
          this.gameState = 'LOST_ROUND';
          this.message = { key: 'lost_round', params: { number: this.mysteryNumber } };
      } else {
          // Near miss check (unless Boss prevents it)
          let isBurning = false;
          // Boss Effect: Firewall (No Burning) or Meltdown (No Burning)
          if (this.bossEffect !== 'firewall' && this.bossEffect !== 'meltdown') {
            const diff = Math.abs(this.mysteryNumber - guess);
            const rangeSize = this.max - this.min;
            // Burning if within 10% of current range, or at least within 2 units if range is small
            const threshold = Math.max(2, Math.ceil(rangeSize * 0.1));
            isBurning = diff <= threshold;
          }
          
          const direction = guess < this.mysteryNumber ? 'higher' : 'lower';
          const key = isBurning ? `${direction}_burning` : direction;
          const hideRange = this.bossEffect === 'blind' && this.attempts <= 3;
          const displayMin = hideRange ? '???' : this.min;
          const displayMax = hideRange ? '???' : this.max;
          
          this.message = { 
              key: key, 
              params: { 
                  min: displayMin, 
                  max: displayMax,
                  attemptsLeft: this.maxAttempts - this.attempts
              } 
          };
      }
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
      this.shopInventory = [];
      this.rerollCost = 5;
      
      // Filter out owned jokers
      const ownedJokerIds = this.jokers.map(j => j.id);
      // Filter available jokers (not owned)
      let availableJokers = JOKERS.filter(j => !ownedJokerIds.includes(j.id));
      
      // Shuffle available jokers
      availableJokers.sort(() => Math.random() - 0.5);
      
      // Take up to 3 unique jokers
      const jokersToSpawn = availableJokers.slice(0, 3);
      
      jokersToSpawn.forEach(joker => {
          let price = joker.price;
          price = this.triggerJokers('calculateShopPrice', price);
          this.shopInventory.push({ ...joker, price, uniqueId: Math.random() });
      });
      
      // Add 2 random Scripts (Unique in this shop batch)
      const availableScripts = [...SCRIPTS];
      availableScripts.sort(() => Math.random() - 0.5);
      const scriptsToSpawn = availableScripts.slice(0, 2);
      
      scriptsToSpawn.forEach(script => {
          let price = script.price;
          price = this.triggerJokers('calculateShopPrice', price);
          this.shopInventory.push({ ...script, price, uniqueId: Math.random() });
      });
  }

  rerollShop() {
      if (this.cash >= this.rerollCost) {
          this.cash -= this.rerollCost;
          this.rerollCost += 5;
          this.generateShop();
          return true;
      }
      return false;
  }

  buyItem(uniqueId) {
      const itemIndex = this.shopInventory.findIndex(i => i.uniqueId === uniqueId);
      if (itemIndex === -1) return false;
      
      const item = this.shopInventory[itemIndex];
      
      if (this.cash >= item.price) {
          if (item.type === 'passive') {
              const maxSlots = this.triggerJokers('getMaxJokerSlots', 6);
              if (this.jokers.length < maxSlots) {
                  this.cash -= item.price;
                  this.jokers.push(item);
                  this.shopInventory.splice(itemIndex, 1);
                  this.triggerJokers('onBuy', item);
                  return true;
              }
          } else if (item.type === 'consumable') {
              if (this.scripts.length < 3) {
                  this.cash -= item.price;
                  this.scripts.push(item);
                  this.shopInventory.splice(itemIndex, 1);
                  this.triggerJokers('onBuy', item);
                  return true;
              }
          }
      }
      return false;
  }

  getBoss() {
      if (this.round === this.maxRounds) {
          return BOSSES[Math.min(this.level - 1, BOSSES.length - 1)];
      }
      return null;
  }

  // --- TRADING HELPERS ---
  getTradingPrice() {
      return this.currentTradingPrice;
  }

  addTradingCandle() {
      if (this.tradingData && this.tradingData.length > 0) {
          const candle = this.tradingData[this.tradingDataIndex];
          this.currentTradingPrice = candle.close;
          this.tradingCandles.push(candle);
          
          this.tradingDataIndex = (this.tradingDataIndex + 1) % this.tradingData.length;
      } else {
          // Fallback if no data
          const t = Date.now();
          const base = 100;
          const amp = 25;
          const speed = 3000; 
          const noise = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(1, base + amp * Math.sin(t / speed) + noise);
          
          const open = this.currentTradingPrice;
          const close = newPrice;
          const high = Math.max(open, close) + Math.random() * 3;
          const low = Math.min(open, close) - Math.random() * 3;
          
          this.currentTradingPrice = close;
          this.tradingCandles.push({ open, high, low, close });
      }
      
      if (this.tradingCandles.length > 50) this.tradingCandles.shift();
  }

  buyTrading(amount) {
      if (this.hasTradedThisRound) return { success: false, reason: 'limit_reached' };
      const price = this.getTradingPrice();
      const spend = Math.min(amount, this.cash);
      if (spend <= 0) return { success: false, reason: 'limit' };

      const shares = spend / price;
      this.cash -= spend;
      this.tradingHoldings += shares;
      this.tradingInvested += spend;
      this.hasTradedThisRound = true;
      return { success: true, shares, price, spent: spend };
  }

  sellTrading(amount) {
      if (this.hasTradedThisRound) return { success: false, reason: 'limit_reached' };
      const price = this.getTradingPrice();
      const sharesToSell = amount > 0 ? Math.min(this.tradingHoldings, amount / price) : this.tradingHoldings;
      if (sharesToSell <= 0) return { success: false, reason: 'no_holdings' };
      
      // Calculate proportion of investment sold
      const proportion = sharesToSell / this.tradingHoldings;
      this.tradingInvested -= this.tradingInvested * proportion;
      
      const proceeds = sharesToSell * price;
      this.tradingHoldings -= sharesToSell;
      this.cash += proceeds;
      
      // Clean up small floating point errors
      if (this.tradingHoldings < 0.0001) {
          this.tradingHoldings = 0;
          this.tradingInvested = 0;
      }
      
      this.hasTradedThisRound = true;
      return { success: true, shares: sharesToSell, price, gained: proceeds };
  }

  // --- ANTIVIRUS HELPERS ---
  startAntivirusGame() {
      this.antivirusActive = true;
      this.antivirusScore = 0;
      this.antivirusTimeLeft = 10;
  }

  hitAntivirusTarget() {
      if (!this.antivirusActive) return;
      this.antivirusScore++;
      this.cash += 2;
  }

  endAntivirusGame() {
      this.antivirusActive = false;
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
              this.cash += Math.floor(item.price / 2);
              this.jokers.splice(index, 1);
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

  getBoss() {
      return BOSSES[Math.min(this.level - 1, BOSSES.length - 1)];
  }
}
