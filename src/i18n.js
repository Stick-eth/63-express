export const translations = {
  en: {
    title: "63 Gold",
    subtitle: "High Stakes Guessing",
    balance: "Balance",
    rebirths: "Rebirths",
    ready_to_play: "Ready to play?",
    bet_placeholder: "Bet amount",
    start_game: "Start Game",
    guess_placeholder: "Guess (0-99)",
    guess_button: "Guess",
    invalid_bet: "Invalid bet.",
    bankruptcy: "Bankruptcy! You are reborn with 100 tokens.",
    insufficient_funds: "Insufficient funds.",
    game_started: "Welcome to 63 Gold. Bet: {bet} €. The number is between 0 and 99. Find it fast to win big, or take your time to secure a refund. Let's go, Attempt 1!",
    invalid_guess: "Enter a number between 0 and 99.",
    won: "BINGO! It's {number}! You win {winnings} € (x{multiplier})!",
    lost: "It's over... The number was {number}. You narrowed it down well. Want to try again for the Jackpot?",
    lost_joker: "It's over... The number was {number} ({parity}). You narrowed it down well. Want to try again for the Jackpot?",
    higher: "It's HIGHER! Forget everything below {guess}. Focus. The number is stuck between {min} and {max}. {attemptsLeft} attempts left. What do you do?",
    lower: "It's LOWER! We're going down. Focus. The number is stuck between {min} and {max}. {attemptsLeft} attempts left. What do you do?",
    higher_burning: "Ouch ouch ouch it's HIGHER but it was BURNING! You are right next to it! Focus. The number is stuck between {min} and {max}. {attemptsLeft} attempts left. What do you do?",
    lower_burning: "Ouch ouch ouch it's LOWER but it was BURNING! You are right next to it! Focus. The number is stuck between {min} and {max}. {attemptsLeft} attempts left. What do you do?",
    joker_reveal: "Received. It costs you an attempt, but here is the info. The mystery number is... {parity}! {attemptsLeft} attempts left, but you know what to look for between {min} and {max}.",
    hint_higher: "↑ Higher",
    hint_lower: "↓ Lower",
    hint_won: "= Won",
    attempts_left: "Attempts left",
    game_over: "Game Over",
    play_again: "Play Again",
    joker_btn: "JOKER (Cost: 1 Attempt)",
    even: "EVEN",
    odd: "ODD"
  },
  fr: {
    title: "63 Gold",
    subtitle: "Devinettes à hauts risques",
    balance: "Solde",
    rebirths: "Renaissances",
    ready_to_play: "Prêt à jouer ?",
    bet_placeholder: "Mise",
    start_game: "Lancer le jeu",
    guess_placeholder: "Devinez (0-99)",
    guess_button: "Deviner",
    invalid_bet: "Mise invalide.",
    bankruptcy: "Banqueroute ! Vous renaissez avec 100 jetons.",
    insufficient_funds: "Fonds insuffisants.",
    game_started: "Mise: {bet} €. Cible : 0 à 99. Trouvez vite pour le Jackpot, ou assurez le remboursement. C'est parti !",
    invalid_guess: "Entrez un nombre entre 0 et 99.",
    won: "BINGO ! C'est le {number} ! Gain : {winnings} € (x{multiplier}) !",
    lost: "Perdu... C'était le {number}. On retente ?",
    lost_joker: "Perdu... C'était le {number} ({parity}). On retente ?",
    higher: "C'est PLUS ! Le nombre est entre {min} et {max}. Reste {attemptsLeft} essais.",
    lower: "C'est MOINS ! Le nombre est entre {min} et {max}. Reste {attemptsLeft} essais.",
    higher_burning: "C'est PLUS... mais BRÛLANT ! Vous y êtes presque ! Zone : {min} - {max}. Reste {attemptsLeft} essais.",
    lower_burning: "C'est MOINS... mais BRÛLANT ! Vous y êtes presque ! Zone : {min} - {max}. Reste {attemptsLeft} essais.",
    joker_reveal: "Joker utilisé (-1 essai). Le nombre est {parity} ! Cherchez entre {min} et {max}.",
    hint_higher: "↑ C'est plus",
    hint_lower: "↓ C'est moins",
    hint_won: "= Gagné",
    attempts_left: "Essais restants",
    game_over: "Partie terminée",
    play_again: "Rejouer",
    joker_btn: "JOKER (Coût: 1 Essai)",
    even: "PAIR",
    odd: "IMPAIR"
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('gamble_lang', lang);
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(key, params = {}) {
  let text = translations[currentLang][key] || key;
  for (const [param, value] of Object.entries(params)) {
    text = text.replace(`{${param}}`, value);
  }
  return text;
}

export function initLanguage() {
  const saved = localStorage.getItem('gamble_lang');
  if (saved && translations[saved]) {
    currentLang = saved;
  } else {
    currentLang = 'en'; // Default
  }
  return currentLang;
}
