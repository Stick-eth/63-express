
const SAVE_KEY = 'binary_hustle_save';

export class SaveManager {
    static saveGame(game) {
        if (!game) return;
        const saveData = game.toSaveData();
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }

    static loadGame(game) {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved && game) {
            const data = JSON.parse(saved);
            return game.loadFromSaveData(data);
        }
        return false;
    }

    static hasSavedGame() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    static clearSavedGame() {
        localStorage.removeItem(SAVE_KEY);
    }
}
