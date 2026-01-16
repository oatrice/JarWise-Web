export const JARS = [
    { id: 'necessities', name: 'Necessities', color: 'bg-blue-500', icon: '🏠' },
    { id: 'financial-freedom', name: 'Financial Freedom', color: 'bg-green-500', icon: '💰' },
    { id: 'play', name: 'Play', color: 'bg-pink-500', icon: '🎮' },
    { id: 'education', name: 'Education', color: 'bg-yellow-500', icon: '📚' },
    { id: 'long-term', name: 'Long-term Savings', color: 'bg-purple-500', icon: '📈' },
    { id: 'give', name: 'Give', color: 'bg-red-500', icon: '🎁' },
] as const;

export const getJarDetails = (id: string) => {
    return JARS.find(j => j.id === id) || JARS[0];
};
