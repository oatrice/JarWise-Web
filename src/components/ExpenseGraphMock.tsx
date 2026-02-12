import React, { useState } from 'react';

type Period = 'weekly' | 'monthly' | 'yearly';

const ExpenseGraphMock: React.FC = () => {
    const [period, setPeriod] = useState<Period>('monthly');

    // Mock Data for visualization
    const mockData = {
        weekly: [
            { label: 'Mon', value: 120 },
            { label: 'Tue', value: 300 },
            { label: 'Wed', value: 450 },
            { label: 'Thu', value: 200 },
            { label: 'Fri', value: 600 },
            { label: 'Sat', value: 800 },
            { label: 'Sun', value: 150 },
        ],
        monthly: [
            { label: 'Jan', value: 2000 },
            { label: 'Feb', value: 1800 },
            { label: 'Mar', value: 2200 },
            { label: 'Apr', value: 2500 },
            { label: 'May', value: 2100 },
            { label: 'Jun', value: 1900 },
        ],
        yearly: [
            { label: '2021', value: 24000 },
            { label: '2022', value: 28000 },
            { label: '2023', value: 32000 },
        ]
    };

    const currentData = mockData[period];
    const maxValue = Math.max(...currentData.map(d => d.value));

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Expense Trends</h3>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                {(['weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize ${period === p
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Graph Area */}
            <div className="h-48 flex items-end space-x-4">
                {currentData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full flex items-end justify-center h-40">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                                {item.label}: ฿{item.value.toLocaleString()}
                            </div>

                            {/* Bar */}
                            <div
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                                className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative overflow-hidden transition-all duration-500 hover:bg-blue-200 dark:hover:bg-blue-800/40"
                            >
                                <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 h-full opacity-80" />
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 mt-2 truncate max-w-full">{item.label}</span>
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4 italic">
                (Mock Data for Visualization - Issue #84 created for real implementation)
            </p>
        </div>
    );
};

export default ExpenseGraphMock;
