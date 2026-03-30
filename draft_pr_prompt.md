# PR Draft Prompt

You are an AI assistant helping to create a Pull Request description.
    
TASK: [Web | Android] Financial Reports & Data Export
ISSUE: {
  "title": "[Web | Android] Financial Reports & Data Export",
  "number": 59,
  "body": "# \ud83c\udfaf Objective\nImplement comprehensive financial reporting with charts, graphs, and data export capabilities.\n\nCloses #59",
  "url": "https://github.com/oatrice/JarWise-Root/issues/59"
}

GIT CONTEXT:
COMMITS:
628e66c feat: [Web | Android] Financial Reports & Data Export...
fddad05 docs: sync AI brain artifacts
d8a934b ✨ feat(reports): Enhance reports page with new features
4e5539b refactor: reorganize ReportsPage.tsx for better readability and error handling
f80e591 ✨ feat(reports): Enhance reports page with new charts and UI
f491aaa feat: add rotating metric comparison with animations
486a85d feat(reports): Add dynamic date range labels for reports
19d1d72 ✨ feat(reports): Enhance date range selection
67159a8 feat(reports): add all and custom date range options
85af8da feat: add CSV export functionality to reports page
b4a67fb feat: add previous month expense comparison to reports
ea0cd32 chore(api): update API base port to 8081 and add test
133edbd chore: bump version to 0.13.0
47d4937 feat: implement API integration for ReportsPage

STATS:
CHANGELOG.md                                       |  14 +
 .../59_issue-59/ai_brain/implementation_plan.md    |  51 ++
 docs/features/59_issue-59/ai_brain/task.md         |  13 +
 docs/features/59_issue-59/ai_brain/walkthrough.md  |  42 +
 draft_pr_prompt.md                                 | 973 +++++++++------------
 package-lock.json                                  |   4 +-
 package.json                                       |   2 +-
 src/__tests__/apiConfig.test.ts                    |  13 +
 src/pages/ReportsPage.tsx                          | 818 ++++++++++++-----
 9 files changed, 1166 insertions(+), 764 deletions(-)

KEY FILE DIFFS:
diff --git a/src/__tests__/apiConfig.test.ts b/src/__tests__/apiConfig.test.ts
new file mode 100644
index 0000000..0d7b1e2
--- /dev/null
+++ b/src/__tests__/apiConfig.test.ts
@@ -0,0 +1,13 @@
+import { describe, it, expect } from 'vitest';
+import fs from 'fs';
+import path from 'path';
+
+describe('API Configuration', () => {
+    it('should use port 8081 for API_BASE in ReportsPage', () => {
+        const filePath = path.resolve(__dirname, '../pages/ReportsPage.tsx');
+        const content = fs.readFileSync(filePath, 'utf-8');
+        
+        // เราคาดหวังว่าพอร์ตจะเป็น 8081
+        expect(content).toContain('http://localhost:8081/api/v1');
+    });
+});
diff --git a/src/pages/ReportsPage.tsx b/src/pages/ReportsPage.tsx
index 49b2752..06ee02a 100644
--- a/src/pages/ReportsPage.tsx
+++ b/src/pages/ReportsPage.tsx
@@ -1,39 +1,38 @@
-import { useState } from 'react';
-import { motion } from 'framer-motion';
+import { useState, useEffect } from 'react';
+import { motion, AnimatePresence } from 'framer-motion';
 import {
-    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
-    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
+    BarChart, Bar, PieChart, Pie, Cell,
+    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
 } from 'recharts';
-import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
+import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Loader2, Download, Search } from 'lucide-react';
 import BottomNav from '../components/BottomNav';
 
-// Mock chart data (จำลอง response จาก GET /api/v1/charts)
-const MOCK_CHART_DATA = {
-    summary: { income: 45000, expense: 28500, net: 16500 },
-    trend: [
-        { date: '2025-09', income: 42000, expense: 31000 },
-        { date: '2025-10', income: 38000, expense: 27000 },
-        { date: '2025-11', income: 41000, expense: 29500 },
-        { date: '2025-12', income: 44000, expense: 32000 },
-        { date: '2026-01', income: 45000, expense: 28500 },
-    ],
-    by_jar: [
-        { id: 'food', name: 'อาหาร', amount: 9500 },
-        { id: 'transport', name: 'เดินทาง', amount: 5200 },
-        { id: 'shopping', name: 'ช้อปปิ้ง', amount: 4800 },
-        { id: 'bills', name: 'ค่าบิล', amount: 4000 },
-        { id: 'health', name: 'สุขภาพ', amount: 2500 },
-        { id: 'other', name: 'อื่นๆ', amount: 2500 },
-    ],
-    comparison: {
-        current: { income: 45000, expense: 28500, net: 16500 },
-        previous: { income: 44000, expense: 32000, net: 12000 },
-    },
+const API_BASE = 'http://localhost:8081/api/v1';
+const formatCurrency = (value: number, decimals: number = 2) =>
+    `฿${value.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
+
+const rangeLabels: Record<DateRange, string> = {
+    month: 'เดือน',
+    quarter: 'ไตรมาส',
+    year: 'ปี',
+    all: 'ภาพรวมการเงินทั้งหมด',
+    custom: 'ช่วงเวลาก่อนหน้านี้'
 };
 
 const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#93c5fd'];
 
-type DateRange = 'month' | 'quarter' | 'year';
+type DateRange = 'month' | 'quarter' | 'year' | 'all' | 'custom';
+
+interface ReportData {
+    summary: { income: number; expense: number; net: number };
+    trend: Array<{ date: string; income: number; expense: number }>;
+    by_category: Array<{ id: string; name: string; income: number; expense: number; amount: number; prev_expense: number }>;
+    by_jar: Array<{ id: string; name: string; income: number; expense: number; amount: number; prev_expense: number }>;
+    comparison?: {
+        current: { income: number; expense: number; net: number };
+        previous: { income: number; expense: number; net: number };
+    };
+}
 
 interface ReportsPageProps {
     onBack: () => void;
@@ -42,14 +41,156 @@ interface ReportsPageProps {
 
 export default function ReportsPage({ onBack, onNavigate }: ReportsPageProps) {
     const [dateRange, setDateRange] = useState<DateRange>('month');
-    const data = MOCK_CHART_DATA;
+    const [customStart, setCustomStart] = useState('');
+    const [customEnd, setCustomEnd] = useState('');
+    const [data, setData] = useState<ReportData | null>(null);
+    const [loading, setLoading] = useState(true);
+    const [error, setError] = useState<string | null>(null);
+
+    const fetchReport = async (range: DateRange, startOverride?: string, endOverride?: string) => {
+        setLoading(true);
+        const now = new Date();
+        let start = new Date();
+        let end = now;
+
+        if (range === 'month') {
+            start = new Date(now.getFullYear(), now.getMonth(), 1);
+        } else if (range === 'quarter') {
+            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
+        } else if (range === 'year') {
+            start = new Date(now.getFullYear(), 0, 1);
+        } else if (range === 'all') {
+            start = new Date(2000, 0, 1);
+        } else if (range === 'custom' && startOverride && endOverride) {
+            start = new Date(startOverride);
+            end = new Date(endOverride);
+        }
+
+        const params = new URLSearchParams({
+            start_date: start.toISOString(),
+            end_date: end.toISOString(),
+        });
+
+        try {
+            setError(null);
+            const res = await fetch(`${API_BASE}/reports?${params}`);
+            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
+            const result = await res.json();
+            setData(result);
+        } catch (err: any) {
+            console.error('Failed to fetch report:', err);
+            setError(err.message || 'ไม่สามารถโหลดข้อมูลรายงานได้');
+        } finally {
+            setLoading(false);
+        }
+    };
+
+    const handleExport = async () => {
+        const now = new Date();
+        let start = new Date();
+        let end = now;
+
+        if (dateRange === 'month') {
+            start = new Date(now.getFullYear(), now.getMonth(), 1);
+        } else if (dateRange === 'quarter') {
+            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
+        } else if (dateRange === 'year') {
+            start = new Date(now.getFullYear(), 0, 1);
+        } else if (dateRange === 'all') {
+            start = new Date(2000, 0, 1);
+        } else if (dateRange === 'custom' && customStart && customEnd) {
+            start = new Date(customStart);
+            end = new Date(customEnd);
+        }
+
+        const params = new URLSearchParams({
+            start_date: start.toISOString(),
+            end_date: end.toISOString(),
+        });
+
+        try {
+            const res = await fetch(`${API_BASE}/reports/export?${params}`);
+            const blob = await res.blob();
+            const url = window.URL.createObjectURL(blob);
+            const a = document.createElement('a');
+            a.href = url;
+            a.download = `jarwise-export-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
+            document.body.appendChild(a);
+            a.click();
+            window.URL.revokeObjectURL(url);
+            document.body.removeChild(a);
+        } catch (err) {
+            console.error('Failed to export CSV:', err);
+        }
+    };
+
+    useEffect(() => {
+        if (dateRange !== 'custom') {
+            fetchReport(dateRange);
+        }
+    }, [dateRange]);
 
-    const formatCurrency = (value: number) =>
-        `฿${value.toLocaleString('th-TH')}`;
 
-    const pctChange = data.comparison
-        ? ((data.comparison.current.expense - data.comparison.previous.expense) / data.comparison.previous.expense * 100)
-        : 0;
+    const getDaysSelected = () => {
+        if (dateRange !== 'custom' || !customStart || !customEnd) return null;
+        const start = new Date(customStart);
+        const end = new Date(customEnd);
+        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
+        return diff >= 0 ? diff : null;
+    };
+
+    const daysSelected = getDaysSelected();
+
+    const setQuickRange = (days: number) => {
+        const end = new Date();
+        const start = new Date();
+        start.setDate(end.getDate() - days);
+        const startStr = start.toISOString().split('T')[0];
+        const endStr = end.toISOString().split('T')[0];
+        setCustomStart(startStr);
+        setCustomEnd(endStr);
+        fetchReport('custom', startStr, endStr);
+    };
+
+    const getPct = (curr: number, prev: number) => {
+        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
+        return ((curr - prev) / prev) * 100;
+    };
+
+    const incomePct = data?.comparison ? getPct(data.comparison.current.income, data.comparison.previous.income) : 0;
+    const expensePct = data?.comparison ? getPct(data.comparison.current.expense, data.comparison.previous.expense) : 0;
+    const netPct = data?.comparison ? getPct(data.comparison.current.net, data.comparison.previous.net) : 0;
+
+    // Prepare Income Breakdown Data (Handle Uncategorized)
+    const categorizedIncome = data?.by_category?.reduce((sum, c) => sum + (c.income || 0), 0) || 0;
+    const uncategorizedIncome = (data?.summary?.income || 0) - categorizedIncome;
+    const incomeData = [...(data?.by_category?.filter(c => (c.income || 0) > 0) || [])];
+
+    if (uncategorizedIncome > 0.01) {
+        incomeData.push({
+            id: 'uncategorized',
+            name: 'อื่นๆ / ไม่ระบุ',
+            income: uncategorizedIncome,
+            expense: 0,
+            amount: uncategorizedIncome,
+            prev_expense: 0
+        });
+    }
+
+    const [metricIdx, setMetricIdx] = useState(0);
+    const metrics = [
+        { label: 'รายรับ', pct: incomePct, inverse: false },
+        { label: 'รายจ่าย', pct: expensePct, inverse: true },
+        { label: 'คงเหลือ', pct: netPct, inverse: false }
+    ];
+
+    useEffect(() => {
+        if (!data?.comparison) return;
+        const timer = setInterval(() => {
+            setMetricIdx((prev) => (prev + 1) % 3);
+        }, 3000);
+        return () => clearInterval(timer);
+    }, [data?.comparison]);
 
     return (
         <div className="min-h-screen bg-gray-950 text-white pb-28">
@@ -59,179 +200,409 @@ export default function ReportsPage({ onBack, onNavigate }: ReportsPageProps) {
                     <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                         <ArrowLeft size={20} />
                     </button>
-                    <h1 className="text-lg font-semibold">รายงาน</h1>
-                    <div className="w-9" />
+                    <h1 className="text-lg font-semibold ml-8">รายงาน</h1>
+                    <button
+                        onClick={handleExport}
+                        disabled={loading}
+                        className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
+                        title="Export CSV"
+                    >
+                        <Download size={20} />
+                    </button>
                 </div>
             </div>
 
             <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
-                {/* Date Range Picker */}
-                <div className="flex gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800/60">
-                    {([['month', 'เดือน'], ['quarter', 'ไตรมาส'], ['year', 'ปี']] as [DateRange, string][]).map(([key, label]) => (
-                        <button
-                            key={key}
-                            onClick={() => setDateRange(key)}
-                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${dateRange === key
-                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
-                                : 'text-gray-400 hover:text-gray-200'
-                                }`}
+                {/* Date Range Picker - Premium Segmented Control */}
+                <div className="space-y-4">
+                    <div className="relative flex bg-gray-900/40 p-1.5 rounded-2xl border border-gray-800/60 backdrop-blur-md">
+                        {([['month', 'เดือน'], ['quarter', 'ไตรมาส'], ['year', 'ปี'], ['all', 'ทั้งหมด'], ['custom', 'กำหนดเอง']] as [DateRange, string][]).map(([key, label]) => (
+                            <button
+                                key={key}
+                                onClick={() => {
+                                    setDateRange(key);
+                                    if (key !== 'custom') {
+                                        fetchReport(key);
+                                    }
+                                }}
+                                disabled={loading}
+                                className={`relative flex-1 py-2 text-[11px] font-semibold rounded-xl transition-colors duration-300 z-10 ${dateRange === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
+                            >
+                                {dateRange === key && (
+                                    <motion.div
+                                        layoutId="activeRange"
+                                        className="absolute inset-0 bg-indigo-600 shadow-md shadow-indigo-600/20 rounded-xl"
+                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
+                                    />
+                                )}
+                                <span className="relative z-20">{label}</span>
+                            </button>
+                        ))}
+                    </div>
+
+                    {dateRange === 'custom' && (
+                        <motion.div
+                            initial={{ height: 0, opacity: 0, y: -10 }}
+                            animate={{ height: 'auto', opacity: 1, y: 0 }}
+                            className="space-y-4 pt-2"
                         >
-                            {label}
-                        </button>
-                    ))}
+                            {/* Quick Presets */}
+                            <div className="flex gap-2">
+                                {[
+                                    { days: 7, label: '7 วันล่าสุด' },
+                                    { days: 30, label: '30 วันล่าสุด' },
+                                    { days: 90, label: '90 วันล่าสุด' }
+                                ].map((p) => (
+                                    <button
+                                        key={p.days}
+                                        onClick={() => setQuickRange(p.days)}
+                                        className="px-3 py-1.5 text-[10px] bg-gray-900/60 border border-gray-800/60 rounded-full text-gray-400 hover:text-white hover:border-indigo-500/50 transition-all"
+                                    >
+                                        {p.label}
+                                    </button>
+                                ))}
+                            </div>
+
+                            <div className="flex gap-3 items-end bg-gray-900/20 p-4 rounded-2xl border border-gray-800/40">
+                                <div className="flex-1 space-y-2">
+                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">เริ่มต้น</label>
+                                    <input
+                                        type="date"
+                                        value={customStart}
+                                        onChange={(e) => setCustomStart(e.target.value)}
+                                        className="w-full bg-gray-950/50 border border-gray-800/60 rounded-xl text-sm text-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all"
+                                    />
+                                </div>
+                                <div className="flex-1 space-y-2">
+                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-1">สิ้นสุด</label>
+                                    <input
+                                        type="date"
+                                        value={customEnd}
+                                        onChange={(e) => setCustomEnd(e.target.value)}
+                                        className="w-full bg-gray-950/50 border border-gray-800/60 rounded-xl text-sm text-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-600 transition-all"
+                                    />
+                                </div>
+                                <button
+                                    onClick={() => fetchReport('custom', customStart, customEnd)}
+                                    disabled={!customStart || !customEnd || loading}
+                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white p-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
+                                >
+                                    {loading ? (
+                                        <Loader2 className="animate-spin" size={18} />
+                                    ) : (
+                                        <Search size={18} />
+                                    )}
+                                </button>
+                            </div>
+
+                            {daysSelected !== null && (
+                                <p className="text-[11px] text-indigo-400/80 font-medium text-center italic">
+                                    ✨ เลือกช่วงเวลาแล้วทั้งหมด {daysSelected + 1} วัน
+                                </p>
+                            )}
+                        </motion.div>
+                    )}
                 </div>
 
-                {/* Summary Cards */}
-                <motion.div
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    className="grid grid-cols-3 gap-3"
-                >
-                    <SummaryCard label="รายรับ" value={data.summary.income} color="emerald" icon={<TrendingUp size={16} />} />
-                    <SummaryCard label="รายจ่าย" value={data.summary.expense} color="rose" icon={<TrendingDown size={16} />} />
-                    <SummaryCard label="คงเหลือ" value={data.summary.net} color="indigo" icon={<Wallet size={16} />} />
-                </motion.div>
-
-                {/* Spending Trend (Line Chart) */}
-                <motion.div
-                    initial={{ opacity: 0, y: 10 }}
-                    animate={{ opacity: 1, y: 0 }}
-                    transition={{ delay: 0.1 }}
-                    className="bg-gray-900/60 rounded-2xl p-4 border border-gray-800/60"
-                >
-                    <h3 className="text-sm font-semibold text-gray-300 mb-4">📈 แนวโน้มรายรับ-รายจ่าย</h3>
-                    <ResponsiveContainer width="100%" height={220}>
-                        <LineChart data={data.trend}>
-                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
-                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
-                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
-                            <Tooltip
-                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: 12 }}
-                                labelStyle={{ color: '#9ca3af' }}
-                                formatter={(value?: number) => formatCurr
... (Diff truncated for size) ...


PR TEMPLATE:
# 📋 Summary
<!-- Brief description of changes for the Mobile Web Platform -->

## ✅ Checklist
- [ ] 🏗️ I have moved the related issue to "In Progress" on the Kanban board

# 🎯 Type
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring
- [ ] 💄 UI/UX Update (Web/Responsive)
- [ ] 📝 Documentation
- [ ] 💥 Breaking change

# 📱 Responsive Design Checks
- [ ] Mobile View Verified
- [ ] Tablet/Desktop View Verified
- [ ] Cross-browser Check (Chrome, Safari, Firefox)

# 📝 Changes
<!-- Describe what changed in detail -->

# 📸 UI/UX Screenshots
<!-- Mobile & Desktop Comparisons. MUST include screenshots for UI changes. -->

# 🧪 Testing
- [ ] Start command: `npm run dev` working
- [ ] Build command: `npm run build` passing

# 🚀 Migration/Deployment
- [ ] Environment variables updated
- [ ] Dependencies installed

```bash
# Migration commands if applicable
```

# 🔗 Related Issues
<!-- Link to related issues or PRs using FULL URL e.g. https://github.com/oatrice/JarWise-Root/issues/1 -->
- Closes #
- Related to #
- Fixes #

**Breaking Changes**: <!-- Yes/No -->
**Migration Required**: <!-- Yes/No -->


INSTRUCTIONS:
1. Generate a comprehensive PR description in Markdown format.
2. If a template is provided, fill it out intelligently.
3. If no template, use a standard structure: Summary, Changes, Impact.
4. Focus on 'Why' and 'What'.
5. Do not include 'Here is the PR description' preamble. Just the body.
6. IMPORTANT: Always use the exact FULL URL for closing issues. You must write `Closes https://github.com/oatrice/JarWise-Root/issues/59`. Do NOT use short syntax (e.g., #123) and do not invent an owner/repo.
