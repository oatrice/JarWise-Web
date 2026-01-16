import { motion } from 'framer-motion';
import type { Jar } from '../utils/generatedMockData';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface JarCardProps {
    jar: Jar;
    index: number;
}

export default function JarCard({ jar, index }: JarCardProps) {
    const Icon = jar.icon;
    const progress = Math.min((jar.current / jar.goal) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={twMerge(
                "relative overflow-hidden rounded-[2rem] bg-gray-900/50 border border-gray-800 p-5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl",
                // jar.bgGlow // using inline style or shadow util might be better if pre-defined
            )}
            style={{
                boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.2)`
            }}
        >
            {/* Glow/Gradient blobs */}
            <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20 blur-[50px] ${jar.shadowColor}`} />
            <div className={`absolute -left-6 -bottom-6 h-24 w-24 rounded-full opacity-10 blur-[40px] ${jar.shadowColor}`} />

            <div className="relative z-10 flex flex-col h-full justify-between gap-5">
                <div className="flex items-start justify-between">
                    <div className={clsx("p-3 rounded-2xl bg-gray-800/80 backdrop-blur-md border border-gray-700/50", jar.color)}>
                        <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <button className="group flex items-center justify-center h-8 w-8 rounded-full bg-gray-800/50 hover:bg-white text-gray-400 hover:text-black transition-all duration-300">
                        <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
                    </button>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-100 tracking-wide">{jar.name}</h3>
                        {index === 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-0.5 border border-yellow-500/30">
                                <Sparkles size={10} className="text-yellow-400" />
                                <span className="text-[10px] font-bold text-yellow-200">PRIORITY</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-white tracking-tight">${jar.current.toLocaleString()}</span>
                        <span className="text-xs font-medium text-gray-500">/ ${jar.goal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Level {jar.level}</span>
                        <span className={jar.color}>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800/80 border border-gray-700/30">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 1.2, type: "spring", bounce: 0 }}
                            className={`h-full rounded-full ${jar.barColor}`}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
