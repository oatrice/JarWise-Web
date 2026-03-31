export type WalletDetails = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export type JarDetails = {
    id: string;
    name: string;
    color: string;
    icon: string;
};

const DEFAULT_WALLETS: WalletDetails[] = [
    { id: 'wallet-1', name: 'Cash', icon: '💵', color: 'bg-green-500' },
    { id: 'wallet-2', name: 'Bank Account', icon: '🏦', color: 'bg-blue-500' },
    { id: 'wallet-3', name: 'Credit Card', icon: '💳', color: 'bg-purple-500' },
];

const DEFAULT_JARS: JarDetails[] = [
    { id: 'necessities', name: 'Necessities', color: 'bg-blue-500', icon: '🏠' },
    { id: 'education', name: 'Education', color: 'bg-green-500', icon: '📚' },
    { id: 'savings', name: 'Savings', color: 'bg-yellow-500', icon: '🐷' },
    { id: 'play', name: 'Play', color: 'bg-pink-500', icon: '🎮' },
    { id: 'investment', name: 'Investment', color: 'bg-purple-500', icon: '📈' },
    { id: 'give', name: 'Give', color: 'bg-red-500', icon: '🎁' },
];

export const WALLETS: WalletDetails[] = [...DEFAULT_WALLETS];
export const JARS: JarDetails[] = [...DEFAULT_JARS];
const WALLET_LOOKUP = new Map<string, WalletDetails>(WALLETS.map((wallet) => [wallet.id, wallet]));
const JAR_LOOKUP = new Map<string, JarDetails>(JARS.map((jar) => [jar.id, jar]));

function syncWalletLookup() {
    WALLET_LOOKUP.clear();
    WALLETS.forEach((wallet) => {
        WALLET_LOOKUP.set(wallet.id, wallet);
    });
}

function syncJarLookup() {
    JAR_LOOKUP.clear();
    JARS.forEach((jar) => {
        JAR_LOOKUP.set(jar.id, jar);
    });
}

export function setWalletCatalog(wallets: WalletDetails[]): void {
    WALLETS.splice(0, WALLETS.length, ...(wallets.length ? wallets : DEFAULT_WALLETS));
    syncWalletLookup();
}

export function setJarCatalog(jars: JarDetails[]): void {
    JARS.splice(0, JARS.length, ...(jars.length ? jars : DEFAULT_JARS));
    syncJarLookup();
}

export function resetCatalogs(): void {
    setWalletCatalog(DEFAULT_WALLETS);
    setJarCatalog(DEFAULT_JARS);
}

export const getJarDetails = (id?: string | null) => {
    if (!id) {
        return { id: 'unknown-jar', name: 'Uncategorized', color: 'bg-gray-500', icon: '🧾' };
    }
    return JAR_LOOKUP.get(id) || { id, name: 'Unknown Jar', color: 'bg-gray-500', icon: '🧾' };
};

export const getWalletDetails = (id?: string | null) => {
    if (!id) {
        return { id: 'unknown-wallet', name: 'Unknown Wallet', icon: '❓', color: 'bg-gray-500' };
    }
    return WALLET_LOOKUP.get(id) || { id, name: 'Unknown Wallet', icon: '❓', color: 'bg-gray-500' };
};
