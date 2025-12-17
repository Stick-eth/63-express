
export const createJoker = (data) => ({
    type: 'passive',
    rarity: 'common',
    trigger: 'none',
    icon: '🃏', // Default icon
    maxQuantity: Infinity, // Default to unlimited
    ...data
});

export const createScript = (data) => ({
    type: 'consumable',
    icon: '📜', // Default icon
    ...data
});
