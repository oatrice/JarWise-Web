import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Loader2, Download, Search } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const API_BASE = 'http://localhost:8081/api/v1';
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#93c5fd'];

const formatCurrency = (value: number, decimals: number = 0) =>
    new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);

type DateRange = 'month' | 'quarter' | 'year' | 'all' | 'custom';

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
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async (range: DateRange, startOverride?: string, endOverride?: string) => {
        setLoading(true);
        const now = new Date();
        let start = new Date();
        let end = now;

        if (range === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (range === 'quarter') {
            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else if (range === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        } else if (range === 'all') {
            start = new Date(2000, 0, 1);
        } else if (range === 'custom' && startOverride && endOverride) {
            start = new Date(startOverride);
            end = new Date(endOverride);
        }

        const params = new URLSearchParams({
            start_date: start.toISOString(),
            end_date: end.toISOString(),
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

    const handleExport = async () => {
        const now = new Date();
        let start = new Date();
        let end = now;

        if (dateRange === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (dateRange === 'quarter') {
            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else if (dateRange === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        } else if (dateRange === 'all') {
            start = new Date(2000, 0, 1);
        } else if (dateRange === 'custom' && customStart && customEnd) {
            start = new Date(customStart);
            end = new Date(customEnd);
        }

        const params = new URLSearchParams({
            start_date: start.toISOString(),
            end_date: end.toISOString(),
        });

        try {
            const res = await fetch(`${API_BASE}/reports/export?${params}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jarwise-export-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to export CSV:', err);
        }
    };

    useEffect(() => {
        if (dateRange !== 'custom') {
            fetchReport(dateRange);
        }
    }, [dateRange]);

    const formatCurrency = (value: number, decimals: number = 0) =>
        `฿${value.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

    const rangeLabels: Record<DateRange, string> = {
        month: 'เดือน',
        quarter: 'ไตรมาส',
        year: 'ปี',
        all: 'ภาพรวมการเงินทั้งหมด',
        custom: 'ช่วงเวลาก่อนหน้านี้'
    };

    const getDaysSelected = () => {
        if (dateRange !== 'custom' || !customStart || !customEnd) return null;
        const start = new Date(customStart);
        const end = new Date(customEnd);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : null;
    };

    const daysSelected = getDaysSelected();

    const setQuickRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        setCustomStart(startStr);
        setCustomEnd(endStr);
        fetchReport('custom', startStr, endStr);
    };

    const getPct = (curr: number, prev: number) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const incomePct = data?.comparison ? getPct(data.comparison.current.income, data.comparison.previous.income) : 0;
    const expensePct = data?.comparison ? getPct(data.comparison.current.expense, data.comparison.previous.expense) : 0;
    const netPct = data?.comparison ? getPct(data.comparison.current.net, data.comparison.previous.net) : 0;

    // Prepare Income Breakdown Data (Handle Uncategorized)
    const categorizedIncome = data?.by_category?.reduce((sum, c) => sum + (c.income || 0), 0) || 0;
    const uncategorizedIncome = (data?.summary?.income || 0) - categorizedIncome;
    const incomeData = [...(data?.by_category?.filter(c => (c.income || 0) > 0) || [])];

    if (uncategorizedIncome > 0.01) {
        incomeData.push({
            id: 'uncategorized',
            name: 'อื่นๆ / ไม่ระบุ',
            income: uncategorizedIncome,
            expense: 0,
            amount: uncategorizedIncome,
            prev_expense: 0
        });
    }

    const [metricIdx, setMetricIdx] = useState(0);
    const metrics = [
        { label: 'รายรับ', pct: incomePct, inverse: false },
        { label: 'รายจ่าย', pct: expensePct, inverse: true },
        { label: 'คงเหลือ', pct: netPct, inverse: false }
    ];

    useEffect(() => {
        if (!data?.comparison) return;
        const timer = setInterval(() => {
            setMetricIdx((prev) => (prev + 1) % metrics.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [data?.comparison, metrics.length]);

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold ml-8">รายงาน</h1>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                        title="Export CSV"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
                {/* Date Range Picker - Premium Segmented Control */}
                <div className="space-y-4">
                    <div className="relative flex bg-gray-900/40 p-1.5 rounded-2xl border border-gray-800/60 backdrop-blur-md">
                        {([['month', 'เดือน'], ['quarter', 'ไตรมาส'], ['year', 'ปี'], ['all', 'ทั้งหมด'], ['custom', 'กำหนดเอง']] as [DateRange, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setDateRange(key);
                                    if (key !== 'custom') {
                                        fetchReport(key);
                                    }
                                }}
                                disabled={loading}
                                className={`relative flex-1 py-2 text-[11px] font-semibold rounded-xl transition-colors duration-300 z-10 ${dateRange === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {dateRange === key && (
                                    <motion.div
                                        layoutId="activeRange"
                                        className="absolute inset-0 bg-indigo-600 shadow-md shadow-indigo-600/20 rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20">{label}</span>
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, y: -10 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            className="space-y-4 pt-2"
                        >
                            {/* Quick Presets */}
                            <div className="flex gap-2">
                                {[
                                    { days: 7, label: '7 วันล่าสุด' },
                                    { days: 30, label: '30 วันล่าสุด' },
                                    { days: 90, label: '90 วันล่าสุด' }
                                ].map((p) => (
                                    <button
                                        key={p.days}
                                        onClick={() => setQuickRange(p.days)}
                                        className="px-3 py-1.5 text-[10px] bg-gray-900/60 border border-gray-800/60 rounded-full text-gray-400 hover:text-white hover:border-indigo-500/50 transition-all"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 items-end bg-gray-900/20 p-4 rounded-2xl border border-gray-800/40">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">เริ่มต้น</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full bg-gray-950/50 border border-gray-800/60 rounded-xl text-sm text-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">สิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full bg-gray-950/50 border border-gray-800/60 rounded-xl text-sm text-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => fetchReport('custom', customStart, customEnd)}
                                    disabled={!customStart || !customEnd || loading}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white p-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Search size={18} />
                                    )}
                                </button>
                            </div>

                            {daysSelected !== null && (
                                <p className="text-[11px] text-indigo-400/80 font-medium text-center italic">
                                    ✨ เลือกช่วงเวลาแล้วทั้งหมด {daysSelected + 1} วัน
                                </p>
                            )}
                        </motion.div>
                    )}
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
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            className="space-y-5"
                        >
                            {/* Summary Cards */}
                            <motion.div
                                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                className="grid grid-cols-3 gap-3"
                            >
                                <SummaryCard label="รายรับ" value={data.summary.income} color="emerald" icon={<TrendingUp size={16} />} />
                                <SummaryCard label="รายจ่าย" value={data.summary.expense} color="rose" icon={<TrendingDown size={16} />} />
                                <SummaryCard label="คงเหลือ" value={data.summary.net} color="indigo" icon={<Wallet size={16} />} />
                            </motion.div>

                            {/* Spending Trend */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60 shadow-lg shadow-black/20"
                            >
                                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-indigo-400" />
                                    แนวโน้มรายรับ-รายจ่าย
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={data.trend}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} strokeOpacity={0.4} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            formatter={(v?: number) => formatCurrency(v ?? 0, 2)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorIncome)"
                                            name="รายรับ"
                                            animationDuration={1500}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="#f43f5e"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorExpense)"
                                            name="รายจ่าย"
                                            animationDuration={1500}
                                        />
                                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Income Breakdown (Horizontal Bar) */}
                            {incomeData.length > 0 && (
                                <motion.div
                                    variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                                >
                                    <h3 className="text-sm font-semibold text-gray-300 mb-4 font-display">💰 วิเคราะห์รายรับตามหมวดหมู่ (Income Breakdown)</h3>
                                    <ResponsiveContainer width="100%" height={incomeData.length * 40 + 60}>
                                        <BarChart data={incomeData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} strokeOpacity={0.3} />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                                formatter={(v?: number) => formatCurrency(v ?? 0, 2)}
                                            />
                                            <Bar dataKey="income" fill="#10b981" radius={[0, 4, 4, 0]} name="รายรับ" animationDuration={1000} />
                                            <Bar dataKey="prev_income" fill="#53e4af66" radius={[0, 4, 4, 0]} name="รายรับช่วงก่อนหน้า" animationDuration={1000} />
                                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* Income Distribution (Pie) */}
                            {incomeData.length > 0 && (
                                <motion.div
                                    variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
                                >
                                    <h3 className="text-sm font-semibold text-gray-300 mb-4 font-display">🏺 สัดส่วนรายรับตามหมวดหมู่ (Distribution)</h3>
                                    <div className="flex items-center gap-4">
                                        <ResponsiveContainer width="50%" height={180}>
                                            <PieChart>
                                                <Pie
                                                    data={incomeData}
                                                    cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                    dataKey="income" nameKey="name" paddingAngle={5} strokeWidth={0}
                                                    animationBegin={200} animationDuration={1200}
                                                >
                                                    {incomeData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip formatter={(v?: number) => formatCurrency(v ?? 0, 2)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex-1 space-y-1.5">
                                            {incomeData.slice(0, 5).map((inc, idx) => (
                                                <div key={inc.id} className="flex items-center justify-between text-[11px]">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                        <span className="text-gray-400 truncate">{inc.name}</span>
                                                    </div>
                                                    <span className="text-gray-200 font-medium shrink-0 ml-2">{formatCurrency(inc.income, 2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Expense Breakdown (Dual Bar Chart) */}
                            <motion.div
                                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60 shadow-lg shadow-black/20"
                            >
                                <h3 className="text-sm font-semibold text-gray-300 mb-4 font-display">📊 วิเคราะห์รายจ่ายตามหมวดหมู่ (Expense Breakdown)</h3>
                                <ResponsiveContainer width="100%" height={data.by_category.length * 40 + 60}>
                                    <BarChart data={data.by_category} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} strokeOpacity={0.3} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            formatter={(v?: number) => formatCurrency(v ?? 0, 2)}
                                        />
                                        <Bar dataKey="expense" fill="#f43f5e" radius={[0, 4, 4, 0]} name="รายจ่าย" animationDuration={1000} />
                                        <Bar dataKey="prev_expense" fill="#d4dae274" radius={[0, 4, 4, 0]} name="รายจ่ายช่วงก่อนหน้า" animationDuration={1000} />
                                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Category Distribution (Pie) */}
                            <motion.div
                                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60 shadow-lg shadow-black/20"
                            >
                                <h3 className="text-sm font-semibold text-gray-300 mb-4 font-display">🏺 สัดส่วนรายจ่ายตามหมวดหมู่ (Distribution)</h3>
                                <div className="flex items-center gap-4">
                                    <ResponsiveContainer width="50%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={data.by_jar}
                                                cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                dataKey="amount" nameKey="name" paddingAngle={5} strokeWidth={0}
                                                animationBegin={200} animationDuration={1200}
                                            >
                                                {data.by_jar.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v?: number) => formatCurrency(v ?? 0, 2)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-1.5">
                                        {data.by_jar.slice(0, 5).map((jar, idx) => (
                                            <div key={jar.id} className="flex items-center justify-between text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                    <span className="text-gray-400 truncate">{jar.name}</span>
                                                </div>
                                                <span className="text-gray-200 font-medium shrink-0 ml-2">{formatCurrency(jar.amount, 2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Comparison Section */}
                            {data.comparison && (
                                <motion.div
                                    variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                                    className="bg-gradient-to-br from-indigo-900/20 to-gray-900/60 rounded-2xl p-4 border border-indigo-500/10 shadow-lg shadow-indigo-500/5"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-300 font-display">
                                            {dateRange === 'all' ? `📊 ${rangeLabels[dateRange]}` : `⚖️ เปรียบเทียบกับ${rangeLabels[dateRange]}${dateRange === 'custom' ? '' : 'ก่อนหน้า'}`}
                                        </h3>
                                        <div className="h-6 overflow-hidden relative min-w-[100px] flex justify-end">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={metricIdx}
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -10, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Badge
                                                        label={metrics[metricIdx].label}
                                                        pct={metrics[metricIdx].pct}
                                                        inverse={metrics[metricIdx].inverse}
                                                    />
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={[
                                            { name: 'รายรับ', current: data.comparison.current.income, previous: data.comparison.previous.income },
                                            { name: 'รายจ่าย', current: data.comparison.current.expense, previous: data.comparison.previous.expense },
                                            { name: 'คงเหลือ', current: data.comparison.current.net, previous: data.comparison.previous.net },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} strokeOpacity={0.3} />
                                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: '#37415120' }}
                                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                                formatter={(v?: number) => formatCurrency(v ?? 0, 2)}
                                            />
                                            <Bar dataKey="previous" fill="#70757dff" radius={[4, 4, 0, 0]} name={`${rangeLabels[dateRange]}ก่อนหน้า`} animationDuration={1000} />
                                            <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name={`${rangeLabels[dateRange]}นี้/ช่วงนี้`} animationDuration={1000} />
                                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </motion.div>
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
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            iconBg: 'bg-emerald-500/20',
            grad: 'from-emerald-500/10 to-transparent'
        },
        rose: {
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            text: 'text-rose-400',
            iconBg: 'bg-rose-500/20',
            grad: 'from-rose-500/10 to-transparent'
        },
        indigo: {
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            text: 'text-indigo-400',
            iconBg: 'bg-indigo-500/20',
            grad: 'from-indigo-500/10 to-transparent'
        },
    };
    const c = colorMap[color];

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden ${c.bg} ${c.border} border rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/10`}
        >
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${c.grad} opacity-30`} />
            <div className="relative z-10">
                <div className={`${c.iconBg} w-8 h-8 rounded-xl flex items-center justify-center ${c.text} mb-3 shadow-inner`}>
                    {icon}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-80">{label}</p>
                <div className="flex flex-col mt-1">
                    <p className={`text-sm font-black ${c.text}`}>
                        {formatCurrency(value, 2)}
                    </p>
                    <p className="text-[9px] text-gray-400 font-medium opacity-60">
                        {value >= 1000 ? `฿${(value / 1000).toFixed(1)}k` : `฿${value.toFixed(0)}`}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function Badge({ label, pct, inverse }: { label: string; pct: number; inverse: boolean }) {
    const isGood = inverse ? pct < 0 : pct > 0;
    const colorClass = isGood
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

    return (
        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${colorClass} flex items-center gap-1 shadow-sm shadow-black/20`}>
            <span className="opacity-80 font-medium">{label}</span>
            <span className="font-black text-[9px] mb-0.5">{pct > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(pct).toFixed(1)}%</span>
        </div>
    );
}

