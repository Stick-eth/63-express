import { JOKERS, SCRIPTS } from '../items.js';

export class ShopSystem {
    constructor(game) {
        this.game = game;
    }

    generate() {
        this.game.shopInventory = [];
        this.game.rerollCost = 5;

        // Filter available jokers (check maxQuantity)
        let availableJokers = JOKERS.filter(j => {
            const owned = this.game.jokers.find(oj => oj.id === j.id);
            if (!owned) return true;
            return owned.quantity < (j.maxQuantity || Infinity);
        });

        // Shuffle available jokers
        availableJokers.sort(() => Math.random() - 0.5);

        // Take up to 3 unique jokers
        const jokersToSpawn = availableJokers.slice(0, 3);

        jokersToSpawn.forEach(joker => {
            let price = joker.price;
            price = this.game.triggerJokers('calculateShopPrice', price);
            this.game.shopInventory.push({ ...joker, price, uniqueId: Math.random() });
        });

        // Add 2 random Scripts (Unique in this shop batch)
        const availableScripts = [...SCRIPTS];
        availableScripts.sort(() => Math.random() - 0.5);
        const scriptsToSpawn = availableScripts.slice(0, 2);

        scriptsToSpawn.forEach(script => {
            let price = script.price;
            price = this.game.triggerJokers('calculateShopPrice', price);
            this.game.shopInventory.push({ ...script, price, uniqueId: Math.random() });
        });
    }

    reroll() {
        if (this.game.cash >= this.game.rerollCost) {
            this.game.cash -= this.game.rerollCost;
            const nextCost = this.game.rerollCost + 5;
            this.generate();
            this.game.rerollCost = nextCost;
            return true;
        }
        return false;
    }

    buyItem(uniqueId) {
        const itemIndex = this.game.shopInventory.findIndex(i => i.uniqueId === uniqueId);
        if (itemIndex === -1) return false;

        const item = this.game.shopInventory[itemIndex];

        if (this.game.cash >= item.price) {
            if (item.type === 'passive') {
                const existingJoker = this.game.jokers.find(j => j.id === item.id);
                if (existingJoker) {
                    if (existingJoker.quantity < (existingJoker.maxQuantity || Infinity)) {
                        this.game.cash -= item.price;
                        existingJoker.quantity++;
                        this.game.shopInventory.splice(itemIndex, 1);
                        this.game.triggerJokers('onBuy', item);
                        return true;
                    }
                } else {
                    const maxSlots = this.game.triggerJokers('getMaxJokerSlots', 10);
                    if (this.game.jokers.length < maxSlots) {
                        this.game.cash -= item.price;
                        this.game.jokers.push({ ...item, quantity: 1 });
                        this.game.shopInventory.splice(itemIndex, 1);
                        this.game.triggerJokers('onBuy', item);
                        return true;
                    }
                }
            } else if (item.type === 'consumable') {
                if (this.game.scripts.length < 3) {
                    this.game.cash -= item.price;
                    this.game.scripts.push(item);
                    this.game.shopInventory.splice(itemIndex, 1);
                    this.game.triggerJokers('onBuy', item);
                    return true;
                }
            }
        }
        return false;
    }

    sellItem(type, index) {
        if (type === 'joker') {
            if (index >= 0 && index < this.game.jokers.length) {
                const joker = this.game.jokers[index];
                const sellPrice = Math.floor(joker.price * 0.5);
                this.game.cash += sellPrice;
                this.game.jokers.splice(index, 1);
                this.game.log(`Sold ${joker.name} for $${sellPrice}`);
                return true;
            }
        } else if (type === 'script') {
            if (index >= 0 && index < this.game.scripts.length) {
                const script = this.game.scripts[index];
                const sellPrice = Math.floor(script.price * 0.5);
                this.game.cash += sellPrice;
                this.game.scripts.splice(index, 1);
                this.game.log(`Sold ${script.name} for $${sellPrice}`);
                return true;
            }
        }
        return false;
    }
}
