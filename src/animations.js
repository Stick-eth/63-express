import { elements } from './dom.js';

export function runTerminalSequence(lines, onComplete, speed = 50, waitForUser = false) {
    elements.bootText.innerHTML = '';
    if (elements.bootContinueBtn) elements.bootContinueBtn.classList.add('hidden');
    let lineIndex = 0;
    
    function typeLine() {
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
let currentEffect = null;
let currentIntensity = 0;
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function updateVisualEffects(game) {
    // Determine Effect based on Current Arc
    let effectType = null;
    let intensity = 0;

    if (game.currentArc) {
        if (game.currentArc.id === 'tutorial_virus' && game.level === 2) {
            effectType = 'glitch';
            // Intensity scales with round (Week)
            if (game.round === 1) intensity = 0.05;
            else if (game.round === 2) intensity = 0.2;
            else intensity = 0.6;
        } else if (game.currentArc.id === 'audit') {
            effectType = 'audit';
            // Intensity scales with round
            if (game.round === 1) intensity = 0.1;
            else if (game.round === 2) intensity = 0.3;
            else intensity = 0.8;
        } else if (game.currentArc.id === 'overclock') {
            effectType = 'overclock';
            // Intensity scales with Month AND Round
            const totalProgress = (game.monthInArc - 1) * 3 + game.round; // 1 to 6
            intensity = totalProgress / 6; // 0.16 to 1.0
        } else if (game.currentArc.id === 'botnet') {
            effectType = 'botnet';
            const totalProgress = (game.monthInArc - 1) * 3 + game.round;
            intensity = totalProgress / 6;
        } else if (game.currentArc.id === 'ransomware') {
            effectType = 'ransomware';
            if (game.round === 1) intensity = 0.2;
            else if (game.round === 2) intensity = 0.5;
            else intensity = 1.0;
        }
    }

    // Update State
    if (effectType !== currentEffect || Math.abs(intensity - currentIntensity) > 0.01) {
        // Clear previous
        clearEffects();
        
        currentEffect = effectType;
        currentIntensity = intensity;

        if (currentEffect) {
            startEffectLoop();
        }
    }
}

function clearEffects() {
    if (effectInterval) {
        clearInterval(effectInterval);
        effectInterval = null;
    }
    // Reset Styles
    document.body.classList.remove('animate-shake', 'animate-pulse-red');
    document.body.style.filter = ''; // Be careful not to override theme filter, handled in main.js applySettings
    // We might need a dedicated overlay div for filters to avoid conflict
    
    const overlay = document.getElementById('effect-overlay');
    if (overlay) {
        overlay.className = 'pointer-events-none fixed inset-0 z-[40] hidden';
        overlay.innerHTML = '';
    }
}

function startEffectLoop() {
    if (effectInterval) clearInterval(effectInterval);

    if (currentEffect === 'glitch') {
        effectInterval = setInterval(performGlobalGlitch, 150);
    } else if (currentEffect === 'audit') {
        effectInterval = setInterval(performAuditEffect, 1000);
        // Add static overlay
        const overlay = getOverlay();
        overlay.classList.remove('hidden');
        overlay.innerHTML = `<div class="absolute top-4 right-4 border border-red-500 text-red-500 px-2 py-1 text-xs animate-pulse">REC ●</div>`;
        if (currentIntensity > 0.5) {
             overlay.innerHTML += `<div class="absolute inset-0 border-4 border-red-500/20 pointer-events-none"></div>`;
        }
    } else if (currentEffect === 'overclock') {
        effectInterval = setInterval(performOverclockEffect, 100);
    } else if (currentEffect === 'botnet') {
        effectInterval = setInterval(performBotnetEffect, 200);
    } else if (currentEffect === 'ransomware') {
        effectInterval = setInterval(performRansomwareEffect, 500);
        const overlay = getOverlay();
        overlay.classList.remove('hidden');
        overlay.innerHTML = `<div class="absolute top-4 left-1/2 -translate-x-1/2 border border-red-500 bg-red-900/20 text-red-500 px-4 py-1 text-sm font-bold animate-pulse">🔒 FILES ENCRYPTED</div>`;
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

function performAuditEffect() {
    // Random "SCANNING" lines or popups
    if (Math.random() > currentIntensity) return;

    const overlay = getOverlay();
    const scanLine = document.createElement('div');
    scanLine.className = 'absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_10px_red]';
    scanLine.style.top = `${Math.random() * 100}%`;
    overlay.appendChild(scanLine);

    // Animate removal
    setTimeout(() => scanLine.remove(), 500);
}

function performOverclockEffect() {
    const body = document.body;
    
    // Shake
    if (Math.random() < currentIntensity * 0.5) {
        const x = (Math.random() - 0.5) * currentIntensity * 10;
        const y = (Math.random() - 0.5) * currentIntensity * 10;
        body.style.transform = `translate(${x}px, ${y}px)`;
    } else {
        body.style.transform = 'none';
    }

    // Heat Blur / Color Shift (Simulated via overlay)
    const overlay = getOverlay();
    overlay.classList.remove('hidden');
    
    // Update heat opacity based on intensity
    // We use a radial gradient for heat center
    overlay.style.background = `radial-gradient(circle, transparent 50%, rgba(255, 69, 0, ${currentIntensity * 0.3}))`;
    
    // Occasional "WARNING" flash
    if (currentIntensity > 0.7 && Math.random() < 0.05) {
        const warning = document.createElement('div');
        warning.className = 'absolute inset-0 flex items-center justify-center text-red-500 font-bold text-9xl opacity-20 rotate-[-10deg]';
        warning.textContent = 'HEAT CRITICAL';
        overlay.appendChild(warning);
        setTimeout(() => warning.remove(), 200);
    }
}

function performGlobalGlitch() {
    // List of UI elements to target
    const targets = [
        elements.cashDisplay,
        elements.rentDisplay,
        elements.levelDisplay,
        elements.roundDisplay,
        elements.messageText,
        elements.startBtn,
        elements.nextBtn,
        elements.guessBtn,
        elements.leaveShopBtn,
        elements.appShopBtn,
        elements.browserContinueBtn,
        // Add some static labels if possible, but they are harder to target without IDs
        document.querySelector('h1'), // Main Title in App
    ];

    targets.forEach(el => {
        if (!el || Math.random() > currentIntensity) return;
        
        // Prevent double glitching
        if (el.dataset.isGlitching) return;

        const original = el.textContent;
        if (!original) return;

        el.dataset.isGlitching = "true";
        
        // Create glitched string
        const glitched = original.split('').map(char => {
            if (char === ' ' || char === '\n') return char;
            return Math.random() < currentIntensity ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : char;
        }).join('');

        el.textContent = glitched;
        
        // Visual displacement
        if (currentIntensity > 0.3) {
            el.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            el.style.color = Math.random() > 0.5 ? '#ef4444' : '#22c55e'; // Red or Green
        }

        setTimeout(() => {
            // Restore
            if (el) {
                el.textContent = original;
                el.style.transform = 'none';
                el.style.color = ''; // Reset color
                delete el.dataset.isGlitching;
            }
        }, 50 + Math.random() * 100);
    });
}

function performBotnetEffect() {
    // Theme: Hive Mind, Network Traffic, Green/Cyan aesthetic
    if (Math.random() > currentIntensity) return;

    const overlay = getOverlay();
    
    // 1. Network Packets (moving dots)
    if (Math.random() < 0.3) {
        const packet = document.createElement('div');
        packet.className = 'absolute w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan]';
        
        // Random start position
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        packet.style.left = `${startX}%`;
        packet.style.top = `${startY}%`;
        packet.style.opacity = '0.8';
        packet.style.transition = `all ${1 + Math.random()}s linear`;
        
        overlay.appendChild(packet);

        // Move to random end position
        requestAnimationFrame(() => {
            const endX = Math.random() * 100;
            const endY = Math.random() * 100;
            packet.style.transform = `translate(${endX - startX}vw, ${endY - startY}vh)`;
            packet.style.opacity = '0';
        });

        setTimeout(() => packet.remove(), 2000);
    }

    // 2. Status Text (Terminal logs)
    if (Math.random() < 0.1 * currentIntensity) {
        const log = document.createElement('div');
        log.className = 'absolute text-xs text-cyan-500/70 pointer-events-none';
        log.style.left = `${Math.random() * 80 + 10}%`;
        log.style.top = `${Math.random() * 80 + 10}%`;
        
        const messages = [
            "UPLOADING...", "PACKET_LOSS: 0%", "NODE_SYNC", 
            "HIVE_STATUS: ACTIVE", "PING: 1ms", "TARGET_ACQUIRED",
            "DISTRIBUTING_LOAD", "BYPASSING_FIREWALL"
        ];
        log.textContent = `> ${messages[Math.floor(Math.random() * messages.length)]}`;
        
        overlay.appendChild(log);
        setTimeout(() => log.remove(), 1500);
    }

    // 3. Background Pulse (Subtle)
    if (Math.random() < 0.05) {
        overlay.style.backgroundColor = 'rgba(0, 255, 255, 0.05)';
        setTimeout(() => {
            overlay.style.backgroundColor = 'transparent';
        }, 200);
    }
}

function performRansomwareEffect() {
    // Theme: Encryption, Locks, Red/Warning aesthetic, Glitches
    const overlay = getOverlay();

    // 1. Lock Icons
    if (Math.random() < 0.2 * currentIntensity) {
        const lock = document.createElement('div');
        lock.className = 'absolute text-red-600/40 text-4xl font-bold select-none pointer-events-none';
        lock.textContent = '🔒';
        lock.style.left = `${Math.random() * 90}%`;
        lock.style.top = `${Math.random() * 90}%`;
        lock.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        
        overlay.appendChild(lock);
        setTimeout(() => lock.remove(), 1000);
    }

    // 2. Scary Text
    if (Math.random() < 0.1 * currentIntensity) {
        const msg = document.createElement('div');
        msg.className = 'absolute text-red-500 font-bold bg-black/80 px-2 py-1 border border-red-500';
        msg.style.left = `${Math.random() * 70 + 15}%`;
        msg.style.top = `${Math.random() * 70 + 15}%`;
        msg.style.fontSize = `${Math.random() * 1.5 + 0.8}rem`;
        
        const texts = [
            "YOUR FILES ARE ENCRYPTED", "PAYMENT REQUIRED", "KEY NOT FOUND",
            "ACCESS DENIED", "SYSTEM COMPROMISED", "TIME REMAINING: 00:00:00"
        ];
        msg.textContent = texts[Math.floor(Math.random() * texts.length)];
        
        overlay.appendChild(msg);
        setTimeout(() => msg.remove(), 800);
    }

    // 3. Screen Inversion / Glitch
    if (currentIntensity > 0.5 && Math.random() < 0.02) {
        document.body.style.filter = 'invert(1)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 100 + Math.random() * 200);
    }

    // 4. Reuse Global Glitch
    if (Math.random() < currentIntensity * 0.5) {
        performGlobalGlitch();
    }
}
