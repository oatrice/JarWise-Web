import { Gamepad2, Heart, Home, Plane, Zap, ShoppingBag, Coffee, Smartphone, GraduationCap, DollarSign, type LucideIcon } from 'lucide-react';

export type Jar = {
    id: string;
    name: string;
    current: number;
    goal: number;
    level: number;
    color: string;
    bgGlow: string;
    icon: LucideIcon;
    barColor: string;
    shadowColor: string;
}

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
        name: 'Necessities',
        current: 1250,
        goal: 2000,
        level: 5,
        color: 'text-blue-400',
        bgGlow: 'shadow-[0_0_30px_rgba(96,165,250,0.3)]',
        icon: Home,
        barColor: 'bg-blue-500',
        shadowColor: 'bg-blue-500'
    },
    {
        id: '2',
        name: 'Play',
        current: 350,
        goal: 500,
        level: 3,
        color: 'text-pink-400',
        bgGlow: 'shadow-[0_0_30px_rgba(244,114,182,0.3)]',
        icon: Gamepad2,
        barColor: 'bg-pink-500',
        shadowColor: 'bg-pink-500'
    },
    {
        id: '3',
        name: 'Education',
        current: 800,
        goal: 1500,
        level: 4,
        color: 'text-purple-400',
        bgGlow: 'shadow-[0_0_30px_rgba(192,132,252,0.3)]',
        icon: GraduationCap,
        barColor: 'bg-purple-500',
        shadowColor: 'bg-purple-500'
    },
    {
        id: '4',
        name: 'Long Term',
        current: 5000,
        goal: 10000,
        level: 8,
        color: 'text-green-400',
        bgGlow: 'shadow-[0_0_30px_rgba(74,222,128,0.3)]',
        icon: Plane,
        barColor: 'bg-green-500',
        shadowColor: 'bg-green-500'
    },
    {
        id: '5',
        name: 'Freedom',
        current: 2500,
        goal: 10000,
        level: 6,
        color: 'text-yellow-400',
        bgGlow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
        icon: DollarSign,
        barColor: 'bg-yellow-500',
        shadowColor: 'bg-yellow-500'
    },
    {
        id: '6',
        name: 'Give',
        current: 100,
        goal: 500,
        level: 1,
        color: 'text-red-400',
        bgGlow: 'shadow-[0_0_30px_rgba(248,113,113,0.3)]',
        icon: Heart,
        barColor: 'bg-red-500',
        shadowColor: 'bg-red-500'
    },
];

export const transactions: Transaction[] = [
    {
        id: '1',
        merchant: 'Spotify Premium',
        amount: 12.99,
        category: 'Play',
        date: 'Today, 2:30 PM',
        isTaxDeductible: false,
        color: 'bg-green-500/10 text-green-400',
        icon: Zap
    },
    {
        id: '2',
        merchant: 'Whole Foods Market',
        amount: 86.42,
        category: 'Necessities',
        date: 'Yesterday, 6:15 PM',
        isTaxDeductible: true,
        color: 'bg-blue-500/10 text-blue-400',
        icon: ShoppingBag
    },
    {
        id: '3',
        merchant: 'Starbucks Coffee',
        amount: 6.50,
        category: 'Play',
        date: 'Yesterday, 8:00 AM',
        isTaxDeductible: false,
        color: 'bg-pink-500/10 text-pink-400',
        icon: Coffee
    },
    {
        id: '4',
        merchant: 'Apple Store',
        amount: 999.00,
        category: 'Necessities',
        date: '3 days ago',
        isTaxDeductible: true,
        color: 'bg-gray-500/10 text-gray-400',
        icon: Smartphone
    },
];
