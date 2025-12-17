import { elements } from '../../dom.js';

export function renderTrading(game) {
    if (!elements.tradingScreen) return;
    const price = game.getTradingPrice();
    if (elements.tradingPrice) elements.tradingPrice.textContent = `$${price.toFixed(2)}`;
    const value = game.tradingHoldings * price;
    if (elements.tradingHoldings) elements.tradingHoldings.textContent = game.tradingHoldings.toFixed(3);
    if (elements.tradingHoldingsValue) elements.tradingHoldingsValue.textContent = `$${value.toFixed(2)}`;

    if (elements.tradingProfitPercent) {
        if (game.tradingInvested > 0 && game.tradingHoldings > 0) {
            const profit = value - game.tradingInvested;
            const percent = (profit / game.tradingInvested) * 100;
            const sign = percent >= 0 ? '+' : '';
            elements.tradingProfitPercent.textContent = `(${sign}${percent.toFixed(1)}%)`;

            elements.tradingProfitPercent.className = `text-xs font-bold ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`;
        } else {
            elements.tradingProfitPercent.textContent = '(0%)';
            elements.tradingProfitPercent.className = 'text-xs font-bold text-gray-500';
        }
    }

    if (elements.tradingCash) elements.tradingCash.textContent = `$${game.cash.toFixed(2)}`;

    // Disable buttons if limit reached
    const buyBtn = document.getElementById('trading-buy-btn');
    const sellBtn = document.getElementById('trading-sell-btn');
    if (buyBtn && sellBtn) {
        if (game.hasTradedThisRound) {
            buyBtn.disabled = true;
            sellBtn.disabled = true;
            buyBtn.classList.add('opacity-50', 'cursor-not-allowed');
            sellBtn.classList.add('opacity-50', 'cursor-not-allowed');
            buyBtn.title = "Limit reached for this round";
            sellBtn.title = "Limit reached for this round";
        } else {
            buyBtn.disabled = false;
            sellBtn.disabled = false;
            buyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            sellBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            buyBtn.title = "";
            sellBtn.title = "";
        }
    }

    if (elements.tradingChart) {
        const chart = elements.tradingChart;
        chart.innerHTML = '';
        if (game.tradingCandles.length === 0) {
            game.addTradingCandle();
        }

        const candles = game.tradingCandles;
        if (candles.length === 0) return;
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        const max = Math.max(...highs);
        const min = Math.min(...lows);
        const range = Math.max(1, max - min);

        const chartWidth = chart.clientWidth || 320;
        const chartHeight = chart.clientHeight || 256;
        const pad = 8;
        const areaH = Math.max(10, chartHeight - pad * 2);
        const candleWidth = Math.max(4, Math.min(18, Math.floor((chartWidth - pad * 2) / Math.max(1, candles.length))));
        const totalWidth = candleWidth * candles.length;
        const startX = Math.max(pad, chartWidth - totalWidth - pad);

        const scale = (v) => ((v - min) / range) * areaH;

        candles.forEach((c, idx) => {
            const bar = document.createElement('div');
            bar.className = 'absolute';
            if (idx === candles.length - 1) {
                bar.classList.add('candle-new');
            }
            const x = startX + idx * candleWidth;

            const highY = pad + areaH - scale(c.high);
            const lowY = pad + areaH - scale(c.low);
            const topBody = pad + areaH - scale(Math.max(c.open, c.close));
            const bottomBody = pad + areaH - scale(Math.min(c.open, c.close));

            const wick = document.createElement('div');
            wick.className = 'bg-cyan-600';
            wick.style.position = 'absolute';
            wick.style.left = `${Math.floor(candleWidth / 2)}px`;
            wick.style.top = `${highY}px`;
            wick.style.width = '2px';
            wick.style.height = `${Math.max(2, lowY - highY)}px`;

            const bullish = c.close >= c.open;
            const body = document.createElement('div');
            body.className = bullish ? 'bg-green-500' : 'bg-red-500';
            body.style.position = 'absolute';
            body.style.left = '0px';
            body.style.top = `${topBody}px`;
            body.style.width = `${Math.max(3, candleWidth - 2)}px`;
            body.style.height = `${Math.max(3, bottomBody - topBody)}px`;

            bar.style.left = `${x}px`;
            bar.style.width = `${candleWidth}px`;
            bar.style.height = `${chartHeight}px`;

            bar.appendChild(wick);
            bar.appendChild(body);
            chart.appendChild(bar);
        });
    }
}
