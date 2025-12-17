import { elements } from '../../dom.js';

export function renderSystemMonitor(game) {
    const tempDisplay = document.getElementById('system-temp-display');
    const statusMsg = document.getElementById('system-status-msg');
    const calibrateBtn = document.getElementById('system-calibrate-btn');
    const systemScreen = document.getElementById('system-screen');

    // Overheat Effects
    if (systemScreen) {
        if (game.systemOverheatLevel > 80) {
            systemScreen.classList.add('animate-pulse');
        } else {
            systemScreen.classList.remove('animate-pulse');
        }
    }

    if (tempDisplay) {
        tempDisplay.textContent = `${Math.floor(game.systemOverheatLevel)}%`;
        if (game.systemOverheatLevel >= 80) {
            tempDisplay.classList.remove('text-orange-300');
            tempDisplay.classList.add('text-red-500', 'animate-pulse');
        } else {
            tempDisplay.classList.add('text-orange-300');
            tempDisplay.classList.remove('text-red-500', 'animate-pulse');
        }
    }

    let allAligned = true;

    game.systemSliders.forEach((val, i) => {
        const target = game.systemTargets[i];
        const sliderFill = document.getElementById(`slider-fill-${i}`);
        const sliderTarget = document.getElementById(`slider-target-${i}`);
        const sliderValue = document.getElementById(`slider-value-${i}`);
        const sliderContainer = document.getElementById(`slider-container-${i}`);

        if (sliderFill) sliderFill.style.height = `${val}%`;
        if (sliderTarget) sliderTarget.style.bottom = `${target}%`;
        if (sliderValue) sliderValue.textContent = Math.floor(val);

        // Check alignment (tolerance +/- 5)
        const diff = Math.abs(val - target);
        const isAligned = diff <= 5;

        if (!isAligned) allAligned = false;

        if (sliderFill) {
            if (isAligned) {
                sliderFill.classList.remove('bg-orange-500');
                sliderFill.classList.add('bg-green-500');
            } else {
                sliderFill.classList.add('bg-orange-500');
                sliderFill.classList.remove('bg-green-500');
            }
        }

        if (sliderValue) {
            if (isAligned) {
                sliderValue.classList.remove('text-orange-500');
                sliderValue.classList.add('text-green-500');
            } else {
                sliderValue.classList.add('text-orange-500');
                sliderValue.classList.remove('text-green-500');
            }
        }

        // Locked State Visuals
        if (game.systemCalibratedThisRound) {
            if (sliderContainer) sliderContainer.classList.add('opacity-50', 'cursor-not-allowed');
            if (sliderValue) sliderValue.classList.add('opacity-50');
        } else {
            if (sliderContainer) sliderContainer.classList.remove('opacity-50', 'cursor-not-allowed');
            if (sliderValue) sliderValue.classList.remove('opacity-50');
        }
    });

    if (statusMsg) {
        if (game.systemCalibratedThisRound) {
            statusMsg.textContent = "SYSTEM OPTIMIZED - STANDBY";
            statusMsg.classList.remove('text-orange-400', 'text-red-500');
            statusMsg.classList.add('text-green-400');
        } else if (game.systemOverheatLevel > 70 && Math.random() > 0.7) {
            // Glitch text
            const chars = "SYSTEM ERROR WARNING FAILURE 010101";
            statusMsg.textContent = chars.split('').sort(() => 0.5 - Math.random()).join('').substring(0, 20);
            statusMsg.classList.add('text-red-500');
        } else if (allAligned) {
            statusMsg.textContent = "SYSTEM STABLE - READY TO CALIBRATE";
            statusMsg.classList.remove('text-orange-400');
            statusMsg.classList.add('text-green-400');
        } else {
            statusMsg.textContent = "CALIBRATION REQUIRED";
            statusMsg.classList.add('text-orange-400');
            statusMsg.classList.remove('text-green-400');
        }
    }

    if (calibrateBtn) {
        if (game.systemCalibratedThisRound) {
            calibrateBtn.disabled = true;
            calibrateBtn.textContent = "OPTIMIZED";
            calibrateBtn.classList.remove('hover:bg-orange-500', 'hover:text-black', 'animate-pulse');
            calibrateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            calibrateBtn.disabled = !allAligned;
            calibrateBtn.textContent = "CONFIRM CALIBRATION";
            calibrateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            calibrateBtn.classList.add('hover:bg-orange-500', 'hover:text-black');

            if (allAligned) {
                calibrateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                calibrateBtn.classList.add('animate-pulse');
            } else {
                calibrateBtn.classList.add('opacity-50', 'cursor-not-allowed');
                calibrateBtn.classList.remove('animate-pulse');
            }
        }
    }
}

export function setupSystemSliders(game) {
    [0, 1, 2].forEach(index => {
        const container = document.getElementById(`slider-container-${index}`);
        if (!container) return;

        const updateFromEvent = (e) => {
            const rect = container.getBoundingClientRect();
            // Calculate percentage from bottom
            let y = e.clientY;
            let percentage = ((rect.bottom - y) / rect.height) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            game.systemSliders[index] = percentage;
            renderSystemMonitor(game);
        };

        container.addEventListener('pointerdown', (e) => {
            if (game.gameState !== 'SYSTEM_MONITOR') return;
            if (game.systemCalibratedThisRound) return; // Prevent interaction if already calibrated
            container.setPointerCapture(e.pointerId);
            updateFromEvent(e);

            container.onpointermove = (e) => {
                updateFromEvent(e);
            };

            container.onpointerup = (e) => {
                container.onpointermove = null;
                container.onpointerup = null;
                container.releasePointerCapture(e.pointerId);
            };
        });
    });
}
