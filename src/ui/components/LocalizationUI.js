import { elements } from '../../dom.js';
import { staticTexts } from '../../localization.js';

export function getLoc(obj, lang) {
    if (typeof obj === 'string' || typeof obj === 'number') return obj;
    if (typeof obj === 'object' && obj !== null) {
        return obj[lang] || obj['en'] || '';
    }
    return '';
}

export function updateStaticTexts(currentLang, currentTheme, themes) {
    const t = staticTexts[currentLang];

    if (elements.homeStartBtn) elements.homeStartBtn.textContent = t.start;
    if (elements.settingsBtn) elements.settingsBtn.textContent = t.settings;

    if (elements.lblLang) elements.lblLang.textContent = t.lang;
    if (elements.lblTheme) elements.lblTheme.textContent = t.theme;
    if (elements.lblGridKey) elements.lblGridKey.textContent = t.gridKey;
    if (elements.lblNumpadKey) elements.lblNumpadKey.textContent = "NUMPAD SHORTCUT";
    if (elements.settingsBackBtn) elements.settingsBackBtn.textContent = t.return;

    if (elements.settingLangBtn) elements.settingLangBtn.textContent = currentLang.toUpperCase();
    if (elements.settingThemeBtn) elements.settingThemeBtn.textContent = themes[currentTheme].label;

    if (elements.resumeBtn) elements.resumeBtn.textContent = t.resume;
    if (elements.saveQuitBtn) elements.saveQuitBtn.textContent = t.save_and_quit;

    if (elements.abandonBtn) elements.abandonBtn.title = t.abandon_run;

    // Abandon Run
    if (elements.lblAbandonConfirm) elements.lblAbandonConfirm.textContent = t.abandon_confirm_text;
    if (elements.abandonYesBtn) elements.abandonYesBtn.textContent = t.abandon_yes;
    if (elements.abandonNoBtn) elements.abandonNoBtn.textContent = t.abandon_no;

    // Title in Overlay
    if (elements.abandonConfirmScreen) {
        const title = elements.abandonConfirmScreen.querySelector('h3');
        if (title) title.textContent = t.abandon_confirm_title;
    }

    const pauseTitle = elements.pauseOverlay.querySelector('h2');
    if (pauseTitle) pauseTitle.textContent = t.paused;

    if (elements.guessBtn) elements.guessBtn.textContent = t.enter;
    if (elements.leaveShopBtn) elements.leaveShopBtn.textContent = t.exitShop;
    if (elements.nextBtn) elements.nextBtn.textContent = t.continue;
}
