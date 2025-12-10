import { JOKERS, SCRIPTS, BOSSES } from './items.js';
import { ARCS, STANDARD_ARC } from './arcs.js';

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

      const totalMonth = (this.level - 1) * this.maxRounds + this.round;

      // Apply Boss Effect if Round 3 (Week 3)
      const preventBoss = this.jokers.some(j => j.id === 'temerraire');
      if (this.round === 3 && !preventBoss) {
          // Get Boss from Current Arc
          const arcBossData = this.currentArc.bosses[this.monthInArc];
          
          if (arcBossData) {
              this.bossEffect = arcBossData.effect;
              this.message = { key: 'boss_round', params: { name: arcBossData.name, desc: arcBossData.description } };
          } else {
              // Fallback or No Boss this month
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
            isBurning = diff <= 5;
          }
          
          const direction = guess < this.mysteryNumber ? 'higher' : 'lower';
          const key = isBurning ? `${direction}_burning` : direction;
          
          this.message = { 
              key: key, 
              params: { 
                  min: this.min, 
                  max: this.max,
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
      this.rent = Math.floor(this.rent * 2.5); // Exponential rent
      this.newMonthStarted = true;
      
      // Advance Arc Progress
      this.monthInArc++;
      
      // Check if Arc is finished
      if (this.monthInArc > this.currentArc.duration) {
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
              this.message = { key: 'shop_welcome' };
          }
      }
  }

  closeApp() {
      if (this.gameState === 'SHOP') {
          this.gameState = 'BROWSER';
          this.message = { key: 'browser_welcome' };
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
              const maxSlots = this.triggerJokers('getMaxJokerSlots', 5);
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
