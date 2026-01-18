import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CurrencyCode = 'THB' | 'USD' | 'EUR' | 'JPY' | 'GBP';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'settings.currency';

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    // Initialize from localStorage or default to 'THB'
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        // Basic validation to ensure saved value is a valid CurrencyCode
        if (saved && ['THB', 'USD', 'EUR', 'JPY', 'GBP'].includes(saved)) {
            return saved as CurrencyCode;
        }
        return 'THB';
    });

    useEffect(() => {
        localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }, [currency]);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
