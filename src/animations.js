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

// --- GLOBAL INTERFACE GLITCH ---

let glitchInterval = null;
let currentIntensity = 0;
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

export function updateGlitchEffect(game) {
    // Calculate intensity based on Level 2 progression
    let intensity = 0;
    if (game.level >= 2) {
        if (game.round === 1) intensity = 0.05;      // Light flickering
        else if (game.round === 2) intensity = 0.2;  // Moderate bugs
        else intensity = 0.6;                        // Severe corruption (Boss)
    }

    currentIntensity = intensity;

    if (intensity === 0) {
        if (glitchInterval) {
            clearInterval(glitchInterval);
            glitchInterval = null;
        }
        return;
    }

    if (!glitchInterval) {
        glitchInterval = setInterval(performGlobalGlitch, 150);
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
