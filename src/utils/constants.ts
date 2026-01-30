// Wallet Types
export const WALLETS = [
    { id: 'wallet-1', name: 'Cash', icon: '💵', color: 'bg-green-500' },
    { id: 'wallet-2', name: 'Bank Account', icon: '🏦', color: 'bg-blue-500' },
    { id: 'wallet-3', name: 'Credit Card', icon: '💳', color: 'bg-purple-500' },
] as const;

export const JARS = [
    { id: 'necessities', name: 'Necessities', color: 'bg-blue-500', icon: '🏠' },
    { id: 'education', name: 'Education', color: 'bg-green-500', icon: '📚' },
    { id: 'savings', name: 'Savings', color: 'bg-yellow-500', icon: '🐷' },
    { id: 'play', name: 'Play', color: 'bg-pink-500', icon: '🎮' },
    { id: 'investment', name: 'Investment', color: 'bg-purple-500', icon: '📈' },
    { id: 'give', name: 'Give', color: 'bg-red-500', icon: '🎁' },
] as const;

export const getJarDetails = (id: string) => {
    return JARS.find(j => j.id === id) || JARS[0];
};
