# PR Draft Prompt

You are an AI assistant helping to create a Pull Request description.
    
TASK: [Feature] Report Filter: Multi-Select Categories & Accounts
ISSUE: {
  "title": "[Feature] Report Filter: Multi-Select Categories & Accounts",
  "number": 68,
  "body": "# \ud83c\udfaf Objective\nEnable users to filter reports and charts by selecting specific categories (Jars) and accounts (Wallets) via multi-select checkboxes.\n\n## \ud83d\udcdd Specifications\n\n### UI Components\n- [ ] **Filter Panel**: Collapsible sidebar or modal with checkbox tree\n- [ ] **Category Checkboxes**: Select/deselect individual Jars (including sub-jars if HIER-01 is done)\n- [ ] **Account Checkboxes**: Select/deselect individual Wallets (including sub-wallets if HIER-01 is done)\n- [ ] **Select All / Clear All**: Quick actions\n- [ ] **Remember Selection**: Persist filter state per session or per report type\n\n### Behavior\n- [ ] **Real-time Update**: Charts/reports update as checkboxes change (or Apply button)\n- [ ] **Count Display**: Show number of transactions matching current filter\n- [ ] **Visual Indicator**: Badge showing active filter count\n\n## \ud83d\udd17 References\n- Depends on #67 (Hierarchical Accounts & Categories) for sub-item support\n- Related to #59 (Reports & Data Export)\n- Feature ID: `REPORT-02`\n\n## \ud83c\udfd7\ufe0f Technical Notes\n- Use bitmasking or array-based filtering on transaction queries\n- Consider performance with large transaction sets (pagination/lazy load)"
}

GIT CONTEXT:
COMMITS:
c20c890 docs: update changelog and readme for v0.12.0 transaction filters
5c31278 test: add unit tests for sub-transaction storage service
feb4092 Document code_review.md per project
c8dcfa6 Wrap TransactionCard tests with USD
62fa056 Add report filters to transaction

STATS:
CHANGELOG.md                                |   6 +
 README.md                                   |   3 +
 code_review.md                              |  69 ++---------
 package.json                                |   2 +-
 src/__tests__/ReportFiltersSheet.test.tsx   | 186 ++++++++++++++++++++++++++++
 src/__tests__/TransactionCard.test.tsx      |  20 ++-
 src/__tests__/mockDataIntegration.test.ts   |   4 +-
 src/__tests__/subTransactionStorage.test.ts | 111 +++++++++++++++++
 src/__tests__/transactionValidation.test.ts |  13 ++
 src/components/MultiSelectDropdown.tsx      | 119 ++++++++++++++++++
 src/components/ReportFiltersSheet.tsx       | 123 ++++++++++++++++++
 src/components/TransactionCard.test.tsx     |  17 ++-
 src/pages/TransactionHistory.tsx            |  58 +++++++--
 src/setupTests.ts                           |  28 +++++
 src/utils/generatedMockData.ts              |  93 +++++---------
 src/utils/subTransactionStorage.ts          |  65 ++++++++++
 16 files changed, 774 insertions(+), 143 deletions(-)

KEY FILE DIFFS:
diff --git a/src/__tests__/ReportFiltersSheet.test.tsx b/src/__tests__/ReportFiltersSheet.test.tsx
new file mode 100644
index 0000000..9568f0e
--- /dev/null
+++ b/src/__tests__/ReportFiltersSheet.test.tsx
@@ -0,0 +1,186 @@
+import { fireEvent, render, screen, within } from '@testing-library/react';
+import { beforeEach, describe, expect, it, vi } from 'vitest';
+import ReportFiltersSheet from '../components/ReportFiltersSheet';
+
+vi.mock('framer-motion', () => ({
+    motion: {
+        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
+            <div {...props}>{children}</div>
+        ),
+    },
+    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
+}));
+
+const jarOptions = [
+    { id: 'jar-1', name: 'Jar One' },
+    { id: 'jar-2', name: 'Jar Two' },
+];
+
+const walletOptions = [
+    { id: 'wallet-1', name: 'Wallet One' },
+    { id: 'wallet-2', name: 'Wallet Two' },
+];
+
+const getDropdownButton = (label: string) => {
+    const labelNode = screen.getByText(label);
+    const wrapper = labelNode.parentElement;
+    if (!wrapper) {
+        throw new Error(`Missing wrapper for ${label} dropdown`);
+    }
+    const button = wrapper.querySelector('button');
+    if (!button) {
+        throw new Error(`Missing button for ${label} dropdown`);
+    }
+    return button;
+};
+
+const getDropdownContainer = (placeholder: string) => {
+    const searchInput = screen.getByPlaceholderText(placeholder);
+    const dropdownContainer = searchInput.closest('div')?.parentElement;
+    if (!dropdownContainer) {
+        throw new Error(`Missing dropdown container for ${placeholder}`);
+    }
+    return dropdownContainer;
+};
+
+const getOptionButton = (optionName: string, placeholder: string) => {
+    const dropdownContainer = getDropdownContainer(placeholder);
+    const optionLabel = within(dropdownContainer).getByText(optionName);
+    const button = optionLabel.closest('button');
+    if (!button) {
+        throw new Error(`Missing option button for ${optionName}`);
+    }
+    return button;
+};
+
+describe('ReportFiltersSheet', () => {
+    beforeEach(() => {
+        vi.clearAllMocks();
+    });
+
+    it('discard draft changes when closed without applying', () => {
+        const onApply = vi.fn();
+        const onClose = vi.fn();
+
+        const { rerender } = render(
+            <ReportFiltersSheet
+                open
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={['wallet-1']}
+                onApply={onApply}
+                onClose={onClose}
+            />
+        );
+
+        fireEvent.click(getDropdownButton('Jars'));
+        fireEvent.click(getOptionButton('Jar One', 'Search Jars'));
+        fireEvent.click(getOptionButton('Jar Two', 'Search Jars'));
+
+        fireEvent.click(screen.getByRole('button', { name: /close filters/i }));
+        expect(onApply).not.toHaveBeenCalled();
+
+        rerender(
+            <ReportFiltersSheet
+                open={false}
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={['wallet-1']}
+                onApply={onApply}
+                onClose={onClose}
+            />
+        );
+
+        rerender(
+            <ReportFiltersSheet
+                open
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={['wallet-1']}
+                onApply={onApply}
+                onClose={onClose}
+            />
+        );
+
+        fireEvent.click(getDropdownButton('Jars'));
+        const jarOneCheckbox = within(getOptionButton('Jar One', 'Search Jars')).getByRole('checkbox');
+        const jarTwoCheckbox = within(getOptionButton('Jar Two', 'Search Jars')).getByRole('checkbox');
+
+        expect(jarOneCheckbox).toBeChecked();
+        expect(jarTwoCheckbox).not.toBeChecked();
+    });
+
+    it('clears all filters then applies empty selections', () => {
+        const onApply = vi.fn();
+
+        render(
+            <ReportFiltersSheet
+                open
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={['wallet-2']}
+                onApply={onApply}
+                onClose={vi.fn()}
+            />
+        );
+
+        fireEvent.click(screen.getByRole('button', { name: /clear/i }));
+        fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
+
+        expect(onApply).toHaveBeenCalledWith([], []);
+    });
+
+    it('reopens with the latest applied filters', () => {
+        const onApply = vi.fn();
+
+        const { rerender } = render(
+            <ReportFiltersSheet
+                open
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={[]}
+                selectedWalletIds={[]}
+                onApply={onApply}
+                onClose={vi.fn()}
+            />
+        );
+
+        fireEvent.click(getDropdownButton('Jars'));
+        fireEvent.click(getOptionButton('Jar One', 'Search Jars'));
+        fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
+
+        expect(onApply).toHaveBeenCalledWith(['jar-1'], []);
+
+        rerender(
+            <ReportFiltersSheet
+                open={false}
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={[]}
+                onApply={onApply}
+                onClose={vi.fn()}
+            />
+        );
+
+        rerender(
+            <ReportFiltersSheet
+                open
+                jarOptions={jarOptions}
+                walletOptions={walletOptions}
+                selectedJarIds={['jar-1']}
+                selectedWalletIds={[]}
+                onApply={onApply}
+                onClose={vi.fn()}
+            />
+        );
+
+        fireEvent.click(getDropdownButton('Jars'));
+        const jarOneCheckbox = within(getOptionButton('Jar One', 'Search Jars')).getByRole('checkbox');
+        expect(jarOneCheckbox).toBeChecked();
+    });
+});
diff --git a/src/__tests__/TransactionCard.test.tsx b/src/__tests__/TransactionCard.test.tsx
index 6f80bb9..e1ab5d4 100644
--- a/src/__tests__/TransactionCard.test.tsx
+++ b/src/__tests__/TransactionCard.test.tsx
@@ -1,7 +1,11 @@
 import { render, screen } from '@testing-library/react';
-import { describe, it, expect, vi } from 'vitest';
+import { beforeEach, describe, it, expect, vi } from 'vitest';
 import TransactionCard from '../components/TransactionCard';
 import type { Transaction } from '../utils/transactionStorage';
+import { CurrencyProvider } from '../context/CurrencyContext';
+
+const renderWithProviders = (ui: React.ReactElement) =>
+    render(<CurrencyProvider>{ui}</CurrencyProvider>);
 
 // Mock getJarDetails
 vi.mock('../utils/constants', () => ({
@@ -23,8 +27,12 @@ describe('TransactionCard', () => {
         type: 'expense'
     };
 
+    beforeEach(() => {
+        localStorage.setItem('settings.currency', 'USD');
+    });
+
     it('renders Note as the main title', () => {
-        render(<TransactionCard transaction={mockTransaction} />);
+        renderWithProviders(<TransactionCard transaction={mockTransaction} />);
 
         // The title should be the Note ("Grocery Shopping")
         const title = screen.getByRole('heading', { level: 4 });
@@ -32,7 +40,7 @@ describe('TransactionCard', () => {
     });
 
     it('renders Jar Name as the subtitle when note exists', () => {
-        render(<TransactionCard transaction={mockTransaction} />);
+        renderWithProviders(<TransactionCard transaction={mockTransaction} />);
 
         // The Jar Name should be visible but NOT as the title
         expect(screen.getByText('Necessities')).toBeInTheDocument();
@@ -42,7 +50,7 @@ describe('TransactionCard', () => {
 
     it('renders Jar Name as title if note is empty', () => {
         const noNoteTransaction = { ...mockTransaction, note: '' };
-        render(<TransactionCard transaction={noNoteTransaction} />);
+        renderWithProviders(<TransactionCard transaction={noNoteTransaction} />);
 
         // Title should fallback to Jar Name
         const title = screen.getByRole('heading', { level: 4 });
@@ -51,7 +59,7 @@ describe('TransactionCard', () => {
 
     it('renders expense amount without - sign and in red', () => {
         const expenseTx = { ...mockTransaction, type: 'expense' as const, amount: 15.00 };
-        render(<TransactionCard transaction={expenseTx} />);
+        renderWithProviders(<TransactionCard transaction={expenseTx} />);
 
         // Should display $15.00, NOT -$15.00
         const amountText = screen.getByText('$15.00');
@@ -64,7 +72,7 @@ describe('TransactionCard', () => {
 
     it('renders income amount without + sign and in green', () => {
         const incomeTx = { ...mockTransaction, type: 'income' as const, amount: 500.00 };
-        render(<TransactionCard transaction={incomeTx} />);
+        renderWithProviders(<TransactionCard transaction={incomeTx} />);
 
         // Should display $500.00, NOT +$500.00
         const amountText = screen.getByText('$500.00');
diff --git a/src/__tests__/mockDataIntegration.test.ts b/src/__tests__/mockDataIntegration.test.ts
index 6e5d7e2..7f35c55 100644
--- a/src/__tests__/mockDataIntegration.test.ts
+++ b/src/__tests__/mockDataIntegration.test.ts
@@ -35,11 +35,11 @@ describe('Generated Mock Data Integration', () => {
 
     it('should have LucideIcon type for jar icons', () => {
         const firstJar = jars[0];
-        expect(typeof firstJar.icon).toBe('function');
+        expect(['function', 'object']).toContain(typeof firstJar.icon);
     });
 
     it('should have LucideIcon type for transaction icons', () => {
         const firstTransaction = transactions[0];
-        expect(typeof firstTransaction.icon).toBe('function');
+        expect(['function', 'object']).toContain(typeof firstTransaction.icon);
     });
 });
diff --git a/src/__tests__/subTransactionStorage.test.ts b/src/__tests__/subTransactionStorage.test.ts
new file mode 100644
index 0000000..de89bf5
--- /dev/null
+++ b/src/__tests__/subTransactionStorage.test.ts
@@ -0,0 +1,111 @@
+/**
+ * @vitest-environment jsdom
+ */
+import { describe, it, expect, beforeEach, vi } from 'vitest';
+
+// Functions to be implemented
+import {
+    getSubTransactions,
+    saveSubTransaction,
+    deleteSubTransaction,
+    getSubTransactionsByParentId,
+    type SubTransaction,
+} from '../utils/subTransactionStorage';
+
+describe('SubTransaction Storage Service', () => {
+    beforeEach(() => {
+        // Clear localStorage before each test
+        localStorage.clear();
+    });
+
+    describe('saveSubTransaction', () => {
+        it('should save a new sub-transaction', () => {
+            const newSubTx: SubTransaction = {
+                id: 'sub-1',
+                parentId: 'tx-1',
+                description: 'Milk',
+                amount: 45.0,
+                // category is optional
+            };
+
+            saveSubTransaction(newSubTx);
+
+            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
+            expect(stored).toHaveLength(1);
+            expect(stored[0]).toEqual(newSubTx);
+        });
+
+        it('should append to existing sub-transactions', () => {
+            const existingSubTx: SubTransaction = {
+                id: 'sub-1',
+                parentId: 'tx-1',
+                description: 'Milk',
+                amount: 45.0,
+            };
+            localStorage.setItem('jarwise_sub_transactions', JSON.stringify([existingSubTx]));
+
+            const newSubTx: SubTransaction = {
+                id: 'sub-2',
+                parentId: 'tx-1',
+                description: 'Bread',
+                amount: 35.0,
+            };
+
+            saveSubTransaction(newSubTx);
+
+            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
+            expect(stored).toHaveLength(2);
+        });
+    });
+
+    describe('getSubTransactions', () => {
+        it('should return all sub-transactions', () => {
+            const mockData: SubTransaction[] = [
+                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
+                { id: 'sub-2', parentId: 'tx-2', description: 'Item 2', amount: 20 },
+            ];
+            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));
+
+            const result = getSubTransactions();
+            expect(result).toEqual(mockData);
+        });
+
+        it('should return empty array if storage is empty', () => {
+            const result = getSubTransactions();
+            expect(result).toEqual([]);
+        });
+    });
+
+    describe('getSubTransactionsByParentId', () => {
+        it('should return only sub-transactions for the given parent ID', () => {
+            const mockData: SubTransaction[] = [
+                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
+                { id: 'sub-2', parentId: 'tx-2', description: 'Item 2', amount: 20 },
+                { id: 'sub-3', parentId: 'tx-1', description: 'Item 3', amount: 30 },
+            ];
+            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));
+
+            const result = getSubTransactionsByParentId('tx-1');
+            expect(result).toHaveLength(2);
+            expect(result.map(i => i.id)).toContain('sub-1');
+            expect(result.map(i => i.id)).toContain('sub-3');
+            expect(result.map(i => i.id)).not.toContain('sub-2');
+        });
+    });
+
+    describe('deleteSubTransaction', () => {
+        it('should remove the specified sub-transaction', () => {
+            const mockData: SubTransaction[] = [
+                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
+                { id: 'sub-2', parentId: 'tx-1', description: 'Item 2', amount: 20 },
+            ];
+            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));
+
+            deleteSubTransaction('sub-1');
+
+            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
+            expect(stored).toHaveLength(1);
+            expect(stored[0].id).toBe('sub-2');
+        });
+    });
+});
diff --git a/src/__tests__/transactionValidation.test.ts b/src/__tests__/transactionValidation.test.ts
index 5cd63a6..646e513 100644
--- a/src/__tests__/transactionValidation.test.ts
+++ b/src/__tests__/transactionValidation.test.ts
@@ -15,6 +15,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -26,6 +27,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '0',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -37,6 +39,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '-100',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -48,6 +51,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: 'abc',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -59,6 +63,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -70,6 +75,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '99.99',
                 jarId: 'necessities',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -83,6 +89,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: null,
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -94,6 +101,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: '',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -105,6 +113,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: 'education',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -118,6 +127,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: 'savings',
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -128,6 +138,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '100',
                 jarId: 'savings',
+                walletId: 'wallet-1',
                 note: 'Lunch expense',
             });
 
@@ -140,6 +151,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '',
                 jarId: null,
+                walletId: 'wallet-1',
                 note: '',
             });
 
@@ -152,6 +164,7 @@ describe('Transaction Validation', () => {
             const result = validateTransaction({
                 amount: '500.50',
                 jarId: 'play',
+                walletId: 'wallet-1',
                 note: 'Movie night',
             });
 
diff --git a/src/components/MultiSelectDropdown.tsx b/src/components/MultiSelectDropdown.tsx
new file mode 100644
index 0000000..cbad637
--- /dev/null
+++ b/src/components/MultiSelectDropdown.tsx
@@ -0,0 +1,119 @@
+import { useEffect, useMemo, useRef, useState } from 'react';
+import { ChevronDown, Search } from 'lucide-react';
+
+export type MultiSelectOption = {
+    id: string;
+    name: string;
+    meta?: string;
+};
+
+interface MultiSelectDropdownProps {
+    label: string;
+    options: MultiSelectOption[];
+    selectedIds: string[];
+    onChange: (ids: string[]) => void;
+    placeholder?: string;
+}
+
+export default function MultiSelectDropdown({
+    label,
+    options,
+    selectedIds,
+    onChange,
+    placeholder,
+}: MultiSelectDropdownProps) {
+    const [isOpen, setIsOpen] = useState(false);
+    const [searchTerm, setSearchTerm] = useState('');
+    const wrapperRef = useRef<HTMLDivElement | null>(null);
+
+    useEffect(() => {
+        const handleClickOutside = (event: MouseEvent) => {
+            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
+                setIsOpen(false);
+            }
+        };
+        document.addEventListener('mousedown', handleClickOutside);
+        return () => document.removeEventListener('mousedown', handleClickOutside);
+    }, []);
+
+    const filteredOptions = useMemo(() => {
+        const term = searchTerm.trim().toLowerCase();
+        if (!term) return options;
+        return options.filter((option) 
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
6. IMPORTANT: Always use FULL URLs for links to issues and other PRs (e.g., https://github.com/owner/repo/issues/123), do NOT use short syntax (e.g., #123) to ensuring proper linking across platforms.
