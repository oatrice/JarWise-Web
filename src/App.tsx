import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import LoginScreen from './pages/LoginScreen';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';

import MigrationUploadScreen from './pages/MigrationUploadScreen';
import MigrationStatusScreen from './pages/MigrationStatusScreen';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'login' | 'migration-upload' | 'migration-status';

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
      {currentPage === 'migration-upload' && (
        <MigrationUploadScreen
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
        />
      )}
      {currentPage === 'migration-status' && (
        <MigrationStatusScreen
          onBack={() => navigateTo('migration-upload')}
          onDone={() => navigateTo('dashboard')}
        />
      )}
    </>
  );
}

export default App;

