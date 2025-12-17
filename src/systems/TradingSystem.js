import stockDataRaw from '../assets/stock_prices.csv?raw';

export class TradingSystem {
    constructor(game) {
        this.game = game;
        this.data = this.parseStockData(stockDataRaw);
        this.dataIndex = Math.floor(Math.random() * this.data.length);
    }

    parseStockData(csv) {
        const lines = csv.trim().split('\n');
        const candles = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 5) {
                const open = parseFloat(cols[1]);
                const high = parseFloat(cols[2]);
                const low = parseFloat(cols[3]);
                const close = parseFloat(cols[4]);
                if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
                    candles.push({ open, high, low, close });
                }
            }
        }
        return candles;
    }

    getPrice() {
        return this.game.currentTradingPrice;
    }

    addCandle() {
        if (this.data && this.data.length > 0) {
            const candle = this.data[this.dataIndex];
            this.game.currentTradingPrice = candle.close;
            this.game.tradingCandles.push(candle);

            this.dataIndex = (this.dataIndex + 1) % this.data.length;
        } else {
            // Fallback if no data
            const t = Date.now();
            const base = 100;
            const amp = 25;
            const speed = 3000;
            const noise = (Math.random() - 0.5) * 2;
            const newPrice = Math.max(1, base + amp * Math.sin(t / speed) + noise);

            const open = this.game.currentTradingPrice;
            const close = newPrice;
            const high = Math.max(open, close) + Math.random() * 3;
            const low = Math.min(open, close) - Math.random() * 3;

            this.game.currentTradingPrice = close;
            this.game.tradingCandles.push({ open, high, low, close });
        }

        if (this.game.tradingCandles.length > 50) this.game.tradingCandles.shift();
    }

    buy(amount) {
        if (this.game.hasTradedThisRound) return { success: false, reason: 'limit_reached' };
        const price = this.getPrice();
        const spend = Math.min(amount, this.game.cash);
        if (spend <= 0) return { success: false, reason: 'limit' };

        const shares = spend / price;
        this.game.cash -= spend;
        this.game.tradingHoldings += shares;
        this.game.tradingInvested += spend;
        this.game.hasTradedThisRound = true;
        return { success: true, shares, price, spent: spend };
    }

    sell(amount) {
        if (this.game.hasTradedThisRound) return { success: false, reason: 'limit_reached' };
        const price = this.getPrice();
        const sharesToSell = amount > 0 ? Math.min(this.game.tradingHoldings, amount / price) : this.game.tradingHoldings;
        if (sharesToSell <= 0) return { success: false, reason: 'no_holdings' };

        // Calculate proportion of investment sold
        const proportion = sharesToSell / this.game.tradingHoldings;
        this.game.tradingInvested -= this.game.tradingInvested * proportion;

        const proceeds = sharesToSell * price;
        this.game.tradingHoldings -= sharesToSell;
        this.game.cash += Math.floor(proceeds);

        // Clean up small floating point errors
        if (this.game.tradingHoldings < 0.0001) {
            this.game.tradingHoldings = 0;
            this.game.tradingInvested = 0;
        }

        this.game.hasTradedThisRound = true;
        return { success: true, shares: sharesToSell, price, gained: proceeds };
    }
}
