export class Game {
  constructor() {
    this.money = this.loadMoney();
    this.rebirths = this.loadRebirths();
    this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
    this.mysteryNumber = null;
    this.attempts = 0;
    this.maxAttempts = 6;
    this.message = '';
    this.history = [];
    this.currentBet = 0;
    this.multipliers = [10, 5, 3, 2, 1.2, 1];
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
        this.message = 'Mise invalide.';
        return false;
    }

    if (this.checkBankruptcy()) {
        this.message = 'Banqueroute ! Vous renaissez avec 100 jetons.';
        return false;
    }

    if (this.money < betAmount) {
        this.message = 'Fonds insuffisants.';
        return false;
    }

    this.currentBet = betAmount;
    this.money -= this.currentBet;
    this.saveMoney();
    
    this.mysteryNumber = Math.floor(Math.random() * 100);
    this.attempts = 0;
    this.gameState = 'PLAYING';
    this.message = `Jeu lancé. Mise: ${this.currentBet} €. Trouvez le nombre (0-99).`;
    this.history = [];
    return true;
  }

  makeGuess(guess) {
    if (this.gameState !== 'PLAYING') return;

    guess = parseInt(guess);
    if (isNaN(guess) || guess < 0 || guess > 99) {
      this.message = 'Entrez un nombre entre 0 et 99.';
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
      this.message = `C'est gagné ! x${multiplier} -> +${winnings} €`;
    } else if (this.attempts >= this.maxAttempts) {
      this.gameState = 'LOST';
      this.message = `Perdu ! Le nombre était ${this.mysteryNumber}.`;
      // Check bankruptcy immediately after loss
      this.checkBankruptcy();
    } else if (guess < this.mysteryNumber) {
      this.message = "C'est plus";
    } else {
      this.message = "C'est moins";
    }
  }
}
