// WARNING: This file is auto-generated. Do not edit directly.
import { Home, DollarSign, Gamepad2, GraduationCap, Plane, Heart, Headphones, ShoppingBag, type LucideIcon } from 'lucide-react';

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
};

export type Transaction = {
    id: string;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    isTaxDeductible: boolean;
    color: string;
    icon: LucideIcon;
};

export const jars: Jar[] = [
    {
        "id": "1",
        "name": "Necessities",
        "current": 2450.5,
        "goal": 4000,
        "level": 4,
        "color": "text-blue-400",
        "bgGlow": "bg-blue-500/10",
        "icon": Home,
        "barColor": "bg-blue-500",
        "shadowColor": "shadow-blue-500/20"
    },
    {
        "id": "2",
        "name": "Financial Freedom",
        "current": 12000,
        "goal": 100000,
        "level": 12,
        "color": "text-green-400",
        "bgGlow": "bg-green-500/10",
        "icon": DollarSign,
        "barColor": "bg-green-500",
        "shadowColor": "shadow-green-500/20"
    },
    {
        "id": "3",
        "name": "Play",
        "current": 850,
        "goal": 1000,
        "level": 2,
        "color": "text-pink-400",
        "bgGlow": "bg-pink-500/10",
        "icon": Gamepad2,
        "barColor": "bg-pink-500",
        "shadowColor": "shadow-pink-500/20"
    },
    {
        "id": "4",
        "name": "Education",
        "current": 150,
        "goal": 500,
        "level": 1,
        "color": "text-yellow-400",
        "bgGlow": "bg-yellow-500/10",
        "icon": GraduationCap,
        "barColor": "bg-yellow-500",
        "shadowColor": "shadow-yellow-500/20"
    },
    {
        "id": "5",
        "name": "Long-term Savings",
        "current": 3200,
        "goal": 5000,
        "level": 5,
        "color": "text-purple-400",
        "bgGlow": "bg-purple-500/10",
        "icon": Plane,
        "barColor": "bg-purple-500",
        "shadowColor": "shadow-purple-500/20"
    },
    {
        "id": "6",
        "name": "Give",
        "current": 120,
        "goal": 200,
        "level": 1,
        "color": "text-red-400",
        "bgGlow": "bg-red-500/10",
        "icon": Heart,
        "barColor": "bg-red-500",
        "shadowColor": "shadow-red-500/20"
    }
];

export const transactions: Transaction[] = [
    {
        "id": "1",
        "merchant": "Spotify Premium",
        "amount": -12.99,
        "category": "Play",
        "date": "Today, 10:43 AM",
        "isTaxDeductible": false,
        "color": "text-green-400",
        "icon": Headphones
    },
    {
        "id": "2",
        "merchant": "Whole Foods Market",
        "amount": -142.5,
        "category": "Necessities",
        "date": "Yesterday, 6:30 PM",
        "isTaxDeductible": false,
        "color": "text-blue-400",
        "icon": ShoppingBag
    },
    {
        "id": "3",
        "merchant": "Udemy Course",
        "amount": -24.99,
        "category": "Education",
        "date": "Dec 28, 2025",
        "isTaxDeductible": true,
        "color": "text-yellow-400",
        "icon": GraduationCap
    }
];
