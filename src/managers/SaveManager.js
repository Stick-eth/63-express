
import { StorageUtils } from '../utils/StorageUtils.js';

const SAVE_KEY = 'binary_hustle_save';

export class SaveManager {
    static saveGame(game) {
        if (!game) return;
        const saveData = game.toSaveData();
        StorageUtils.setItem(SAVE_KEY, saveData);
    }

    static loadGame(game) {
        if (!game) return false;
        const data = StorageUtils.getItem(SAVE_KEY);
        if (data) {
            return game.loadFromSaveData(data);
        }
        return false;
    }

    static hasSavedGame() {
        return StorageUtils.getItem(SAVE_KEY) !== null;
    }

    static clearSavedGame() {
        localStorage.removeItem(SAVE_KEY);
    }
}
