import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import BottomNav from '../components/BottomNav';

// Mock chart data (จำลอง response จาก GET /api/v1/charts)
const MOCK_CHART_DATA = {
    summary: { income: 45000, expense: 28500, net: 16500 },
    trend: [
        { date: '2025-09', income: 42000, expense: 31000 },
        { date: '2025-10', income: 38000, expense: 27000 },
        { date: '2025-11', income: 41000, expense: 29500 },
        { date: '2025-12', income: 44000, expense: 32000 },
        { date: '2026-01', income: 45000, expense: 28500 },
    ],
    by_jar: [
        { id: 'food', name: 'อาหาร', amount: 9500 },
        { id: 'transport', name: 'เดินทาง', amount: 5200 },
        { id: 'shopping', name: 'ช้อปปิ้ง', amount: 4800 },
        { id: 'bills', name: 'ค่าบิล', amount: 4000 },
        { id: 'health', name: 'สุขภาพ', amount: 2500 },
        { id: 'other', name: 'อื่นๆ', amount: 2500 },
    ],
    comparison: {
        current: { income: 45000, expense: 28500, net: 16500 },
        previous: { income: 44000, expense: 32000, net: 12000 },
    },
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#93c5fd'];

type DateRange = 'month' | 'quarter' | 'year';

interface ReportsPageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
}

export default function ReportsPage({ onBack, onNavigate }: ReportsPageProps) {
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const data = MOCK_CHART_DATA;

    const formatCurrency = (value: number) =>
        `฿${value.toLocaleString('th-TH')}`;

    const pctChange = data.comparison
        ? ((data.comparison.current.expense - data.comparison.previous.expense) / data.comparison.previous.expense * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold">รายงาน</h1>
                    <div className="w-9" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
                {/* Date Range Picker */}
                <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800/60">
                    {([['month', 'เดือน'], ['quarter', 'ไตรมาส'], ['year', 'ปี']] as [DateRange, string][]).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setDateRange(key)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${dateRange === key
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3"
                >
                    <SummaryCard label="รายรับ" value={data.summary.income} color="emerald" icon={<TrendingUp size={16} />} />
                    <SummaryCard label="รายจ่าย" value={data.summary.expense} color="rose" icon={<TrendingDown size={16} />} />
                    <SummaryCard label="คงเหลือ" value={data.summary.net} color="indigo" icon={<Wallet size={16} />} />
                </motion.div>

                {/* Spending Trend (Line Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">📈 แนวโน้มรายรับ-รายจ่าย</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
                                labelStyle={{ color: '#9ca3af' }}
                                formatter={(value?: number) => formatCurrency(value ?? 0)}
                            />
                            <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: '#34d399' }} name="รายรับ" />
                            <Line type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={2.5} dot={{ r: 4, fill: '#fb7185' }} name="รายจ่าย" />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Jar Distribution (Pie Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">🏺 สัดส่วนรายจ่ายตามโถ</h3>
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie
                                    data={data.by_jar}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={75}
                                    dataKey="amount"
                                    nameKey="name"
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {data.by_jar.map((_entry, idx) => (
                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
                                    formatter={(value?: number) => formatCurrency(value ?? 0)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                            {data.by_jar.map((jar, idx) => (
                                <div key={jar.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                        <span className="text-gray-400">{jar.name}</span>
                                    </div>
                                    <span className="text-gray-300 font-medium">{formatCurrency(jar.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Category Breakdown (Bar Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                >
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">📊 รายจ่ายตามหมวดหมู่</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.by_jar} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
                                formatter={(value?: number) => formatCurrency(value ?? 0)}
                            />
                            <Bar dataKey="amount" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={20} name="จำนวนเงิน" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Comparison */}
                {data.comparison && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                    >
                        <h3 className="text-sm font-semibold text-gray-300 mb-4">⚖️ เปรียบเทียบกับเดือนก่อน</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                                { name: 'รายรับ', current: data.comparison.current.income, previous: data.comparison.previous.income },
                                { name: 'รายจ่าย', current: data.comparison.current.expense, previous: data.comparison.previous.expense },
                                { name: 'คงเหลือ', current: data.comparison.current.net, previous: data.comparison.previous.net },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
                                    formatter={(value?: number) => formatCurrency(value ?? 0)}
                                />
                                <Bar dataKey="current" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={24} name="เดือนนี้" />
                                <Bar dataKey="previous" fill="#4b5563" radius={[6, 6, 0, 0]} barSize={24} name="เดือนก่อน" />
                                <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 text-center">
                            <span className={`text-sm font-medium ${pctChange > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {pctChange > 0 ? '↑' : '↓'} รายจ่าย{pctChange > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} {Math.abs(pctChange).toFixed(1)}%
                            </span>
                        </div>
                    </motion.div>
                )}

                <p className="text-center text-xs text-gray-600 italic pb-4">
                    (Mock Data — จะเชื่อมต่อ API /api/v1/charts เมื่อ backend พร้อม)
                </p>
            </div>

            <BottomNav activePage="reports" onNavigate={(p) => onNavigate(p)} />
        </div>
    );
}

// --- Sub-components ---

function SummaryCard({ label, value, color, icon }: {
    label: string;
    value: number;
    color: 'emerald' | 'rose' | 'indigo';
    icon: React.ReactNode;
}) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
        rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', iconBg: 'bg-rose-500/20' },
        indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
    };
    const c = colorMap[color];

    return (
        <div className={`${c.bg} ${c.border} border rounded-xl p-3`}>
            <div className={`${c.iconBg} w-7 h-7 rounded-lg flex items-center justify-center ${c.text} mb-2`}>
                {icon}
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
            <p className={`text-base font-bold ${c.text} mt-0.5`}>
                ฿{(value / 1000).toFixed(1)}k
            </p>
        </div>
    );
}
