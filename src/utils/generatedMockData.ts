// WARNING: This file is auto-generated. Do not edit directly.
// Generated at: 2026-01-18T06:16:41.637Z
import { Home, DollarSign, Gamepad2, GraduationCap, Plane, Heart, Headphones, ShoppingBag, type LucideIcon } from 'lucide-react';

export type Allocation = {
    id: string;
    userId: string;       // 🔒 Added for security
    name: string;
    parentId: string | null;
    level: number;        // 0=Jar, 1=Category
    current: number;
    goal: number;
    color: string;
    bgGlow: string;
    icon: LucideIcon;
    barColor: string;
    shadowColor: string;
}

// Alias for backward compatibility during migration
export type Jar = Allocation;

export type Transaction = {
    id: string;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    isTaxDeductible: boolean;
    color: string;
    icon: LucideIcon;
}

export const jars: Jar[] = [
    {
        id: '1',
        userId: 'user_1',
        name: 'Necessities',
        parentId: null,
        current: 2450.5,
        goal: 4000,
        level: 0,
        color: 'text-blue-400',
        bgGlow: 'shadow-[0_0_30px_rgba(96,165,250,0.3)]',
        icon: Home,
        barColor: 'bg-blue-500',
        shadowColor: 'bg-blue-500'
    },
    {
        id: '2',
        userId: 'user_1',
        name: 'Financial Freedom',
        parentId: null,
        current: 12000,
        goal: 100000,
        level: 0,
        color: 'text-green-400',
        bgGlow: 'shadow-[0_0_30px_rgba(74,222,128,0.3)]',
        icon: DollarSign,
        barColor: 'bg-green-500',
        shadowColor: 'bg-green-500'
    },
    {
        id: '3',
        userId: 'user_1',
        name: 'Play',
        parentId: null,
        current: 850,
        goal: 1000,
        level: 0,
        color: 'text-pink-400',
        bgGlow: 'shadow-[0_0_30px_rgba(244,114,182,0.3)]',
        icon: Gamepad2,
        barColor: 'bg-pink-500',
        shadowColor: 'bg-pink-500'
    },
    {
        id: '4',
        userId: 'user_1',
        name: 'Education',
        parentId: null,
        current: 150,
        goal: 500,
        level: 0,
        color: 'text-yellow-400',
        bgGlow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
        icon: GraduationCap,
        barColor: 'bg-yellow-500',
        shadowColor: 'bg-yellow-500'
    },
    {
        id: '5',
        userId: 'user_1',
        name: 'Long-term Savings',
        parentId: null,
        current: 3200,
        goal: 5000,
        level: 0,
        color: 'text-purple-400',
        bgGlow: 'shadow-[0_0_30px_rgba(192,132,252,0.3)]',
        icon: Plane,
        barColor: 'bg-purple-500',
        shadowColor: 'bg-purple-500'
    },
    {
        id: '6',
        userId: 'user_1',
        name: 'Give',
        parentId: null,
        current: 120,
        goal: 200,
        level: 0,
        color: 'text-red-400',
        bgGlow: 'shadow-[0_0_30px_rgba(248,113,113,0.3)]',
        icon: Heart,
        barColor: 'bg-red-500',
        shadowColor: 'bg-red-500'
    }
];

export const transactions: Transaction[] = [
    {
        id: '1',
        merchant: 'Spotify Premium',
        amount: -12.99,
        category: 'Play',
        date: 'Today, 10:43 AM',
        isTaxDeductible: false,
        color: 'text-green-400',
        icon: Headphones
    },
    {
        id: '2',
        merchant: 'Whole Foods Market',
        amount: -142.5,
        category: 'Necessities',
        date: 'Yesterday, 6:30 PM',
        isTaxDeductible: false,
        color: 'text-blue-400',
        icon: ShoppingBag
    },
    {
        id: '3',
        merchant: 'Udemy Course',
        amount: -24.99,
        category: 'Education',
        date: 'Dec 28, 2025',
        isTaxDeductible: true,
        color: 'text-yellow-400',
        icon: GraduationCap
    }
];
