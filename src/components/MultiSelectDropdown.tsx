import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export type MultiSelectOption = {
    id: string;
    name: string;
    meta?: string;
};

interface MultiSelectDropdownProps {
    label: string;
    options: MultiSelectOption[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
}

export default function MultiSelectDropdown({
    label,
    options,
    selectedIds,
    onChange,
    placeholder,
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return options;
        return options.filter((option) => option.name.toLowerCase().includes(term));
    }, [options, searchTerm]);

    const selectionSummary = useMemo(() => {
        if (selectedIds.length === 0) return placeholder ?? `Select ${label}`;
        if (selectedIds.length === 1) {
            const match = options.find((opt) => opt.id === selectedIds[0]);
            return match?.name ?? '1 selected';
        }
        if (selectedIds.length === options.length) return `All ${label}`;
        return `${selectedIds.length} selected`;
    }, [label, options, placeholder, selectedIds]);

    const toggleOption = (id: string) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter((item) => item !== id)
            : [...selectedIds, id];
        onChange(next);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 text-left text-sm text-gray-200 transition hover:border-gray-700"
            >
                <span className={selectedIds.length === 0 ? 'text-gray-500' : ''}>{selectionSummary}</span>
                <ChevronDown size={18} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-gray-800 px-3 py-2 text-gray-400">
                        <Search size={14} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder={`Search ${label}`}
                            className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                        {filteredOptions.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                        )}
                        {filteredOptions.map((option) => {
                            const isSelected = selectedIds.includes(option.id);
                            return (
                                <button
                                    type="button"
                                    key={option.id}
                                    onClick={() => toggleOption(option.id)}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-900/70"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                        className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-500"
                                    />
                                    <div>
                                        <div className="font-medium">{option.name}</div>
                                        {option.meta && <div className="text-xs text-gray-500">{option.meta}</div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
