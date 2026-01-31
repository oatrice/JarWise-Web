// WARNING: This file is auto-generated. Do not edit directly.
// Generated at: 2026-01-31T11:08:58.480Z
import { Home, DollarSign, Gamepad2, GraduationCap, Plane, Heart, Headphones, ShoppingBag, type LucideIcon } from 'lucide-react';

export type Allocation = {
    id: string;
    name: string;
    current: number;
    goal: number;
    level: number;
    parentId: string | null;
    color: string;
    bgGlow: string;
    icon: LucideIcon;
    barColor: string;
    shadowColor: string;
}

// Backward compatibility alias
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

export const jars: Allocation[] = [
    {
        id: '1',
        name: 'Necessities',
        current: 2450.5,
        goal: 4000,
        parentId: null,
        level: 0, 
        color: 'text-blue-400',
        bgGlow: 'shadow-[0_0_30px_rgba(96,165,250,0.3)]',
        icon: Home,
        barColor: 'bg-blue-500',
        shadowColor: 'bg-blue-500'
    },
    {
        id: '2',
        name: 'Financial Freedom',
        current: 12000,
        goal: 100000,
        parentId: null,
        level: 0, 
        color: 'text-green-400',
        bgGlow: 'shadow-[0_0_30px_rgba(74,222,128,0.3)]',
        icon: DollarSign,
        barColor: 'bg-green-500',
        shadowColor: 'bg-green-500'
    },
    {
        id: '3',
        name: 'Play',
        current: 850,
        goal: 1000,
        parentId: null,
        level: 0, 
        color: 'text-pink-400',
        bgGlow: 'shadow-[0_0_30px_rgba(244,114,182,0.3)]',
        icon: Gamepad2,
        barColor: 'bg-pink-500',
        shadowColor: 'bg-pink-500'
    },
    {
        id: '4',
        name: 'Education',
        current: 150,
        goal: 500,
        parentId: null,
        level: 0, 
        color: 'text-yellow-400',
        bgGlow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
        icon: GraduationCap,
        barColor: 'bg-yellow-500',
        shadowColor: 'bg-yellow-500'
    },
    {
        id: '5',
        name: 'Long-term Savings',
        current: 3200,
        goal: 5000,
        parentId: null,
        level: 0, 
        color: 'text-purple-400',
        bgGlow: 'shadow-[0_0_30px_rgba(192,132,252,0.3)]',
        icon: Plane,
        barColor: 'bg-purple-500',
        shadowColor: 'bg-purple-500'
    },
    {
        id: '6',
        name: 'Give',
        current: 120,
        goal: 200,
        parentId: null,
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
