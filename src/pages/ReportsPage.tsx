import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const API_BASE = 'http://localhost:8081/api/v1';
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#93c5fd'];

type DateRange = 'month' | 'quarter' | 'year';

interface ReportData {
    summary: { income: number; expense: number; net: number };
    trend: Array<{ date: string; income: number; expense: number }>;
    by_category: Array<{ id: string; name: string; income: number; expense: number; amount: number; prev_expense: number }>;
    by_jar: Array<{ id: string; name: string; income: number; expense: number; amount: number; prev_expense: number }>;
    comparison?: {
        current: { income: number; expense: number; net: number };
        previous: { income: number; expense: number; net: number };
    };
}

interface ReportsPageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
}

export default function ReportsPage({ onBack, onNavigate }: ReportsPageProps) {
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async (range: DateRange) => {
        setLoading(true);
        const now = new Date();
        let start = new Date();
        
        if (range === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (range === 'quarter') {
            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else if (range === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        }

        const params = new URLSearchParams({
            start_date: start.toISOString(),
            end_date: now.toISOString(),
        });

        try {
            const res = await fetch(`${API_BASE}/reports?${params}`);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error('Failed to fetch report:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(dateRange);
    }, [dateRange]);

    const formatCurrency = (value: number) =>
        `฿${value.toLocaleString('th-TH')}`;

    const pctChange = data?.comparison?.previous?.expense && data.comparison.previous.expense > 0
        ? ((data.comparison.current.expense - data.comparison.previous.expense) / data.comparison.previous.expense * 100)
        : (data?.comparison?.current?.expense && data.comparison.current.expense > 0 ? 100 : 0);

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold">รายงานอย่างละเอียด</h1>
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
                            disabled={loading}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${dateRange === key
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-gray-400 hover:text-gray-200 disabled:opacity-50'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3"
                        >
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-sm">กำลังคำนวณข้อมูลย้อนหลัง...</p>
                        </motion.div>
                    ) : data && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-5"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <SummaryCard label="รายรับ" value={data.summary.income} color="emerald" icon={<TrendingUp size={16} />} />
                                <SummaryCard label="รายจ่าย" value={data.summary.expense} color="rose" icon={<TrendingDown size={16} />} />
                                <SummaryCard label="คงเหลือ" value={data.summary.net} color="indigo" icon={<Wallet size={16} />} />
                            </div>

                            {/* Spending Trend */}
                            <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">📈 แนวโน้มรายรับ-รายจ่าย</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={data.trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
                                            formatter={(v?: number) => formatCurrency(v ?? 0)}
                                        />
                                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={1000} />
                                        <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={false} animationDuration={1000} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Category Breakdown (Dual Bar Chart) */}
                            <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">📊 เปรียบเทียบตามหมวดหมู่</h3>
                                <ResponsiveContainer width="100%" height={data.by_category.length * 40 + 60}>
                                    <BarChart data={data.by_category} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                            formatter={(v?: number) => formatCurrency(v ?? 0)}
                                        />
                                        <Bar dataKey="income" fill="#10b981" radius={[0, 4, 4, 0]} name="รายรับ" />
                                        <Bar dataKey="expense" fill="#f43f5e" radius={[0, 4, 4, 0]} name="รายจ่าย" />
                                        <Bar dataKey="prev_expense" fill="#94a3b8" radius={[0, 4, 4, 0]} name="รายจ่ายเดือนก่อน" />
                                        <Legend />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Jar Distribution (Pie) */}
                            <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">🏺 รายจ่ายรวมรายโถ (Distribution)</h3>
                                <div className="flex items-center gap-4">
                                    <ResponsiveContainer width="50%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={data.by_jar}
                                                cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                dataKey="amount" nameKey="name" paddingAngle={5} strokeWidth={0}
                                            >
                                                {data.by_jar.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v?: number) => formatCurrency(v ?? 0)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-1.5">
                                        {data.by_jar.slice(0, 5).map((jar, idx) => (
                                            <div key={jar.id} className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                    <span className="text-gray-400">{jar.name}</span>
                                                </div>
                                                <span className="text-gray-200">{formatCurrency(jar.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Section */}
                            {data.comparison && (
                                <div className="bg-gradient-to-br from-indigo-900/20 to-gray-900/60 rounded-2xl p-4 border border-indigo-500/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-300">⚖️ เปรียบเทียบกับเดือนก่อน</h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${pctChange > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            รายจ่าย {pctChange > 0 ? '↑' : '↓'} {Math.abs(pctChange).toFixed(1)}%
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={[
                                            { name: 'รายรับ', current: data.comparison.current.income, previous: data.comparison.previous.income },
                                            { name: 'รายจ่าย', current: data.comparison.current.expense, previous: data.comparison.previous.expense },
                                            { name: 'คงเหลือ', current: data.comparison.current.net, previous: data.comparison.previous.net },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip cursor={{ fill: '#37415120' }} formatter={(v?: number) => formatCurrency(v ?? 0)} />
                                            <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name={dateRange === 'month' ? "เดือนนี้" : "ช่วงนี้"} />
                                            <Bar dataKey="previous" fill="#4b5563" radius={[4, 4, 0, 0]} name={dateRange === 'month' ? "เดือนก่อน" : "ก่อนหน้า"} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav activePage="reports" onNavigate={onNavigate} />
        </div>
    );
}

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

