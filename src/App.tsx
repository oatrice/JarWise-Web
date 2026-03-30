import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import LoginScreen from './pages/LoginScreen';
import TransactionDetail from './pages/TransactionDetail';
import ManageWallets from './pages/ManageWallets';
import SettingsOverlay from './pages/SettingsOverlay';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';

import MigrationUploadScreen from './pages/MigrationUploadScreen';
import MigrationStatusScreen from './pages/MigrationStatusScreen';
import ReportsPage from './pages/ReportsPage';
import type { Page } from './types/navigation';
import { useAuth } from './context/AuthContext';

function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [migrationJobId, setMigrationJobId] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === 'unauthenticated') {
      setCurrentPage('dashboard');
      setSelectedTransactionId(null);
      setMigrationJobId(null);
    }
  }, [auth.status]);

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

  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin text-blue-400" size={32} />
          <div>
            <p className="text-sm text-gray-300 font-medium">Restoring your session</p>
            <p className="text-xs text-gray-500 mt-1">Checking your JarWise account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {auth.status !== 'authenticated' ? (
        <LoginScreen />
      ) : currentPage === 'dashboard' && (
        <Dashboard
          onNavigate={navigateTo}
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'history' && (
        <TransactionHistory
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'add-transaction' && (
        <AddTransaction
          onBack={() => navigateTo('dashboard')}
          onSave={handleSaveTransaction}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'migration-upload' && (
        <MigrationUploadScreen
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
          onJobCreated={(jobId) => setMigrationJobId(jobId)}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'migration-status' && (
        <MigrationStatusScreen
          onBack={() => navigateTo('migration-upload')}
          onDone={() => navigateTo('dashboard')}
          jobId={migrationJobId}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'transaction-detail' && selectedTransactionId && (
        <TransactionDetail
          transactionId={selectedTransactionId}
          allTransactions={transactions}
          onBack={() => navigateTo('history')}
          onNavigateLinked={(id) => handleTransactionClick(id)}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'wallets' && (
        <ManageWallets
          onClose={() => navigateTo('dashboard')}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'profile' && (
        <SettingsOverlay
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'reports' && (
        <ReportsPage
          onBack={() => navigateTo('dashboard')}
          onNavigate={(p) => navigateTo(p as Page)}
        />
      )}
    </>
  );
}

export default App;
