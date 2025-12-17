
const SETTINGS_KEY = 'binary_hustle_settings';

export const themes = {
    'green': { filter: 'none', label: 'GREEN' },
    'blue': { filter: 'hue-rotate(90deg)', label: 'BLUE' },
    'amber': { filter: 'hue-rotate(260deg)', label: 'AMBER' },
    'red': { filter: 'hue-rotate(220deg)', label: 'RED' },
};

export class SettingsManager {
    constructor() {
        this.currentLang = 'en';
        this.currentTheme = 'green';
        this.gridKey = 'p';
        this.numpadKey = 'o';
    }

    loadSettings() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            this.currentLang = data.lang || 'en';
            this.currentTheme = data.theme || 'green';
            this.gridKey = data.gridKey || 'p';
            this.numpadKey = data.numpadKey || 'o';
        }
    }

    saveSettings() {
        const data = {
            lang: this.currentLang,
            theme: this.currentTheme,
            gridKey: this.gridKey,
            numpadKey: this.numpadKey
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    }

    // Getters for ease of access
    get lang() { return this.currentLang; }
    get theme() { return this.currentTheme; }
    get themeFilter() { return themes[this.currentTheme].filter; }
}

// Singleton instance
export const settings = new SettingsManager();
