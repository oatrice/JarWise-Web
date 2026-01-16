import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleSaveTransaction = (tx: Transaction) => {
    saveTransaction(tx);
    setTransactions(getTransactions()); // Refresh from storage
    navigateTo('dashboard');
  };

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={navigateTo} transactions={transactions} />
      )}
      {currentPage === 'history' && (
        <TransactionHistory onBack={() => navigateTo('dashboard')} transactions={transactions} />
      )}
      {currentPage === 'add-transaction' && (
        <AddTransaction
          onBack={() => navigateTo('dashboard')}
          onSave={handleSaveTransaction}
        />
      )}
    </>
  );
}

export default App;

