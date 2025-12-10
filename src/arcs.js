import * as Loc from './localization.js';

export const STANDARD_ARC = {
    id: 'standard',
    duration: 1,
    introSequence: (lang) => lang === 'fr' ? Loc.standardIntroFr : Loc.standardIntroEn,
    monthEvents: {},
    bosses: {} // No boss
};

export const ARCS = [
    {
        id: 'tutorial_virus',
        duration: 2, // Months
        introSequence: (lang) => lang === 'fr' ? Loc.loreSequenceFr : Loc.loreSequenceEn,
        monthEvents: {
            1: {
                intro: (lang) => lang === 'fr' ? Loc.bankSequenceFr : Loc.bankSequenceEn, // End of Month 1
            },
            2: {
                intro: (lang) => lang === 'fr' ? Loc.bugSequenceFr : Loc.bugSequenceEn, // Start of Month 2 (Boss Intro)
                outro: (lang) => lang === 'fr' ? Loc.rebootSequenceFr : Loc.rebootSequenceEn // End of Month 2 (Boss Defeated)
            }
        },
        bosses: {
            1: null, // Month 1 has no boss (just phishing mail)
            2: {
                id: 'glitch_king',
                name: { en: 'GLITCH_KING.EXE', fr: 'ROI_GLITCH.EXE' },
                description: { en: 'Interface corrupted. Visual artifacts.', fr: 'Interface corrompue. Artefacts visuels.' },
                effect: 'glitch'
            }
        }
    },
    {
        id: 'audit',
        duration: 1,
        introSequence: (lang) => lang === 'fr' ? Loc.auditIntroFr : Loc.auditIntroEn,
        monthEvents: {},
        bosses: {
            1: {
                id: 'inspector',
                name: { en: 'INSPECTOR.AI', fr: 'INSPECTEUR.IA' },
                description: { en: 'Assets frozen. Missed attempts cost $1.', fr: 'Actifs gelés. Les essais ratés coûtent 1$.' },
                effect: 'tax'
            }
        }
    },
    {
        id: 'overclock',
        duration: 2,
        introSequence: (lang) => lang === 'fr' ? Loc.overclockIntroFr : Loc.overclockIntroEn,
        monthEvents: {
            2: {
                intro: (lang) => lang === 'fr' ? Loc.meltdownIntroFr : Loc.meltdownIntroEn
            }
        },
        bosses: {
            1: {
                id: 'cooling_script',
                name: { en: 'COOLING_SYS.BAT', fr: 'SYS_REFROIDISSEMENT.BAT' },
                description: { en: 'Fan speed unstable. Random range shifts.', fr: 'Ventilateurs instables. Changements d\'intervalle aléatoires.' },
                effect: 'fan_noise'
            },
            2: {
                id: 'core_meltdown',
                name: { en: 'CORE_MELTDOWN', fr: 'FUSION_DU_CŒUR' },
                description: { en: 'Sensors fried. No burning hints.', fr: 'Capteurs grillés. Pas d\'indices brûlants.' },
                effect: 'meltdown'
            }
        }
    },
    {
        id: 'botnet',
        duration: 2,
        introSequence: (lang) => lang === 'fr' ? Loc.botnetIntroFr : Loc.botnetIntroEn,
        monthEvents: {
            2: {
                intro: (lang) => lang === 'fr' ? Loc.hiveIntroFr : Loc.hiveIntroEn
            }
        },
        bosses: {
            1: {
                id: 'daemon_service',
                name: { en: 'DAEMON.SERVICE', fr: 'SERVICE.DAEMON' },
                description: { en: 'Resource leech. Max attempts -1.', fr: 'Siphon de ressources. Essais max -1.' },
                effect: 'leech'
            },
            2: {
                id: 'hive_mind',
                name: { en: 'HIVE_MIND', fr: 'ESPRIT_RUCHE' },
                description: { en: 'Input lag. 50% chance of guess deviation.', fr: 'Lag d\'entrée. 50% de chance de déviation.' },
                effect: 'input_lag'
            }
        }
    },
    {
        id: 'ransomware',
        duration: 1,
        introSequence: (lang) => lang === 'fr' ? Loc.ransomwareIntroFr : Loc.ransomwareIntroEn,
        monthEvents: {},
        bosses: {
            1: {
                id: 'crypto_locker',
                name: { en: 'CRYPT0_L0CKER', fr: 'CRYPT0_L0CKER' },
                description: { en: 'Data encrypted. Range hidden for first 3 attempts.', fr: 'Données chiffrées. Intervalle caché les 3 premiers essais.' },
                effect: 'blind'
            }
        }
    }
];
