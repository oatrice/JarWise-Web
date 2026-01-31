import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Palette, Type, Percent, RotateCcw, Save, Check, Plus } from 'lucide-react';
import { Home, DollarSign, Gamepad2, GraduationCap, Plane, Heart, Briefcase, PiggyBank, type LucideIcon } from 'lucide-react';
import { jars as initialJars, type Jar } from '../utils/generatedMockData';

// Available icons for selection
const AVAILABLE_ICONS: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dollar', icon: DollarSign, label: 'Dollar' },
    { id: 'gamepad', icon: Gamepad2, label: 'Gaming' },
    { id: 'graduation', icon: GraduationCap, label: 'Education' },
    { id: 'plane', icon: Plane, label: 'Travel' },
    { id: 'heart', icon: Heart, label: 'Heart' },
    { id: 'briefcase', icon: Briefcase, label: 'Work' },
    { id: 'piggy', icon: PiggyBank, label: 'Savings' },
];

// Available colors
const AVAILABLE_COLORS = [
    { id: 'blue', color: 'text-blue-400', bg: 'bg-blue-500', bar: 'bg-blue-500' },
    { id: 'green', color: 'text-green-400', bg: 'bg-green-500', bar: 'bg-green-500' },
    { id: 'pink', color: 'text-pink-400', bg: 'bg-pink-500', bar: 'bg-pink-500' },
    { id: 'yellow', color: 'text-yellow-400', bg: 'bg-yellow-500', bar: 'bg-yellow-500' },
    { id: 'purple', color: 'text-purple-400', bg: 'bg-purple-500', bar: 'bg-purple-500' },
    { id: 'red', color: 'text-red-400', bg: 'bg-red-500', bar: 'bg-red-500' },
    { id: 'cyan', color: 'text-cyan-400', bg: 'bg-cyan-500', bar: 'bg-cyan-500' },
    { id: 'orange', color: 'text-orange-400', bg: 'bg-orange-500', bar: 'bg-orange-500' },
];

// Default jar configuration
const DEFAULT_JARS = [
    { name: 'Necessities', percentage: 55 },
    { name: 'Financial Freedom', percentage: 10 },
    { name: 'Play', percentage: 10 },
    { name: 'Education', percentage: 10 },
    { name: 'Long-term Savings', percentage: 10 },
    { name: 'Give', percentage: 5 },
];

interface EditableJar extends Jar {
    percentage: number;
    children?: EditableJar[];
}

interface ManageJarsProps {
    onClose: () => void;
}

export default function ManageJars({ onClose }: ManageJarsProps) {
    const [jars, setJars] = useState<EditableJar[]>(
        initialJars.map((jar, i) => ({
            ...jar,
            percentage: DEFAULT_JARS[i]?.percentage || 10,
        }))
    );
    const [selectedJarId, setSelectedJarId] = useState<string | null>(null);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<EditableJar | null>(null);

    const totalPercentage = jars.reduce((sum, jar) => sum + jar.percentage, 0);
    const isValid = totalPercentage === 100;

    const updateJar = (id: string, updates: Partial<EditableJar>) => {
        setJars((prev) =>
            prev.map((jar) => (jar.id === id ? { ...jar, ...updates } : jar))
        );
    };

    const handleReset = () => {
        setJars(
            initialJars.map((jar, i) => ({
                ...jar,
                percentage: DEFAULT_JARS[i]?.percentage || 10,
                children: [] // Reset children
            }))
        );
        setShowConfirmReset(false);
        setSelectedJarId(null);
    };

    // --- Hierarchy Logic ---
    const buildTree = (items: EditableJar[]) => {
        // Deep copy items to avoid mutating state directly during map construction
        const itemMap = new Map(items.map(item => [item.id, { ...item, children: [] as EditableJar[] }]));
        const rootItems: EditableJar[] = [];

        items.forEach(item => {
            const mappedItem = itemMap.get(item.id)!;
            if (item.parentId && itemMap.has(item.parentId)) {
                // Check if parent exists in current set (avoid orphan issues in basic mock)
                itemMap.get(item.parentId)!.children!.push(mappedItem);
            } else {
                rootItems.push(mappedItem);
            }
        });
        return rootItems;
    };

    const handleAddJar = () => {
        // Fix: Parse string IDs to numbers for max calculation
        const newId = jars.length > 0 ? Math.max(...jars.map(j => parseInt(j.id, 10))) + 1 : 1;
        const newJar: EditableJar = {
            id: newId.toString(),
            name: 'New Jar',
            icon: PiggyBank,
            percentage: 0,
            current: 0,
            goal: 0, // Fix: Use 'goal' instead of 'target'
            color: 'text-gray-400',
            barColor: 'bg-gray-400',
            shadowColor: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
            bgGlow: 'bg-gray-400/20',
            userId: 'user_123',
            level: 0,
            parentId: null, // Fix: Use null instead of undefined
            children: []
        };
        setJars([...jars, newJar]);
    };

    const handleAddCategory = (parentId: string) => {
        const parent = jars.find(j => j.id === parentId);
        if (!parent) return;

        // Fix: Parse string IDs to numbers for max calculation
        const newId = jars.length > 0 ? Math.max(...jars.map(j => parseInt(j.id, 10))) + 1 : 1;
        const newCategory: EditableJar = {
            id: newId.toString(),
            name: 'New Category',
            icon: DollarSign,
            percentage: 0,
            current: 0,
            goal: 0, // Fix: Use 'goal' instead of 'target'
            color: parent.color, // Inherit parent color style initially
            barColor: parent.barColor,
            shadowColor: parent.shadowColor,
            bgGlow: parent.bgGlow,
            userId: 'user_123',
            level: (parent.level || 0) + 1,
            parentId: parentId,
            children: []
        };
        setJars([...jars, newCategory]);
    };

    const handleDelete = (jar: EditableJar) => {
        setItemToDelete(jar);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        const idsToDelete = new Set<string>();
        const recursiveCollect = (itemId: string) => {
            idsToDelete.add(itemId);
            jars.filter(j => j.parentId === itemId).forEach(c => recursiveCollect(c.id));
        };
        recursiveCollect(itemToDelete.id);

        setJars(jars.filter(j => !idsToDelete.has(j.id)));
        if (selectedJarId && idsToDelete.has(selectedJarId)) {
            setSelectedJarId(null);
        }
        setItemToDelete(null);
    };

    const handleSave = () => {
        if (!isValid) return;
        // Mock save - in real app would persist to localStorage/backend
        console.log('Saving jars:', jars);
        onClose();
    };

    // Helper to render hierarchical items
    const renderJarItem = (jar: EditableJar, depth = 0) => {
        const Icon = jar.icon;
        const isSelected = selectedJarId === jar.id;
        const hasChildren = jar.children && jar.children.length > 0;

        return (
            <div key={jar.id}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-3 ${depth > 0 ? 'ml-8 relative' : ''}`}
                >
                    {/* Visual Connector Line for children */}
                    {depth > 0 && (
                        <div className="absolute -left-6 top-1/2 w-4 h-[2px] bg-gray-800 rounded-full" />
                    )}
                    {depth > 0 && (
                        <div className="absolute -left-6 -top-4 bottom-1/2 w-[2px] bg-gray-800 rounded-full" />
                    )}

                    <div
                        onClick={() => setSelectedJarId(isSelected ? null : jar.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                            ? 'bg-gray-800/80 border-gray-600'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-3 rounded-xl ${jar.shadowColor} bg-gray-800/80`}
                            >
                                <Icon size={20} className={jar.color} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">
                                    {jar.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-500">
                                        {jar.percentage}% allocation
                                    </p>
                                    {jar.level === 0 ? (
                                        <span className="text-xs bg-gray-800/50 px-2 py-0.5 rounded text-gray-500">
                                            Jar
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-blue-900/30 px-2 py-0.5 rounded text-blue-400">
                                            Category
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full text-sm font-bold ${jar.color} bg-gray-800/80`}
                            >
                                {jar.percentage}%
                            </div>
                        </div>

                        {/* Expanded Edit Panel */}
                        <AnimatePresence>
                            {isSelected && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 mt-4 border-t border-gray-700 space-y-4">
                                        {/* Action Buttons for Hierarchy */}
                                        <div className="flex gap-2 mb-4">
                                            {/* Only allow adding category to Top Level Jars (Level 0) for now */}
                                            {jar.level === 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddCategory(jar.id);
                                                    }}
                                                    className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-blue-400 border border-blue-500/20 transition-colors"
                                                >
                                                    + Add Category
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(jar);
                                                }}
                                                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-red-400 border border-red-900/30 hover:bg-red-900/20 transition-colors"
                                            >
                                                Delete {jar.level === 0 ? 'Jar' : 'Category'}
                                            </button>
                                        </div>

                                        {/* Name Input */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                                                <Type size={14} />
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={jar.name}
                                                onChange={(e) =>
                                                    updateJar(jar.id, {
                                                        name: e.target.value,
                                                    })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-500"
                                                maxLength={50}
                                            />
                                        </div>

                                        {/* Percentage Slider */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                                                <Percent size={14} />
                                                Percentage: {jar.percentage}%
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={jar.percentage}
                                                onChange={(e) =>
                                                    updateJar(jar.id, {
                                                        percentage: parseInt(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full h-2 rounded-full appearance-none bg-gray-800 cursor-pointer"
                                            />
                                        </div>

                                        {/* Color Picker */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                                                <Palette size={14} />
                                                Color
                                            </label>
                                            <div className="flex gap-2 flex-wrap">
                                                {AVAILABLE_COLORS.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateJar(jar.id, {
                                                                color: c.color,
                                                                barColor: c.bar,
                                                                shadowColor: c.bg,
                                                            });
                                                        }}
                                                        className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-transform hover:scale-110`}
                                                    >
                                                        {jar.color === c.color && (
                                                            <Check
                                                                size={16}
                                                                className="text-white"
                                                            />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Icon Picker */}
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                                                Icon
                                            </label>
                                            <div className="flex gap-2 flex-wrap">
                                                {AVAILABLE_ICONS.map((item) => {
                                                    const IconOption = item.icon;
                                                    const isCurrentIcon =
                                                        jar.icon === item.icon;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateJar(jar.id, {
                                                                    icon: item.icon,
                                                                });
                                                            }}
                                                            className={`p-2 rounded-xl border transition-all ${isCurrentIcon
                                                                ? 'border-white bg-gray-700'
                                                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                                }`}
                                                        >
                                                            <IconOption
                                                                size={18}
                                                                className={
                                                                    isCurrentIcon
                                                                        ? 'text-white'
                                                                        : 'text-gray-400'
                                                                }
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Recursive Children Rendering logic moved to map below? No, must be recursive here or manage list outside. 
                   With flatten map buildTree, we render list?
                   Wait, `buildTree` returns nested objects. `renderJarItem` must render its own children recursively.
                */}
                {hasChildren && (
                    <div className="ml-0">
                        {jar.children!.map(child => renderJarItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
        >
            <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 py-4">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-400" />
                            </button>
                            <h1 className="text-xl font-bold text-white">Manage Jars</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowConfirmReset(true)}
                                className="px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!isValid}
                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isValid
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Save size={16} />
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Percentage Indicator */}
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div
                        className={`p-4 rounded-2xl border ${isValid
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-400">
                                Total Allocation
                            </span>
                            <span
                                className={`text-lg font-bold ${isValid ? 'text-green-400' : 'text-red-400'
                                    }`}
                            >
                                {totalPercentage}%
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(totalPercentage, 100)}%` }}
                                className={`h-full rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            />
                        </div>
                        {!isValid && (
                            <p className="text-xs text-red-400 mt-2">
                                {totalPercentage > 100
                                    ? `Over by ${totalPercentage - 100}%`
                                    : `${100 - totalPercentage}% remaining to allocate`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Jar List */}
                <div className="max-w-2xl mx-auto px-4 pb-8 space-y-3">
                    {buildTree(jars).map((jar, index) => renderJarItem(jar))}

                    {/* Add New Jar Button (Mock) */}
                    <button
                        onClick={handleAddJar}
                        className="w-full py-4 rounded-2xl border border-dashed border-gray-800 text-gray-500 font-medium hover:text-white hover:border-gray-600 hover:bg-gray-900/50 transition-all flex items-center justify-center gap-2"
                    >
                        <div className="p-1 rounded bg-gray-800"><Plus size={16} /></div>
                        Add New Jar
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showConfirmReset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowConfirmReset(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm mx-4"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">
                                Reset to Default?
                            </h3>
                            <p className="text-gray-400 mb-6">
                                This will restore all jars to their original names and
                                percentages. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmReset(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Delete Confirmation Modal */}
                {itemToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setItemToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm mx-4"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">
                                Delete {itemToDelete.level === 0 ? 'Jar' : 'Category'}?
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to delete <span className="text-white font-bold">{itemToDelete.name}</span>?
                                {itemToDelete.level === 0 && (
                                    <span className="block mt-2 text-red-400 text-sm">
                                        This will also delete all categories inside it.
                                    </span>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setItemToDelete(null)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
