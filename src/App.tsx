import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import LoginScreen from './pages/LoginScreen';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'login';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');  // Start with login for testing
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
      {currentPage === 'login' && (
        <LoginScreen onSignIn={() => navigateTo('dashboard')} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={navigateTo} transactions={transactions} />
      )}
      {currentPage === 'history' && (
        <TransactionHistory onBack={() => navigateTo('dashboard')} onNavigate={navigateTo} transactions={transactions} />
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

