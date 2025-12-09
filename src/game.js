import { JOKERS, SCRIPTS, BOSSES } from './items.js';

export class Game {
  constructor() {
    this.cash = 100; // Starting cash
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
      this.startRound();
      // Override message for onboarding
      this.message = { key: 'run_start', params: { rent: this.rent, maxAttempts: this.maxAttempts } };
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
      
      const forceEven = this.jokers.some(j => j.id === 'even_flow');
      const lazyDev = this.jokers.some(j => j.id === 'lazy_dev');
      const mirrorServer = this.jokers.some(j => j.id === 'mirror_server');

      while (!valid) {
        candidate = Math.floor(Math.random() * 100);
        
        if (forceEven && candidate % 2 !== 0) continue;
        if (lazyDev && candidate % 10 !== 0) continue;
        
        valid = true;
      }
      this.mysteryNumber = candidate;

      // Mirror Server: If round 2, reuse round 1 number (Simple "once per level" logic)
      if (mirrorServer && this.round === 2 && this.previousMysteryNumber !== undefined) {
          this.mysteryNumber = this.previousMysteryNumber;
      }

      this.attempts = 0;
      this.maxAttempts = 7; // Reset to base
      
      // Memory Leak Logic
      if (this.jokers.some(j => j.id === 'memory_leak')) {
          this.maxAttempts = Math.max(3, this.maxAttempts - (this.memoryLeakStacks || 0));
      }

      this.min = 0;
      this.max = 99;
      this.history = [];
      this.roundLogs = [];
      this.bossEffect = null;
      this.nextGuessBonus = 0;

      // Apply Boss Effect if Round 3
      if (this.round === 3) {
          const boss = BOSSES[Math.min(this.level - 1, BOSSES.length - 1)];
          this.bossEffect = boss.id;
          this.message = { key: 'boss_round', params: { name: boss.name, desc: boss.description } };
      } else {
          this.message = { key: 'round_start', params: { level: this.level, round: this.round, rent: this.rent } };
      }

      // Apply Joker Hooks: onRoundStart
      this.jokers.forEach(joker => {
          if (joker.trigger === 'onRoundStart') {
              const res = joker.execute(this);
              if (res && res.message) {
                  // We use a special key to append messages or just show the last one
                  this.message = { key: 'script_effect', params: { text: res.message } };
                  this.roundLogs.push(res.message);
              }
          }
      });
  }

  makeGuess(guess) {
    if (this.gameState !== 'PLAYING') return;

    guess = parseInt(guess);
    if (isNaN(guess) || guess < 0 || guess > 99) {
      this.message = { key: 'invalid_guess' };
      return;
    }

    this.attempts++;
    this.history.push(guess);

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
      this.jokers.forEach(joker => {
          if (joker.trigger === 'calculateGain') {
              gain = joker.execute(this, gain);
          }
      });

      // Apply Joker Hooks: onWin
      this.jokers.forEach(joker => {
          if (joker.trigger === 'onWin') {
              const res = joker.execute(this);
              if (res && res.message) this.log(res.message);
          }
      });

      // Memory Leak Stacking
      if (this.jokers.some(j => j.id === 'memory_leak')) {
          this.memoryLeakStacks = (this.memoryLeakStacks || 0) + 1;
      }

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

      if (this.attempts >= this.maxAttempts) {
          this.gameState = 'LOST_ROUND';
          this.message = { key: 'lost_round', params: { number: this.mysteryNumber } };
      } else {
          // Near miss check (unless Boss prevents it)
          let isBurning = false;
          if (this.bossEffect !== 'firewall') {
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
          // Go to Shop
          this.generateShop();
          this.gameState = 'SHOP';
          this.message = { key: 'shop_welcome' };
      } else if (this.gameState === 'SHOP') {
          // Next Round or Next Level
          this.round++;
          if (this.round > this.maxRounds) {
              // End of Level - Pay Rent
              if (this.cash >= this.rent) {
                  this.cash -= this.rent;
                  this.level++;
                  this.round = 1;
                  this.rent = Math.floor(this.rent * 2.5); // Exponential rent
                  this.startRound();
              } else {
                  this.gameState = 'GAME_OVER';
                  this.message = { key: 'game_over_rent', params: { cash: this.cash, rent: this.rent } };
              }
          } else {
              this.startRound();
          }
      }
  }

  generateShop() {
      this.shopInventory = [];
      this.rerollCost = 5;
      
      // Add 3 random Jokers
      for (let i = 0; i < 3; i++) {
          const randomJoker = JOKERS[Math.floor(Math.random() * JOKERS.length)];
          this.shopInventory.push({ ...randomJoker, uniqueId: Math.random() });
      }
      
      // Add 2 random Scripts
      for (let i = 0; i < 2; i++) {
          const randomScript = SCRIPTS[Math.floor(Math.random() * SCRIPTS.length)];
          this.shopInventory.push({ ...randomScript, uniqueId: Math.random() });
      }
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
              if (this.jokers.length < 5) {
                  this.cash -= item.price;
                  this.jokers.push(item);
                  this.shopInventory.splice(itemIndex, 1);
                  return true;
              }
          } else if (item.type === 'consumable') {
              if (this.scripts.length < 3) {
                  this.cash -= item.price;
                  this.scripts.push(item);
                  this.shopInventory.splice(itemIndex, 1);
                  return true;
              }
          }
      }
      return false;
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
              return true;
          }
      } else if (type === 'script') {
          item = this.scripts[index];
          if (item) {
              this.cash += Math.floor(item.price / 2);
              this.scripts.splice(index, 1);
              return true;
          }
      }
      return false;
  }
}
