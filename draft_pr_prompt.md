# PR Draft Prompt

You are an AI assistant helping to create a Pull Request description.
    
TASK: [Feature] Transaction Linking & Transfers
ISSUE: {
  "title": "[Feature] Transaction Linking & Transfers",
  "number": 71
}

GIT CONTEXT:
COMMITS:
7685564 ✨ feat(transactions): Add transfer functionality and transaction details
2dd50d4 🐛 fix(ui): removes transaction type prefix from amount display
75dd8fc 🐛 fix(data): standardize transaction amount handling
df7d689 ✨ feat(ui): add wallet and profile navigation
a84d321 ✨ feat(transactions): add transfer transaction support
afc528a ✨ feat(transactions): add transaction detail view and transfer functionality
97fe86c ✨ feat(migration): add data migration feature

STATS:
.luma_state.json                        |  18 +-
 CHANGELOG.md                            |  11 +
 README.md                               |   4 +-
 code_review.md                          |  69 ++++-
 draft_pr_body.md                        |  97 +++++++
 draft_pr_prompt.md                      | 489 ++++++++++++++++++++++++++++++++
 package.json                            |   2 +-
 src/App.tsx                             |  44 ++-
 src/components/BottomNav.tsx            |  12 +-
 src/components/TransactionCard.test.tsx | 127 +++++++++
 src/components/TransactionCard.tsx      |  38 ++-
 src/components/TransferForm.tsx         | 205 +++++++++++++
 src/pages/AddTransaction.tsx            | 436 ++++++++++++++++------------
 src/pages/Dashboard.tsx                 |  23 +-
 src/pages/TransactionDetail.tsx         | 125 ++++++++
 src/pages/TransactionHistory.tsx        |  58 ++--
 src/utils/constants.ts                  |   4 +
 src/utils/generatedMockData.ts          |  16 +-
 src/utils/transactionStorage.ts         |  35 ++-
 src/utils/transferUtils.test.ts         | 131 +++++++++
 20 files changed, 1674 insertions(+), 270 deletions(-)

KEY FILE DIFFS:
diff --git a/src/App.tsx b/src/App.tsx
index d61151a..4c15189 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -3,23 +3,33 @@ import Dashboard from './pages/Dashboard';
 import TransactionHistory from './pages/TransactionHistory';
 import AddTransaction from './pages/AddTransaction';
 import LoginScreen from './pages/LoginScreen';
+import TransactionDetail from './pages/TransactionDetail';
+import ManageWallets from './pages/ManageWallets';
 import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';
 
 import MigrationUploadScreen from './pages/MigrationUploadScreen';
 import MigrationStatusScreen from './pages/MigrationStatusScreen';
 
-type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'login' | 'migration-upload' | 'migration-status';
+type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'login' | 'migration-upload' | 'migration-status' | 'transaction-detail' | 'wallets' | 'profile';
 
 function App() {
-  const [currentPage, setCurrentPage] = useState<Page>('login');  // Start with login for testing
+  const [currentPage, setCurrentPage] = useState<Page>('login');
   const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
+  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
 
   const navigateTo = (page: Page) => {
     setCurrentPage(page);
   };
 
-  const handleSaveTransaction = (tx: Transaction) => {
-    saveTransaction(tx);
+  const handleTransactionClick = (id: string) => {
+    setSelectedTransactionId(id);
+    setCurrentPage('transaction-detail');
+  };
+
+  const handleSaveTransaction = (tx?: Transaction) => {
+    if (tx) {
+      saveTransaction(tx);
+    }
     setTransactions(getTransactions()); // Refresh from storage
     navigateTo('dashboard');
   };
@@ -30,10 +40,19 @@ function App() {
         <LoginScreen onSignIn={() => navigateTo('dashboard')} />
       )}
       {currentPage === 'dashboard' && (
-        <Dashboard onNavigate={navigateTo} transactions={transactions} />
+        <Dashboard
+          onNavigate={navigateTo}
+          transactions={transactions}
+          onTransactionClick={handleTransactionClick}
+        />
       )}
       {currentPage === 'history' && (
-        <TransactionHistory onBack={() => navigateTo('dashboard')} onNavigate={navigateTo} transactions={transactions} />
+        <TransactionHistory
+          onBack={() => navigateTo('dashboard')}
+          onNavigate={navigateTo}
+          transactions={transactions}
+          onTransactionClick={handleTransactionClick}
+        />
       )}
       {currentPage === 'add-transaction' && (
         <AddTransaction
@@ -53,6 +72,19 @@ function App() {
           onDone={() => navigateTo('dashboard')}
         />
       )}
+      {currentPage === 'transaction-detail' && selectedTransactionId && (
+        <TransactionDetail
+          transactionId={selectedTransactionId}
+          allTransactions={transactions}
+          onBack={() => navigateTo('history')}
+          onNavigateLinked={(id) => handleTransactionClick(id)}
+        />
+      )}
+      {currentPage === 'wallets' && (
+        <ManageWallets
+          onClose={() => navigateTo('dashboard')}
+        />
+      )}
     </>
   );
 }
diff --git a/src/components/BottomNav.tsx b/src/components/BottomNav.tsx
index 121defd..2f7f8d1 100644
--- a/src/components/BottomNav.tsx
+++ b/src/components/BottomNav.tsx
@@ -1,7 +1,7 @@
 import { motion } from 'framer-motion';
 import { LayoutGrid, History, Plus, Wallet, User } from 'lucide-react';
 
-type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction';
+type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'wallets' | 'profile';
 
 interface BottomNavProps {
     activePage: Page;
@@ -36,10 +36,16 @@ export default function BottomNav({ activePage, onNavigate, visible = true }: Bo
                 >
                     <Plus size={28} />
                 </button>
-                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
+                <button
+                    onClick={() => onNavigate('wallets')}
+                    className={`flex flex-col items-center gap-1 ${activePage === 'wallets' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
+                >
                     <Wallet size={24} />
                 </button>
-                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
+                <button
+                    onClick={() => onNavigate('profile')}
+                    className={`flex flex-col items-center gap-1 ${activePage === 'profile' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
+                >
                     <User size={24} />
                 </button>
             </div>
diff --git a/src/components/TransactionCard.test.tsx b/src/components/TransactionCard.test.tsx
new file mode 100644
index 0000000..f289ee1
--- /dev/null
+++ b/src/components/TransactionCard.test.tsx
@@ -0,0 +1,127 @@
+import { describe, it, expect } from 'vitest';
+import { render, screen } from '@testing-library/react';
+import TransactionCard from './TransactionCard';
+import type { Transaction } from '../utils/transactionStorage';
+import { CurrencyProvider } from '../context/CurrencyContext';
+
+// Wrapper to provide CurrencyContext
+const renderWithProviders = (ui: React.ReactElement) => {
+    return render(
+        <CurrencyProvider>
+            {ui}
+        </CurrencyProvider>
+    );
+};
+
+describe('TransactionCard', () => {
+    const baseTransaction: Transaction = {
+        id: 'tx-1',
+        amount: 1000,
+        jarId: 'necessities',
+        walletId: 'wallet-1',
+        note: 'Grocery shopping',
+        date: '2026-02-04T10:00:00Z',
+        type: 'expense',
+    };
+
+    const linkedTransaction: Transaction = {
+        id: 'tx-2',
+        amount: 1000,
+        jarId: 'transfer',
+        walletId: 'wallet-2',
+        note: 'Transfer from Cash',
+        date: '2026-02-04T10:00:00Z',
+        type: 'income',
+        relatedTransactionId: 'tx-1',
+    };
+
+    const transferTransaction: Transaction = {
+        ...baseTransaction,
+        id: 'tx-3',
+        jarId: 'transfer',
+        note: 'Transfer to Bank',
+        relatedTransactionId: 'tx-2',
+    };
+
+    describe('Normal Transaction Rendering', () => {
+        it('renders note as title for normal expense', () => {
+            renderWithProviders(<TransactionCard transaction={baseTransaction} />);
+            expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
+        });
+
+        it('renders amount with minus sign for expense', () => {
+            renderWithProviders(<TransactionCard transaction={baseTransaction} />);
+            // Amount should contain the formatted value with minus
+            expect(screen.getByText(/-.*1,000/)).toBeInTheDocument();
+        });
+
+        it('renders amount with plus sign for income', () => {
+            const incomeTransaction: Transaction = {
+                ...baseTransaction,
+                type: 'income',
+                note: 'Salary',
+            };
+            renderWithProviders(<TransactionCard transaction={incomeTransaction} />);
+            expect(screen.getByText(/\+.*1,000/)).toBeInTheDocument();
+        });
+    });
+
+    describe('Transfer Rendering (isTransfer=true)', () => {
+        it('renders "From → To" title when linkedTransaction is provided', () => {
+            renderWithProviders(
+                <TransactionCard
+                    transaction={transferTransaction}
+                    isTransfer={true}
+                    linkedTransaction={linkedTransaction}
+                />
+            );
+            // Should show wallet names: Cash → Bank Account
+            expect(screen.getByText(/Cash.*→.*Bank Account/)).toBeInTheDocument();
+        });
+
+        it('renders "Transfer from [Wallet]" when no linkedTransaction', () => {
+            renderWithProviders(
+                <TransactionCard
+                    transaction={transferTransaction}
+                    isTransfer={true}
+                />
+            );
+            expect(screen.getByText(/Transfer from Cash/)).toBeInTheDocument();
+        });
+
+        it('renders "Transfer" subtitle', () => {
+            renderWithProviders(
+                <TransactionCard
+                    transaction={transferTransaction}
+                    isTransfer={true}
+                    linkedTransaction={linkedTransaction}
+                />
+            );
+            expect(screen.getByText('Transfer')).toBeInTheDocument();
+        });
+
+        it('renders amount without +/- prefix for transfers', () => {
+            renderWithProviders(
+                <TransactionCard
+                    transaction={transferTransaction}
+                    isTransfer={true}
+                    linkedTransaction={linkedTransaction}
+                />
+            );
+            // Should NOT have + or - prefix
+            const amountElement = screen.getByText(/1,000/);
+            expect(amountElement.textContent).not.toMatch(/^[+-]/);
+        });
+    });
+
+    describe('Draft Transaction Rendering', () => {
+        it('renders draft badge for draft transactions', () => {
+            const draftTransaction: Transaction = {
+                ...baseTransaction,
+                status: 'draft',
+            };
+            renderWithProviders(<TransactionCard transaction={draftTransaction} />);
+            expect(screen.getByText('Draft')).toBeInTheDocument();
+        });
+    });
+});
diff --git a/src/components/TransactionCard.tsx b/src/components/TransactionCard.tsx
index bec9c9a..27a0d45 100644
--- a/src/components/TransactionCard.tsx
+++ b/src/components/TransactionCard.tsx
@@ -1,14 +1,17 @@
 import type { Transaction } from '../utils/transactionStorage';
-import { ArrowRight } from 'lucide-react';
-import { getJarDetails } from '../utils/constants';
+import { ArrowRight, ArrowRightLeft } from 'lucide-react';
+import { getJarDetails, getWalletDetails } from '../utils/constants';
 import { useCurrency } from '../context/CurrencyContext';
 
 interface TransactionCardProps {
     transaction: Transaction;
     showDate?: boolean;
+    onClick?: () => void;
+    isTransfer?: boolean;
+    linkedTransaction?: Transaction; // The counterpart transaction for transfers
 }
 
-export default function TransactionCard({ transaction, showDate = true }: TransactionCardProps) {
+export default function TransactionCard({ transaction, showDate = true, onClick, isTransfer = false, linkedTransaction }: TransactionCardProps) {
     const { formatAmount } = useCurrency();
     const jar = getJarDetails(transaction.jarId);
 
@@ -32,16 +35,27 @@ export default function TransactionCard({ transaction, showDate = true }: Transa
     // Display Logic: 
     // Title: Note (primary) -> Jar Name (fallback)
     // Subtitle: Jar Name (if Note exists) -> Date
-    // const jar = getJarDetails(transaction.jarId); // Keep jar details for potential future use or if title/subtitle logic changes
-    const title = transaction.note || jar.name;
-    const subtitle = transaction.note ? jar.name : '';
+    let title = transaction.note || jar.name;
+    let subtitle = transaction.note ? jar.name : '';
+
+    if (isTransfer) {
+        const fromWallet = transaction.walletId ? getWalletDetails(transaction.walletId) : null;
+        const toWallet = linkedTransaction?.walletId ? getWalletDetails(linkedTransaction.walletId) : null;
+        if (fromWallet && toWallet) {
+            title = `${fromWallet.name} → ${toWallet.name}`;
+        } else if (fromWallet) {
+            title = `Transfer from ${fromWallet.name}`;
+        } else {
+            title = 'Transfer';
+        }
+        subtitle = 'Transfer';
+    }
 
     return (
-        <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors group cursor-pointer ${transaction.status === 'draft' ? 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30' : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/40'}`}>
+        <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-xl border transition-colors group cursor-pointer ${transaction.status === 'draft' ? 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30' : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/40'}`}>
             <div className="flex items-center gap-4">
-                <div className={`p-3 rounded-xl text-xl bg-gray-800/50 flex items-center justify-center`}>
-                    {/* Assuming Icon is imported or jar.icon is used */}
-                    {jar.icon}
+                <div className={`p-3 rounded-xl text-xl ${isTransfer ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800/50'} flex items-center justify-center`}>
+                    {isTransfer ? <ArrowRightLeft size={20} /> : jar.icon}
                 </div>
                 <div>
                     <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors flex items-center gap-2">
@@ -61,8 +75,8 @@ export default function TransactionCard({ transaction, showDate = true }: Transa
             </div>
 
             <div className="flex items-center gap-3">
-                <span className={`font-semibold ${transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
-                    {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
+                <span className={`font-semibold ${isTransfer ? 'text-blue-400' : (transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400')}`}>
+                    {formatAmount(transaction.amount)}
                 </span>
                 <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
             </div>
diff --git a/src/components/TransferForm.tsx b/src/components/TransferForm.tsx
new file mode 100644
index 0000000..65ac209
--- /dev/null
+++ b/src/components/TransferForm.tsx
@@ -0,0 +1,205 @@
+import { useState } from 'react';
+import { motion, AnimatePresence } from 'framer-motion';
+import { Save, Wallet, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
+import { WALLETS } from '../utils/constants';
+
+interface TransferFormProps {
+    onSave: (data: { amount: number; fromWalletId: string; toWalletId: string; date: string; note: string }) => Promise<void>;
+}
+
+export default function TransferForm({ onSave }: TransferFormProps) {
+    const [amount, setAmount] = useState('');
+    const [fromWalletId, setFromWalletId] = useState<string | null>(null);
+    const [toWalletId, setToWalletId] = useState<string | null>(null);
+    const [note, setNote] = useState('');
+    const [date, setDate] = useState(() => {
+        const now = new Date();
+        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
+        return now.toISOString().slice(0, 16);
+    });
+
+    const [touched, setTouched] = useState({ amount: false, fromWallet: false, toWallet: false });
+    const [isSubmitting, setIsSubmitting] = useState(false);
+
+    const validate = () => {
+        const errors: { amount?: string; fromWallet?: string; toWallet?: string } = {};
+
+        if (!amount || parseFloat(amount) <= 0) errors.amount = 'Please enter a valid amount';
+        if (!fromWalletId) errors.fromWallet = 'Select source wallet';
+        if (!toWalletId) errors.toWallet = 'Select destination wallet';
+        if (fromWalletId && toWalletId && fromWalletId === toWalletId) errors.toWallet = 'Cannot transfer to same wallet';
+
+        return errors;
+    };
+
+    const errors = validate();
+    const isFormValid = Object.keys(errors).length === 0;
+
+    const handleSave = async () => {
+        setTouched({ amount: true, fromWallet: true, toWallet: true });
+
+        if (!isFormValid) return;
+
+        setIsSubmitting(true);
+        await onSave({
+            amount: parseFloat(amount),
+            fromWalletId: fromWalletId!,
+            toWalletId: toWalletId!,
+            date,
+            note
+        });
+        setIsSubmitting(false);
+    };
+
+    return (
+        <div className="space-y-8">
+            {/* Amount Input */}
+            <section className="space-y-2">
+                <label className="text-sm font-medium text-gray-400">Amount to Transfer</label>
+                <div className="relative">
+                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">฿</span>
+                    <input
+                        type="number"
+                        value={amount}
+                        onChange={(e) => setAmount(e.target.value)}
+                        onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
+                        placeholder="0.00"
+                        className={`w-full bg-gray-800/50 border rounded-2xl py-6 pl-10 pr-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all font-mono ${touched.amount && errors.amount
+                            ? 'border-red-500 focus:ring-red-500/50'
+                            : 'border-gray-700 focus:ring-blue-500/50'
+                            }`}
+                    />
+                </div>
+                <AnimatePresence>
+                    {touched.amount && errors.amount && (
+                        <motion.div
+                            initial={{ opacity: 0, y: -10 }}
+                            animate={{ opacity: 1, y: 0 }}
+                            exit={{ opacity: 0, y: -10 }}
+                            className="flex items-center gap-2 text-red-400 text-sm"
+                        >
+                            <AlertCircle className="w-4 h-4" />
+                            {errors.amount}
+                        </motion.div>
+                    )}
+                </AnimatePresence>
+            </section>
+
+            {/* Date & Time Picker */}
+            <section className="space-y-2">
+                <label className="text-sm font-medium text-gray-400">Date & Time</label>
+                <input
+                    type="datetime-local"
+                    value={date}
+                    onChange={(e) => setDate(e.target.value)}
+                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
+                    style={{ colorScheme: 'dark' }}
+                />
+            </section>
+
+            {/* From Wallet */}
+            <section className="space-y-3">
+                <label className="text-sm font-medium text-gray-400">From (Source)</label>
+                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
+                    {WALLETS.map((wallet) => (
+                        <motion.button
+                            key={wallet.id}
+                            whileTap={{ scale: 0.95 }}
+                            onClick={() => setFromWalletId(wallet.id)}
+                            className={`flex-shrink-0 relative w-32 h-24 rounded-2xl p-3 border transition-all flex flex-col justify-between overflow-hidden ${fromWalletId === wallet.id
+                                ? 'bg-gray-800 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
+                                : 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
+                                }`}
+                        >
+                            <div className="z-10 text-3xl">{wallet.icon}</div>
+                            <div clas
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
