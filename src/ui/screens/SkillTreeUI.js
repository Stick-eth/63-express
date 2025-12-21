/**
 * SkillTreeUI - Renders and manages the skill tree interface
 * GitHub-style branch display with vertical skill chains
 */

import { SkillTreeManager } from '../../managers/SkillTreeManager.js';
import { TokenManager } from '../../managers/TokenManager.js';
import { getSkillChain, getSkill, SKILL_TREE, getMinerSubBranch, getMinerSubBranches, getBrowserSubBranch, getBrowserSubBranches } from '../../systems/SkillTreeData.js';
import { t } from '../../i18n.js';

// Branch colors
const BRANCH_COLORS = {
    miner: {
        border: 'border-yellow-500',
        borderLocked: 'border-yellow-900',
        bg: 'bg-yellow-900/20',
        bgHover: 'hover:bg-yellow-500',
        text: 'text-yellow-400',
        textLocked: 'text-yellow-800',
        line: 'bg-yellow-600'
    },
    browser: {
        border: 'border-blue-500',
        borderLocked: 'border-blue-900',
        bg: 'bg-blue-900/20',
        bgHover: 'hover:bg-blue-500',
        text: 'text-blue-400',
        textLocked: 'text-blue-800',
        line: 'bg-blue-600'
    },
    machine: {
        border: 'border-red-500',
        borderLocked: 'border-red-900',
        bg: 'bg-red-900/20',
        bgHover: 'hover:bg-red-500',
        text: 'text-red-400',
        textLocked: 'text-red-800',
        line: 'bg-red-600'
    }
};

let currentBranch = 'miner';
let currentMinerSubBranch = 'gain'; // For Miner sub-branches
let pendingSkillId = null; // For modal confirmation

/**
 * Initialize the skill tree UI
 */
export function initSkillTreeUI() {
    const skillTreeBtn = document.getElementById('skill-tree-btn');
    const skillTreeScreen = document.getElementById('skill-tree-screen');
    const skillTreeBackBtn = document.getElementById('skill-tree-back-btn');
    const homeScreen = document.getElementById('home-screen');
    const branchTabs = document.querySelectorAll('.branch-tab');
    const coreBtn = document.getElementById('skill-core');

    // Modal confirm buttons
    const confirmModal = document.getElementById('skill-unlock-confirm');
    const confirmYes = document.getElementById('skill-unlock-yes-btn');
    const confirmNo = document.getElementById('skill-unlock-no-btn');

    if (skillTreeBtn) {
        skillTreeBtn.addEventListener('click', () => {
            homeScreen?.classList.add('hidden');
            skillTreeScreen?.classList.remove('hidden');
            updateSkillTreeUI();
        });
    }

    if (skillTreeBackBtn) {
        skillTreeBackBtn.addEventListener('click', () => {
            skillTreeScreen?.classList.add('hidden');
            homeScreen?.classList.remove('hidden');
        });
    }

    // Branch tab switching
    branchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentBranch = tab.dataset.branch;
            updateBranchTabs();
            renderBranchSkills(currentBranch);
        });
    });

    // Core node click
    if (coreBtn) {
        coreBtn.addEventListener('click', () => {
            handleSkillClick('core');
        });
    }

    // Modal confirm handlers
    if (confirmYes) {
        confirmYes.addEventListener('click', () => {
            if (pendingSkillId) {
                const result = SkillTreeManager.unlockSkill(pendingSkillId);
                if (result.success) {
                    updateSkillTreeUI();
                    TokenManager.updateTokenDisplay();
                    updateDevTreeButtonVisibility();
                }
            }
            pendingSkillId = null;
            confirmModal?.classList.add('hidden');
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            pendingSkillId = null;
            confirmModal?.classList.add('hidden');
        });
    }

    // Initial button visibility check
    updateDevTreeButtonVisibility();
}

/**
 * Update the entire skill tree UI
 */
export function updateSkillTreeUI() {
    updateTokenDisplay();
    updateCoreNode();
    updateBranchTabs();
    renderBranchSkills(currentBranch);
}

/**
 * Show/hide DEV_TREE button based on whether player has ever earned tokens
 */
export function updateDevTreeButtonVisibility() {
    const btn = document.getElementById('skill-tree-btn');
    if (btn && TokenManager.hasEverEarnedToken()) {
        btn.classList.remove('hidden');
    }
}

/**
 * Update token display in skill tree
 */
function updateTokenDisplay() {
    const tokenEl = document.getElementById('skill-tree-tokens');
    if (tokenEl) {
        tokenEl.textContent = `🪙 ${TokenManager.getTokens()}`;
    }
}

/**
 * Update core node appearance
 */
function updateCoreNode() {
    const coreBtn = document.getElementById('skill-core');
    if (!coreBtn) return;

    const isUnlocked = SkillTreeManager.hasSkill('core');
    const iconEl = coreBtn.querySelector('.text-2xl');
    const titleEl = coreBtn.querySelector('.font-bold');
    const descEl = coreBtn.querySelector('.text-xs');

    if (isUnlocked) {
        // Transform into progress indicator
        const unlocked = SkillTreeManager.getUnlockedCount();
        const total = SkillTreeManager.getTotalSkillCount();
        const percent = Math.round((unlocked / total) * 100);

        coreBtn.classList.add('bg-purple-900/30', 'text-purple-300');
        coreBtn.classList.remove('bg-purple-900/20', 'text-purple-400', 'hover:bg-purple-500', 'hover:text-black', 'bg-purple-500', 'text-black');
        coreBtn.style.cursor = 'default';

        if (iconEl) iconEl.textContent = '📊';
        if (titleEl) titleEl.textContent = `PROGRESSION: ${percent}%`;
        if (descEl) descEl.textContent = `${unlocked}/${total} upgrades unlocked`;
    } else {
        coreBtn.classList.remove('bg-purple-500', 'text-black');
        coreBtn.classList.add('bg-purple-900/20', 'text-purple-400');
        coreBtn.style.cursor = 'pointer';

        if (iconEl) iconEl.textContent = '🖤';
        if (titleEl) titleEl.textContent = 'NEURAL CORE';
        if (descEl) descEl.textContent = 'Unlock all branches • 1 Token';
    }
}

/**
 * Update branch tab appearances
 */
function updateBranchTabs() {
    const tabs = document.querySelectorAll('.branch-tab');
    const coreUnlocked = SkillTreeManager.hasSkill('core');

    tabs.forEach(tab => {
        const branch = tab.dataset.branch;
        const isActive = branch === currentBranch;
        const colors = BRANCH_COLORS[branch];

        // Reset classes
        tab.className = 'branch-tab flex-1 py-3 border-2 transition-colors uppercase font-bold text-sm';

        if (!coreUnlocked) {
            // Locked state
            tab.classList.add(colors.borderLocked, colors.textLocked, 'opacity-50', 'cursor-not-allowed');
        } else if (isActive) {
            // Active state
            tab.classList.add(colors.border, colors.text, colors.bg);
        } else {
            // Inactive but available
            tab.classList.add(colors.border, colors.text, 'hover:' + colors.bg.replace('/', '\\/'));
        }
    });
}

/**
 * Render skills for a specific branch
 */
function renderBranchSkills(branch) {
    const container = document.getElementById('branch-content');
    if (!container) return;

    const coreUnlocked = SkillTreeManager.hasSkill('core');

    if (!coreUnlocked) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-4xl mb-4 opacity-50">🔒</div>
                <p class="text-purple-600 uppercase tracking-widest">
                    Unlock Neural Core to access branches
                </p>
            </div>
        `;
        return;
    }

    const colors = BRANCH_COLORS[branch];
    const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    let html = '';

    // For Miner branch, show visual tree with 5 branches
    if (branch === 'miner') {
        const subBranches = getMinerSubBranches();

        // Visual tree structure
        html += `
            <div class="miner-tree relative">
                <!-- Tree Header -->
                <div class="text-center mb-4">
                    <div class="text-yellow-500 text-sm uppercase tracking-widest mb-1">⛏️ MINER TREE</div>
                    <div class="w-1 h-6 bg-yellow-600 mx-auto"></div>
                </div>
                
                <!-- Horizontal connector from core to branches -->
                <div class="flex justify-center mb-2">
                    <div class="h-1 bg-yellow-600 opacity-60" style="width: 80%"></div>
                </div>
                
                <!-- 5 Branch Columns -->
                <div class="flex justify-center gap-2">
        `;

        subBranches.forEach((sub, subIdx) => {
            const skills = getMinerSubBranch(sub);
            const subIcons = { gain: '💎', range: '🔍', attempts: '💾', economy: '🏦', mastery: '🌟' };
            const subNames = {
                gain: { en: 'GAIN', fr: 'GAIN' },
                range: { en: 'RANGE', fr: 'RANGE' },
                attempts: { en: 'LIVES', fr: 'VIES' },
                economy: { en: 'CASH', fr: 'CASH' },
                mastery: { en: 'MASTER', fr: 'MAÎTRE' }
            };

            const unlockedCount = skills.filter(s => SkillTreeManager.hasSkill(s.id)).length;

            html += `
                <div class="flex flex-col items-center" style="min-width: 56px">
                    <!-- Branch header -->
                    <div class="text-xs text-yellow-600 uppercase mb-1">${subNames[sub][lang]}</div>
                    <div class="w-1 h-3 bg-yellow-600 opacity-60"></div>
                    
                    <!-- Skill nodes -->
                    <div class="flex flex-col items-center gap-1">
            `;

            skills.forEach((skill, idx) => {
                html += renderIconSkillNode(skill, colors, lang);

                // Connecting line (except for last)
                if (idx < skills.length - 1) {
                    const isUnlocked = SkillTreeManager.hasSkill(skill.id);
                    html += `<div class="w-0.5 h-2 ${isUnlocked ? 'bg-yellow-500' : 'bg-gray-700'}"></div>`;
                }
            });

            html += `
                    </div>
                    <!-- Branch counter -->
                    <div class="text-[10px] text-yellow-700 mt-1">${unlockedCount}/6</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    } else if (branch === 'browser') {
        // Browser branch: 4 sub-branches in visual tree
        const subBranches = getBrowserSubBranches();
        const subNames = {
            shop: { en: 'SHOP', fr: 'BOUTIQUE' },
            av: { en: 'ANTIVIRUS', fr: 'ANTIVIRUS' },
            trade: { en: 'TRADING', fr: 'TRADING' },
            oc: { en: 'OVERCLOCK', fr: 'OVERCLOCK' }
        };
        const subIcons = { shop: '🛒', av: '🛡️', trade: '📈', oc: '⚡' };

        html += `
            <div class="browser-tree relative">
                <!-- Tree Header -->
                <div class="text-center mb-4">
                    <div class="text-blue-500 text-sm uppercase tracking-widest mb-1">🌐 BROWSER TREE</div>
                    <div class="w-1 h-6 bg-blue-600 mx-auto"></div>
                </div>
                
                <!-- Horizontal connector -->
                <div class="flex justify-center mb-2">
                    <div class="h-1 bg-blue-600 opacity-60" style="width: 200px;"></div>
                </div>
                
                <!-- 4 Branch Columns -->
                <div class="flex justify-center gap-3">
        `;

        subBranches.forEach((sub, subIdx) => {
            const skills = getBrowserSubBranch(sub);
            const unlockedCount = skills.filter(s => SkillTreeManager.hasSkill(s.id)).length;

            html += `
                <div class="flex flex-col items-center" style="min-width: 64px">
                    <!-- Branch header -->
                    <div class="text-xs text-blue-600 uppercase mb-1 flex flex-col items-center">
                        <span class="text-lg">${subIcons[sub]}</span>
                        <span class="text-[8px]">${subNames[sub][lang]}</span>
                    </div>
                    <div class="w-1 h-3 bg-blue-600 opacity-60"></div>
                    
                    <!-- Skill nodes -->
                    <div class="flex flex-col items-center gap-1">
            `;

            skills.forEach((skill, idx) => {
                html += renderIconSkillNode(skill, colors, lang);
                if (idx < skills.length - 1) {
                    const isUnlocked = SkillTreeManager.hasSkill(skill.id);
                    html += `<div class="w-0.5 h-2 ${isUnlocked ? 'bg-blue-500' : 'bg-gray-700'}"></div>`;
                }
            });

            html += `
                    </div>
                    <!-- Branch counter -->
                    <div class="text-[10px] text-blue-700 mt-1">${unlockedCount}/5</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    } else {
        // For Machine, show COMING SOON
        html = `
            <div class="flex flex-col items-center gap-4 py-12">
                <div class="text-6xl opacity-50">🔧</div>
                <div class="text-red-500 text-xl font-bold uppercase tracking-widest">COMING SOON</div>
                <p class="text-gray-600 text-sm text-center max-w-xs">
                    Machine upgrades are in development. Check back later!
                </p>
            </div>
        `;
    }

    container.innerHTML = html;

    // Add click handlers for skill nodes
    container.querySelectorAll('.skill-node').forEach(node => {
        node.addEventListener('click', () => {
            handleSkillClick(node.dataset.skill);
        });
    });
}

/**
 * Render a skill node as icon-only with hover tooltip
 */
function renderIconSkillNode(skill, colors, lang) {
    const isUnlocked = SkillTreeManager.hasSkill(skill.id);
    const canUnlockResult = SkillTreeManager.canUnlock(skill.id);
    const isAvailable = canUnlockResult.canUnlock;

    const hasPrerequisites = !canUnlockResult.reason ||
        canUnlockResult.reason === 'insufficient_tokens' ||
        canUnlockResult.reason === 'already_unlocked';
    const showInfo = isUnlocked || hasPrerequisites;
    const needsMoreTokens = canUnlockResult.reason === 'insufficient_tokens';

    const name = showInfo ? skill.name[lang] : '???';
    const desc = showInfo ? skill.description[lang] : '???';
    const cost = showInfo ? skill.cost : '?';

    // Tooltip content
    const tooltip = `${name}\n${desc}\n${isUnlocked ? '✓ UNLOCKED' : `🪙 ${cost}`}`;

    return `
        <button 
            class="skill-node relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all group
                ${isUnlocked
            ? 'border-yellow-400 bg-yellow-900/50 text-yellow-300 shadow-lg shadow-yellow-500/30'
            : isAvailable
                ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/50 hover:scale-110'
                : needsMoreTokens
                    ? 'border-yellow-600 bg-gray-900/50 text-yellow-600 opacity-80'
                    : 'border-gray-700 bg-gray-900/50 text-gray-600 opacity-50'
        }"
            data-skill="${skill.id}"
            ${!isAvailable && !isUnlocked ? 'disabled' : ''}
            title="${tooltip}"
        >
            ${showInfo ? skill.icon : '🔒'}
            ${isUnlocked ? '<span class="absolute -top-1 -right-1 text-xs bg-green-500 text-black rounded-full w-4 h-4 flex items-center justify-center">✓</span>' : ''}
            
            <!-- Hover tooltip -->
            <div class="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="bg-gray-900 border-2 border-yellow-600 rounded-lg p-3 text-left min-w-[180px] shadow-xl">
                    <div class="font-bold text-yellow-400 text-sm uppercase">${name}</div>
                    <div class="text-gray-300 text-xs mt-1">${desc}</div>
                    <div class="text-xs mt-2 ${isUnlocked ? 'text-green-400' : needsMoreTokens ? 'text-red-400' : 'text-yellow-500'}">
                        ${isUnlocked ? '✓ UNLOCKED' : `🪙 ${cost} tokens`}
                    </div>
                </div>
                <div class="w-3 h-3 bg-gray-900 border-b-2 border-r-2 border-yellow-600 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5"></div>
            </div>
        </button>
    `;
}

/**
 * Render a single skill node
 */
function renderSkillNode(skill, colors, lang) {
    const isUnlocked = SkillTreeManager.hasSkill(skill.id);
    const canUnlockResult = SkillTreeManager.canUnlock(skill.id);
    const isAvailable = canUnlockResult.canUnlock;

    // Show description if unlocked, available, OR prerequisites are met (just not enough tokens)
    const hasPrerequisites = !canUnlockResult.reason ||
        canUnlockResult.reason === 'insufficient_tokens' ||
        canUnlockResult.reason === 'already_unlocked';
    const showDescription = isUnlocked || hasPrerequisites;
    const displayDesc = showDescription ? skill.description[lang] : '???';

    // Different styling: if prerequisites met but not enough tokens, show as "affordable when ready"
    const needsMoreTokens = canUnlockResult.reason === 'insufficient_tokens';

    return `
        <button 
            class="skill-node w-full py-4 px-6 border-2 transition-all ${isUnlocked
            ? `${colors.border} ${colors.bg} ${colors.text}`
            : isAvailable
                ? `${colors.border} ${colors.text} hover:${colors.bg}`
                : needsMoreTokens
                    ? `${colors.border} ${colors.textLocked} opacity-80`
                    : `${colors.borderLocked} ${colors.textLocked} opacity-60 cursor-not-allowed`
        }"
            data-skill="${skill.id}"
            ${!isAvailable && !isUnlocked ? 'disabled' : ''}
        >
            <div class="flex items-center gap-4">
                <div class="text-3xl">${isUnlocked || showDescription ? skill.icon : '🔒'}</div>
                <div class="flex-1 text-left">
                    <div class="font-bold uppercase">${showDescription ? skill.name[lang] : '???'}</div>
                    <div class="text-xs opacity-80">${displayDesc}</div>
                </div>
                <div class="text-right">
                    ${isUnlocked
            ? '<span class="text-lg">✓</span>'
            : showDescription ? `<span class="text-sm font-bold ${needsMoreTokens ? 'text-red-400' : ''}">🪙 ${skill.cost}</span>` : ''}
                </div>
            </div>
        </button>
    `;
}

/**
 * Handle skill node click
 */
function handleSkillClick(skillId) {
    const skill = getSkill(skillId);
    if (!skill) return;

    const isUnlocked = SkillTreeManager.hasSkill(skillId);
    if (isUnlocked) {
        return;
    }

    const canUnlock = SkillTreeManager.canUnlock(skillId);
    if (!canUnlock.canUnlock) {
        return;
    }

    // Show in-game modal instead of browser confirm()
    const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    const modal = document.getElementById('skill-unlock-confirm');
    const nameEl = document.getElementById('skill-unlock-name');
    const descEl = document.getElementById('skill-unlock-desc');
    const costEl = document.getElementById('skill-unlock-cost');
    const titleEl = document.getElementById('skill-unlock-title');

    if (modal && nameEl && descEl && costEl) {
        titleEl.textContent = lang === 'fr' ? 'DÉBLOQUER' : 'UNLOCK';
        nameEl.textContent = skill.name[lang];
        descEl.textContent = skill.description[lang];
        costEl.textContent = `🪙 ${skill.cost}`;
        pendingSkillId = skillId;
        modal.classList.remove('hidden');
    }
}
