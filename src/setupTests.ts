import '@testing-library/jest-dom';

const createLocalStorageMock = () => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
            store[key] = String(value);
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
        get length() {
            return Object.keys(store).length;
        },
    };
};

if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage?.getItem !== 'function') {
    Object.defineProperty(globalThis, 'localStorage', {
        value: createLocalStorageMock(),
        configurable: true,
    });
}
