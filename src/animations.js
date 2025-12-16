import { elements } from './dom.js';

export function runTerminalSequence(lines, onComplete, speed = 50, waitForUser = false) {
    elements.bootText.innerHTML = '';
    if (elements.bootContinueBtn) elements.bootContinueBtn.classList.add('hidden');
    let lineIndex = 0;
    let skipped = false;

    // Expose skip function globally for dev tools
    window.skipTerminalSequence = () => {
        if (skipped) return;
        skipped = true;
        onComplete();
    };
    
    function typeLine() {
        if (skipped) return;

        if (lineIndex >= lines.length) {
            if (waitForUser && elements.bootContinueBtn) {
                elements.bootContinueBtn.classList.remove('hidden');
                elements.bootContinueBtn.onclick = () => {
                    elements.bootContinueBtn.classList.add('hidden');
                    onComplete();
                };
            } else {
                setTimeout(onComplete, 1000);
            }
            return;
        }
        
        const line = lines[lineIndex];
        const p = document.createElement('div');
        p.className = 'mb-1';
        elements.bootText.appendChild(p);
        
        let charIndex = 0;
        const interval = setInterval(() => {
            if (skipped) {
                clearInterval(interval);
                return;
            }
            p.textContent += line[charIndex];
            charIndex++;
            if (charIndex >= line.length) {
                clearInterval(interval);
                lineIndex++;
                setTimeout(typeLine, 100); // Pause between lines
            }
        }, speed / 2); // Faster typing for boot
    }
    
    typeLine();
}

export function startTitleAnimation() {
    const homeTitle = elements.homeTitle;
    if (!homeTitle) return;
    
    const titleText = "BINARY HUSTLE";
    const glitchChars = "!<>-_\\/[]{}—=+*^?#________";
    let currentIndex = 0;
    
    // Typing Phase
    const typeInterval = setInterval(() => {
        homeTitle.textContent = titleText.substring(0, currentIndex) + '█';
        currentIndex++;
        
        if (currentIndex > titleText.length) {
            clearInterval(typeInterval);
            homeTitle.textContent = titleText;
            homeTitle.classList.add('animate-terminal-pulse');
            startGlitchEffect(homeTitle, titleText, glitchChars);
        }
    }, 100);
}

export function startGlitchEffect(element, originalText, chars) {
    setInterval(() => {
        // Randomly decide to glitch
        if (Math.random() > 0.3) return; // 70% chance to do nothing this tick

        const glitchCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 chars
        let glitchedText = originalText.split('');
        
        for (let i = 0; i < glitchCount; i++) {
            const index = Math.floor(Math.random() * originalText.length);
            if (originalText[index] !== ' ') {
                glitchedText[index] = chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        element.textContent = glitchedText.join('');
        
        // Reset quickly
        setTimeout(() => {
            element.textContent = originalText;
        }, 50 + Math.random() * 100);
        
    }, 150);
}

// --- GLOBAL INTERFACE EFFECTS ---

let effectInterval = null;
let currentArcEffect = null;
let currentArcIntensity = 0;
let currentSystemEffect = null;
let currentSystemIntensity = 0;
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function updateVisualEffects(game) {
    // Allow effects in most states except boot/intro sequences
    const effectsAllowed = !['ARC_INTRO', 'BOOT', 'LEVEL_TRANSITION'].includes(game.gameState);
    
    if (!effectsAllowed) {
        stopVisualEffects();
        return;
    }

    // 1. Determine Arc Effect
    let arcEffect = null;
    let arcIntensity = 0;

    if (game.currentArc) {
        if (game.currentArc.id === 'tutorial_virus' && game.level === 2) {
            arcEffect = 'glitch';
            if (game.round === 1) arcIntensity = 0.05;
            else if (game.round === 2) arcIntensity = 0.2;
            else arcIntensity = 0.6;
        } else if (game.currentArc.id === 'audit') {
            arcEffect = 'audit';
            if (game.round === 1) arcIntensity = 0.1;
            else if (game.round === 2) arcIntensity = 0.3;
            else arcIntensity = 0.8;
        } else if (game.currentArc.id === 'overclock') {
            arcEffect = 'overclock';
            const totalProgress = (game.monthInArc - 1) * 3 + game.round;
            arcIntensity = totalProgress / 6;
        } else if (game.currentArc.id === 'botnet') {
            arcEffect = 'botnet';
            const totalProgress = (game.monthInArc - 1) * 3 + game.round;
            arcIntensity = totalProgress / 6;
        } else if (game.currentArc.id === 'ransomware') {
            arcEffect = 'ransomware';
            if (game.round === 1) arcIntensity = 0.2;
            else if (game.round === 2) arcIntensity = 0.5;
            else arcIntensity = 1.0;
        }
    }

    // 2. Determine System Overheat Effect
    let systemEffect = null;
    let systemIntensity = 0;

    if (game.systemOverheatLevel > 20) {
        // Overheat creates a shaking/heat effect similar to 'overclock' but independent
        systemEffect = 'overclock'; 
        // Intensity scales from 0 at 20% to 1.0 at 100%
        systemIntensity = (game.systemOverheatLevel - 20) / 80; 
    }

    // Update State
    if (arcEffect !== currentArcEffect || Math.abs(arcIntensity - currentArcIntensity) > 0.01 ||
        systemEffect !== currentSystemEffect || Math.abs(systemIntensity - currentSystemIntensity) > 0.01) {
        
        currentArcEffect = arcEffect;
        currentArcIntensity = arcIntensity;
        currentSystemEffect = systemEffect;
        currentSystemIntensity = systemIntensity;

        startEffectLoop();
    }
}

export function stopVisualEffects() {
    clearEffects();
    currentArcEffect = null;
    currentArcIntensity = 0;
    currentSystemEffect = null;
    currentSystemIntensity = 0;
}

function clearEffects() {
    if (effectInterval) {
        clearInterval(effectInterval);
        effectInterval = null;
    }
    // Reset Styles
    document.body.classList.remove('animate-shake', 'animate-pulse-red');
    document.body.style.filter = ''; 
    document.body.style.transform = 'none';
    
    const overlay = document.getElementById('effect-overlay');
    if (overlay) {
        overlay.className = 'pointer-events-none fixed inset-0 z-[40] hidden';
        overlay.innerHTML = '';
        overlay.style.background = '';
    }
}

function startEffectLoop() {
    if (effectInterval) clearInterval(effectInterval);

    if (!currentArcEffect && !currentSystemEffect) return;

    const overlay = getOverlay();
    overlay.innerHTML = ''; 
    overlay.classList.remove('hidden');
    overlay.style.background = '';

    // Static Overlay Elements for Arc Effects
    if (currentArcEffect === 'audit') {
        overlay.innerHTML += `<div class="absolute top-4 right-4 border border-red-500 text-red-500 px-2 py-1 text-xs animate-pulse">REC ●</div>`;
        if (currentArcIntensity > 0.5) {
             overlay.innerHTML += `<div class="absolute inset-0 border-4 border-red-500/20 pointer-events-none"></div>`;
        }
    } else if (currentArcEffect === 'ransomware') {
        overlay.innerHTML += `<div class="absolute top-4 left-1/2 -translate-x-1/2 border border-red-500 bg-red-900/20 text-red-500 px-4 py-1 text-sm font-bold animate-pulse">🔒 FILES ENCRYPTED</div>`;
    }

    // Run the combined effect loop
    effectInterval = setInterval(performCombinedEffects, 100);
}

function performCombinedEffects() {
    let shakeIntensity = 0;
    let heatIntensity = 0;

    // 1. Apply Arc Specific Effects
    if (currentArcEffect === 'glitch') performGlobalGlitch(currentArcIntensity);
    if (currentArcEffect === 'audit') performAuditEffect(currentArcIntensity);
    if (currentArcEffect === 'botnet') performBotnetEffect(currentArcIntensity);
    if (currentArcEffect === 'ransomware') performRansomwareEffect(currentArcIntensity);
    
    // Arc 'overclock' contributes to shake/heat
    if (currentArcEffect === 'overclock') {
        shakeIntensity = Math.max(shakeIntensity, currentArcIntensity);
        heatIntensity = Math.max(heatIntensity, currentArcIntensity);
    }

    // 2. Apply System Overheat Effects
    if (currentSystemEffect === 'overclock') {
        // System overheat contributes to shake/heat
        shakeIntensity = Math.max(shakeIntensity, currentSystemIntensity);
        heatIntensity = Math.max(heatIntensity, currentSystemIntensity);
    }

    // 3. Apply Physical Effects (Shake/Heat) if any source is active
    if (shakeIntensity > 0 || heatIntensity > 0) {
        applyPhysicalEffects(shakeIntensity, heatIntensity);
    } else {
        // Reset physical effects if no longer active but loop is running (e.g. only glitching)
        document.body.style.transform = 'none';
        const overlay = getOverlay();
        // Only clear background if we aren't using it for something else? 
        // Actually applyPhysicalEffects manages the background for heat.
        // We should be careful not to clear other overlay elements.
        // Let's just reset the background property used for heat.
        if (overlay.style.background.includes('radial-gradient')) {
             overlay.style.background = '';
        }
    }
}

function applyPhysicalEffects(shakeIntensity, heatIntensity) {
    const body = document.body;
    
    // Shake
    if (Math.random() < shakeIntensity * 0.5) {
        const x = (Math.random() - 0.5) * shakeIntensity * 10;
        const y = (Math.random() - 0.5) * shakeIntensity * 10;
        body.style.transform = `translate(${x}px, ${y}px)`;
    } else {
        body.style.transform = 'none';
    }

    // Heat Blur / Color Shift
    const overlay = getOverlay();
    if (heatIntensity > 0) {
        overlay.style.background = `radial-gradient(circle, transparent 50%, rgba(255, 69, 0, ${heatIntensity * 0.3}))`;
        
        // Occasional "WARNING" flash
        if (heatIntensity > 0.7 && Math.random() < 0.05) {
            const warning = document.createElement('div');
            warning.className = 'absolute inset-0 flex items-center justify-center text-red-500 font-bold text-9xl opacity-20 rotate-[-10deg] pointer-events-none';
            warning.textContent = 'HEAT CRITICAL';
            overlay.appendChild(warning);
            setTimeout(() => warning.remove(), 200);
        }
    }
}

function getOverlay() {
    let overlay = document.getElementById('effect-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'effect-overlay';
        overlay.className = 'pointer-events-none fixed inset-0 z-[40] hidden';
        document.body.appendChild(overlay);
    }
    return overlay;
}

function performAuditEffect(intensity) {
    if (Math.random() > intensity) return;
    const overlay = getOverlay();
    const scanLine = document.createElement('div');
    scanLine.className = 'absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_10px_red]';
    scanLine.style.top = `${Math.random() * 100}%`;
    overlay.appendChild(scanLine);
    setTimeout(() => scanLine.remove(), 500);
}

function performGlobalGlitch(intensity) {
    const targets = [
        elements.cashDisplay, elements.rentDisplay, elements.levelDisplay,
        elements.roundDisplay, elements.messageText, elements.startBtn,
        elements.nextBtn, elements.guessBtn, elements.leaveShopBtn,
        // Target the span inside appShopBtn to avoid destroying the icon div
        elements.appShopBtn ? elements.appShopBtn.querySelector('span') : null,
        elements.browserContinueBtn,
        document.querySelector('h1')
    ];

    targets.forEach(el => {
        if (!el || Math.random() > intensity) return;
        if (el.dataset.isGlitching) return;

        const original = el.textContent;
        if (!original) return;

        el.dataset.isGlitching = "true";
        const glitched = original.split('').map(char => {
            if (char === ' ' || char === '\n') return char;
            return Math.random() < intensity ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : char;
        }).join('');

        el.textContent = glitched;
        
        if (intensity > 0.3) {
            el.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            el.style.color = Math.random() > 0.5 ? '#ef4444' : '#22c55e';
        }

        setTimeout(() => {
            if (el) {
                el.textContent = original;
                el.style.transform = 'none';
                el.style.color = '';
                delete el.dataset.isGlitching;
            }
        }, 50 + Math.random() * 100);
    });
}

function performBotnetEffect(intensity) {
    if (Math.random() > intensity) return;
    const overlay = getOverlay();
    
    if (Math.random() < 0.3) {
        const packet = document.createElement('div');
        packet.className = 'absolute w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan]';
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        packet.style.left = `${startX}%`;
        packet.style.top = `${startY}%`;
        packet.style.opacity = '0.8';
        packet.style.transition = `all ${1 + Math.random()}s linear`;
        overlay.appendChild(packet);
        requestAnimationFrame(() => {
            const endX = Math.random() * 100;
            const endY = Math.random() * 100;
            packet.style.transform = `translate(${endX - startX}vw, ${endY - startY}vh)`;
            packet.style.opacity = '0';
        });
        setTimeout(() => packet.remove(), 2000);
    }

    if (Math.random() < 0.1 * intensity) {
        const log = document.createElement('div');
        log.className = 'absolute text-xs text-cyan-500/70 pointer-events-none';
        log.style.left = `${Math.random() * 80 + 10}%`;
        log.style.top = `${Math.random() * 80 + 10}%`;
        const messages = ["UPLOADING...", "PACKET_LOSS: 0%", "NODE_SYNC", "HIVE_STATUS: ACTIVE", "PING: 1ms", "TARGET_ACQUIRED"];
        log.textContent = `> ${messages[Math.floor(Math.random() * messages.length)]}`;
        overlay.appendChild(log);
        setTimeout(() => log.remove(), 1500);
    }
}

function performRansomwareEffect(intensity) {
    const overlay = getOverlay();
    if (Math.random() < 0.2 * intensity) {
        const lock = document.createElement('div');
        lock.className = 'absolute text-red-600/40 text-4xl font-bold select-none pointer-events-none';
        lock.textContent = '🔒';
        lock.style.left = `${Math.random() * 90}%`;
        lock.style.top = `${Math.random() * 90}%`;
        lock.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        overlay.appendChild(lock);
        setTimeout(() => lock.remove(), 1000);
    }
    if (Math.random() < 0.1 * intensity) {
        const msg = document.createElement('div');
        msg.className = 'absolute text-red-500 font-bold bg-black/80 px-2 py-1 border border-red-500';
        msg.style.left = `${Math.random() * 70 + 15}%`;
        msg.style.top = `${Math.random() * 70 + 15}%`;
        msg.style.fontSize = `${Math.random() * 1.5 + 0.8}rem`;
        const texts = ["YOUR FILES ARE ENCRYPTED", "PAYMENT REQUIRED", "KEY NOT FOUND", "ACCESS DENIED"];
        msg.textContent = texts[Math.floor(Math.random() * texts.length)];
        overlay.appendChild(msg);
        setTimeout(() => msg.remove(), 800);
    }
    if (intensity > 0.5 && Math.random() < 0.02) {
        document.body.style.filter = 'invert(1)';
        setTimeout(() => { document.body.style.filter = 'none'; }, 100 + Math.random() * 200);
    }
    
    // 4. Reuse Global Glitch
    if (Math.random() < intensity * 0.5) {
        performGlobalGlitch(intensity);
    }
}
