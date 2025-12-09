export const translations = {
  en: {
    title: "63 Express",
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
    game_started: "Game started. Bet: {bet} €. Find the number (0-99).",
    invalid_guess: "Enter a number between 0 and 99.",
    won: "You won! x{multiplier} -> +{winnings} €",
    lost: "Lost! The number was {number}.",
    higher: "It's higher",
    lower: "It's lower",
    hint_higher: "↑ Higher",
    hint_lower: "↓ Lower",
    hint_won: "= Won",
    attempts_left: "Attempts left",
    game_over: "Game Over",
    play_again: "Play Again"
  },
  fr: {
    title: "63 Express",
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
    game_started: "Jeu lancé. Mise: {bet} €. Trouvez le nombre (0-99).",
    invalid_guess: "Entrez un nombre entre 0 et 99.",
    won: "C'est gagné ! x{multiplier} -> +{winnings} €",
    lost: "Perdu ! Le nombre était {number}.",
    higher: "C'est plus",
    lower: "C'est moins",
    hint_higher: "↑ C'est plus",
    hint_lower: "↓ C'est moins",
    hint_won: "= Gagné",
    attempts_left: "Essais restants",
    game_over: "Partie terminée",
    play_again: "Rejouer"
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
