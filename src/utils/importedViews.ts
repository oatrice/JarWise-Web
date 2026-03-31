import {
    Briefcase,
    DollarSign,
    FolderOpen,
    Gamepad2,
    GraduationCap,
    Heart,
    Home,
    Landmark,
    PiggyBank,
    Plane,
    Wallet as WalletIcon,
    type LucideIcon,
} from 'lucide-react';
import type { ApiJar, ApiWallet } from '../lib/api';
import type { Transaction } from './transactionStorage';
import type { Jar, Wallet } from './generatedMockData';

type JarTheme = {
    color: string;
    barColor: string;
    shadowColor: string;
    bgGlow: string;
    icon: LucideIcon;
};

const WALLET_THEMES: Array<{ color: string; icon: LucideIcon }> = [
    { color: 'text-blue-500', icon: WalletIcon },
    { color: 'text-green-500', icon: Landmark },
    { color: 'text-purple-500', icon: PiggyBank },
    { color: 'text-cyan-500', icon: FolderOpen },
    { color: 'text-orange-500', icon: Briefcase },
    { color: 'text-pink-500', icon: WalletIcon },
];

const JAR_THEMES: JarTheme[] = [
    {
        color: 'text-blue-400',
        barColor: 'bg-blue-500',
        shadowColor: 'bg-blue-500',
        bgGlow: 'shadow-[0_0_30px_rgba(96,165,250,0.3)]',
        icon: Home,
    },
    {
        color: 'text-green-400',
        barColor: 'bg-green-500',
        shadowColor: 'bg-green-500',
        bgGlow: 'shadow-[0_0_30px_rgba(74,222,128,0.3)]',
        icon: DollarSign,
    },
    {
        color: 'text-pink-400',
        barColor: 'bg-pink-500',
        shadowColor: 'bg-pink-500',
        bgGlow: 'shadow-[0_0_30px_rgba(244,114,182,0.3)]',
        icon: Gamepad2,
    },
    {
        color: 'text-yellow-400',
        barColor: 'bg-yellow-500',
        shadowColor: 'bg-yellow-500',
        bgGlow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
        icon: GraduationCap,
    },
    {
        color: 'text-purple-400',
        barColor: 'bg-purple-500',
        shadowColor: 'bg-purple-500',
        bgGlow: 'shadow-[0_0_30px_rgba(192,132,252,0.3)]',
        icon: Plane,
    },
    {
        color: 'text-red-400',
        barColor: 'bg-red-500',
        shadowColor: 'bg-red-500',
        bgGlow: 'shadow-[0_0_30px_rgba(248,113,113,0.3)]',
        icon: Heart,
    },
    {
        color: 'text-cyan-400',
        barColor: 'bg-cyan-500',
        shadowColor: 'bg-cyan-500',
        bgGlow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
        icon: Briefcase,
    },
    {
        color: 'text-orange-400',
        barColor: 'bg-orange-500',
        shadowColor: 'bg-orange-500',
        bgGlow: 'shadow-[0_0_30px_rgba(251,146,60,0.3)]',
        icon: PiggyBank,
    },
];

export type ManageJarView = Jar & {
    percentage: number;
    children?: ManageJarView[];
};

function addAmount(target: Map<string, number>, walletID: string | undefined, amount: number) {
    if (!walletID) {
        return;
    }

    target.set(walletID, (target.get(walletID) ?? 0) + amount);
}

function calculateWalletFlowByID(transactions: Transaction[]) {
    const walletFlowByID = new Map<string, number>();
    const transactionsByID = new Map(transactions.map((transaction) => [transaction.id, transaction]));
    const processedTransferPairs = new Set<string>();

    for (const transaction of transactions) {
        if (transaction.type === 'transfer') {
            if (transaction.walletId && transaction.toWalletId) {
                addAmount(walletFlowByID, transaction.walletId, -transaction.amount);
                addAmount(walletFlowByID, transaction.toWalletId, transaction.amount);
            }
            continue;
        }

        if (transaction.relatedTransactionId) {
            const pairKey = [transaction.id, transaction.relatedTransactionId].sort().join(':');
            if (processedTransferPairs.has(pairKey)) {
                continue;
            }

            const linkedTransaction = transactionsByID.get(transaction.relatedTransactionId);
            if (linkedTransaction && (transaction.type === 'expense' || transaction.type === 'income')) {
                const expenseTransaction = transaction.type === 'expense' ? transaction : linkedTransaction.type === 'expense' ? linkedTransaction : null;
                const incomeTransaction = transaction.type === 'income' ? transaction : linkedTransaction.type === 'income' ? linkedTransaction : null;

                if (expenseTransaction && incomeTransaction) {
                    addAmount(walletFlowByID, expenseTransaction.walletId, -expenseTransaction.amount);
                    addAmount(walletFlowByID, incomeTransaction.walletId, incomeTransaction.amount);
                    processedTransferPairs.add(pairKey);
                    continue;
                }
            }
        }

        if (transaction.type === 'income') {
            addAmount(walletFlowByID, transaction.walletId, transaction.amount);
        } else if (transaction.type === 'expense') {
            addAmount(walletFlowByID, transaction.walletId, -transaction.amount);
        }
    }

    return walletFlowByID;
}

function calculateJarAmountsByID(transactions: Transaction[]) {
    const jarAmountByID = new Map<string, number>();

    for (const transaction of transactions) {
        if (!transaction.jarId || transaction.jarId === 'transfer') {
            continue;
        }

        if (transaction.type === 'transfer') {
            continue;
        }

        if (transaction.relatedTransactionId) {
            continue;
        }

        jarAmountByID.set(
            transaction.jarId,
            (jarAmountByID.get(transaction.jarId) ?? 0) + transaction.amount,
        );
    }

    return jarAmountByID;
}

function calculateJarLevel(jar: ApiJar, jarsByID: Map<string, ApiJar>) {
    let level = 0;
    let parentID = jar.parent_id;

    while (parentID) {
        const parent = jarsByID.get(parentID);
        if (!parent) {
            break;
        }
        level += 1;
        parentID = parent.parent_id;
    }

    return level;
}

function sortJarsByActivity(jars: Array<ApiJar & { current: number }>) {
    return [...jars].sort((left, right) => {
        if (right.current !== left.current) {
            return right.current - left.current;
        }
        return left.name.localeCompare(right.name);
    });
}

function calculatePercentages(values: number[]) {
    if (values.length === 0) {
        return [];
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    if (total <= 0) {
        const base = Math.floor(100 / values.length);
        const remainder = 100 - (base * values.length);
        return values.map((_, index) => base + (index < remainder ? 1 : 0));
    }

    const exactPercentages = values.map((value) => (value / total) * 100);
    const floored = exactPercentages.map((value) => Math.floor(value));
    let remaining = 100 - floored.reduce((sum, value) => sum + value, 0);

    const sortedFractions = exactPercentages
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((left, right) => right.fraction - left.fraction);

    for (const item of sortedFractions) {
        if (remaining <= 0) {
            break;
        }
        floored[item.index] += 1;
        remaining -= 1;
    }

    return floored;
}

export function deriveWalletViews(wallets: ApiWallet[], transactions: Transaction[]): Wallet[] {
    const walletFlowByID = calculateWalletFlowByID(transactions);

    return wallets.map((wallet, index) => {
        const theme = WALLET_THEMES[index % WALLET_THEMES.length];
        const derivedBalance = walletFlowByID.get(wallet.id) ?? 0;

        return {
            id: wallet.id,
            name: wallet.name,
            balance: wallet.balance !== 0 ? wallet.balance : derivedBalance,
            color: theme.color,
            icon: theme.icon,
            parentId: null,
            level: 0,
        };
    });
}

export function deriveTotalBalance(wallets: Wallet[]) {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
}

export function deriveDashboardJars(jars: ApiJar[], transactions: Transaction[], limit: number): Jar[] {
    const jarAmountByID = calculateJarAmountsByID(transactions);
    const jarsByID = new Map(jars.map((jar) => [jar.id, jar]));

    const enrichedJars = sortJarsByActivity(
        jars.map((jar) => ({
            ...jar,
            current: jarAmountByID.get(jar.id) ?? 0,
        })),
    );

    const selectedJars = enrichedJars.some((jar) => jar.current > 0)
        ? enrichedJars.filter((jar) => jar.current > 0).slice(0, limit)
        : enrichedJars.slice(0, limit);

    const maxCurrent = Math.max(...selectedJars.map((jar) => jar.current), 1);

    return selectedJars.map((jar, index) => {
        const theme = JAR_THEMES[index % JAR_THEMES.length];

        return {
            id: jar.id,
            name: jar.name,
            current: jar.current,
            goal: maxCurrent,
            parentId: jar.parent_id ?? null,
            level: calculateJarLevel(jar, jarsByID),
            color: theme.color,
            bgGlow: theme.bgGlow,
            icon: theme.icon,
            barColor: theme.barColor,
            shadowColor: theme.shadowColor,
        };
    });
}

export function deriveManageJars(jars: ApiJar[], transactions: Transaction[]): ManageJarView[] {
    const jarAmountByID = calculateJarAmountsByID(transactions);
    const jarsByID = new Map(jars.map((jar) => [jar.id, jar]));
    const enrichedJars = sortJarsByActivity(
        jars.map((jar) => ({
            ...jar,
            current: jarAmountByID.get(jar.id) ?? 0,
        })),
    );
    const percentages = calculatePercentages(enrichedJars.map((jar) => jar.current));
    const maxCurrent = Math.max(...enrichedJars.map((jar) => jar.current), 1);

    return enrichedJars.map((jar, index) => {
        const theme = JAR_THEMES[index % JAR_THEMES.length];

        return {
            id: jar.id,
            name: jar.name,
            current: jar.current,
            goal: maxCurrent,
            parentId: jar.parent_id ?? null,
            level: calculateJarLevel(jar, jarsByID),
            color: theme.color,
            bgGlow: theme.bgGlow,
            icon: theme.icon,
            barColor: theme.barColor,
            shadowColor: theme.shadowColor,
            percentage: percentages[index] ?? 0,
            children: [],
        };
    });
}
