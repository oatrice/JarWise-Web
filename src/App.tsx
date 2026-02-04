import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import LoginScreen from './pages/LoginScreen';
import TransactionDetail from './pages/TransactionDetail';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';

import MigrationUploadScreen from './pages/MigrationUploadScreen';
import MigrationStatusScreen from './pages/MigrationStatusScreen';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'login' | 'migration-upload' | 'migration-status' | 'transaction-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleTransactionClick = (id: string) => {
    setSelectedTransactionId(id);
    setCurrentPage('transaction-detail');
  };

  const handleSaveTransaction = (tx?: Transaction) => {
    if (tx) {
      saveTransaction(tx);
    }
    setTransactions(getTransactions()); // Refresh from storage
    navigateTo('dashboard');
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginScreen onSignIn={() => navigateTo('dashboard')} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard
          onNavigate={navigateTo}
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
        />
      )}
      {currentPage === 'history' && (
        <TransactionHistory
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
        />
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
      {currentPage === 'transaction-detail' && selectedTransactionId && (
        <TransactionDetail
          transactionId={selectedTransactionId}
          allTransactions={transactions}
          onBack={() => navigateTo('history')}
          onNavigateLinked={(id) => handleTransactionClick(id)}
        />
      )}
    </>
  );
}

export default App;

