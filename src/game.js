export class Game {
  constructor() {
    this.money = this.loadMoney();
    this.rebirths = this.loadRebirths();
    this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
    this.mysteryNumber = null;
    this.attempts = 0;
    this.maxAttempts = 6;
    this.message = { key: 'ready_to_play' };
    this.history = [];
    this.currentBet = 0;
    this.multipliers = [10, 5, 3, 2, 1.2, 1];
    this.min = 0;
    this.max = 99;
    this.jokerUsed = false;
  }

  loadMoney() {
    const stored = localStorage.getItem('gamble_money');
    return stored ? parseInt(stored) : 100;
  }

  saveMoney() {
    // Round to integer
    this.money = Math.round(this.money);
    localStorage.setItem('gamble_money', this.money);
  }

  loadRebirths() {
    const stored = localStorage.getItem('gamble_rebirths');
    return stored ? parseInt(stored) : 0;
  }

  saveRebirths() {
    localStorage.setItem('gamble_rebirths', this.rebirths);
  }

  checkBankruptcy() {
    // If less than 1 token, bankruptcy
    if (this.money < 1) {
      this.money = 100;
      this.rebirths++;
      this.saveMoney();
      this.saveRebirths();
      return true; // Rebirth happened
    }
    return false;
  }

  startNewGame(betAmount) {
    // Ensure betAmount is an integer
    betAmount = parseInt(betAmount);

    if (isNaN(betAmount) || betAmount <= 0) {
        this.message = { key: 'invalid_bet' };
        return false;
    }

    if (this.checkBankruptcy()) {
        this.message = { key: 'bankruptcy' };
        return false;
    }

    if (this.money < betAmount) {
        this.message = { key: 'insufficient_funds' };
        return false;
    }

    this.currentBet = betAmount;
    this.money -= this.currentBet;
    this.saveMoney();
    
    this.mysteryNumber = Math.floor(Math.random() * 100);
    this.attempts = 0;
    this.min = 0;
    this.max = 99;
    this.jokerUsed = false;
    this.gameState = 'PLAYING';
    this.message = { key: 'game_started', params: { bet: this.currentBet } };
    this.history = [];
    return true;
  }

  useJoker() {
    if (this.gameState !== 'PLAYING' || this.jokerUsed) return;

    this.attempts++;
    this.jokerUsed = true;
    
    const isEven = this.mysteryNumber % 2 === 0;
    const parityKey = isEven ? 'even' : 'odd';
    
    // Check if this extra attempt caused a loss
    if (this.attempts >= this.maxAttempts) {
        this.gameState = 'LOST';
        this.message = { key: 'lost_joker', params: { number: this.mysteryNumber, parity: parityKey } };
        this.checkBankruptcy();
        return;
    }

    this.message = { 
        key: 'joker_reveal', 
        params: { 
            parity: parityKey,
            min: this.min,
            max: this.max,
            attemptsLeft: this.maxAttempts - this.attempts
        } 
    };
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
      this.gameState = 'WON';
      // Calculate winnings based on attempts (1-based index, so attempts-1 for array)
      const multiplier = this.multipliers[this.attempts - 1];
      const winnings = Math.round(this.currentBet * multiplier);
      
      this.money += winnings;
      this.saveMoney();
      this.message = { key: 'won', params: { multiplier, winnings, number: this.mysteryNumber } };
    } else {
        // Update bounds
        if (guess < this.mysteryNumber) {
            this.min = Math.max(this.min, guess + 1);
        } else {
            this.max = Math.min(this.max, guess - 1);
        }

        if (this.attempts >= this.maxAttempts) {
            this.gameState = 'LOST';
            this.message = { key: 'lost', params: { number: this.mysteryNumber } };
            // Check bankruptcy immediately after loss
            this.checkBankruptcy();
        } else {
            // Near miss check
            const diff = Math.abs(this.mysteryNumber - guess);
            const isBurning = diff <= 5;
            const direction = guess < this.mysteryNumber ? 'higher' : 'lower';
            const key = isBurning ? `${direction}_burning` : direction;
            
            this.message = { 
                key: key, 
                params: { 
                    guess,
                    min: this.min, 
                    max: this.max,
                    attemptsLeft: this.maxAttempts - this.attempts
                } 
            };
        }
    }
  }
}
