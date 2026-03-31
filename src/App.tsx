import { startTransition, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import LoginScreen from './pages/LoginScreen';
import TransactionDetail from './pages/TransactionDetail';
import ManageWallets from './pages/ManageWallets';
import SettingsOverlay from './pages/SettingsOverlay';
import { saveTransaction, getTransactions, type Transaction } from './utils/transactionStorage';
import { fetchJars, fetchTransactions, fetchWallets, type ApiJar, type ApiTransaction, type ApiWallet } from './lib/api';
import type { Jar, Wallet } from './utils/generatedMockData';
import { deriveDashboardJars, deriveManageJars, deriveTotalBalance, deriveWalletViews, type ManageJarView } from './utils/importedViews';
import { resetCatalogs, setJarCatalog, setWalletCatalog } from './utils/constants';

import MigrationUploadScreen from './pages/MigrationUploadScreen';
import MigrationStatusScreen from './pages/MigrationStatusScreen';
import ReportsPage from './pages/ReportsPage';
import type { Page } from './types/navigation';
import { useAuth } from './context/AuthContext';

const WALLET_ICONS = ['💵', '🏦', '💳', '🧾', '💼', '🪙'];
const WALLET_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500'];
const JAR_EXPENSE_ICONS = ['🧾', '🍽️', '🎮', '🚌', '🏠', '🛍️'];
const JAR_INCOME_ICONS = ['💰', '💵', '🏆', '📈', '🎁', '🏦'];
const JAR_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500', 'bg-orange-500'];

function mapApiTransaction(transaction: ApiTransaction): Transaction {
  return {
    id: transaction.id,
    amount: Math.abs(transaction.amount),
    jarId: transaction.jar_id,
    note: transaction.description || undefined,
    date: transaction.date,
    type: transaction.type,
    walletId: transaction.wallet_id,
    toWalletId: transaction.to_wallet_id,
    relatedTransactionId: transaction.related_transaction_id ?? undefined,
  };
}

function mergeTransactions(remoteTransactions: Transaction[], localTransactions: Transaction[]) {
  const merged = new Map<string, Transaction>();
  for (const transaction of remoteTransactions) {
    merged.set(transaction.id, transaction);
  }
  for (const transaction of localTransactions) {
    merged.set(transaction.id, transaction);
  }
  return [...merged.values()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function syncCatalogs(wallets: ApiWallet[], jars: ApiJar[]) {
  setWalletCatalog(wallets.map((wallet, index) => ({
    id: wallet.id,
    name: wallet.name,
    icon: WALLET_ICONS[index % WALLET_ICONS.length],
    color: WALLET_COLORS[index % WALLET_COLORS.length],
  })));

  setJarCatalog(jars.map((jar, index) => ({
    id: jar.id,
    name: jar.name,
    icon: jar.icon || (jar.type === 'income'
      ? JAR_INCOME_ICONS[index % JAR_INCOME_ICONS.length]
      : JAR_EXPENSE_ICONS[index % JAR_EXPENSE_ICONS.length]),
    color: jar.color || JAR_COLORS[index % JAR_COLORS.length],
  })));
}

function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
  const [walletViews, setWalletViews] = useState<Wallet[]>([]);
  const [dashboardJars, setDashboardJars] = useState<Jar[]>([]);
  const [manageJarViews, setManageJarViews] = useState<ManageJarView[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [migrationJobId, setMigrationJobId] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === 'unauthenticated') {
      setCurrentPage('dashboard');
      setSelectedTransactionId(null);
      setMigrationJobId(null);
      setWalletViews([]);
      setDashboardJars([]);
      setManageJarViews([]);
      setTransactions(getTransactions());
      resetCatalogs();
    }
  }, [auth.status]);

  useEffect(() => {
    if (auth.status !== 'authenticated') {
      return;
    }

    let cancelled = false;

    const loadAppData = async () => {
      try {
        const [apiTransactions, apiWallets, apiJars] = await Promise.all([
          fetchTransactions(),
          fetchWallets(),
          fetchJars(),
        ]);

        if (cancelled) {
          return;
        }

        const mergedTransactions = mergeTransactions(
          apiTransactions.map(mapApiTransaction),
          getTransactions(),
        );

        startTransition(() => {
          setTransactions(mergedTransactions);
          setWalletViews(deriveWalletViews(apiWallets, mergedTransactions));
          setDashboardJars(deriveDashboardJars(apiJars, mergedTransactions, 6));
          setManageJarViews(deriveManageJars(apiJars, mergedTransactions));
          syncCatalogs(apiWallets, apiJars);
        });
      } catch (error) {
        console.error('Failed to load authenticated app data:', error);
      }
    };

    void loadAppData();

    return () => {
      cancelled = true;
    };
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
      setTransactions((previousTransactions) => mergeTransactions(previousTransactions, [tx]));
    }
    navigateTo('dashboard');
  };

  const refreshAppData = async () => {
    if (auth.status !== 'authenticated') {
      return;
    }

    try {
      const [apiTransactions, apiWallets, apiJars] = await Promise.all([
        fetchTransactions(),
        fetchWallets(),
        fetchJars(),
      ]);

      startTransition(() => {
        const mergedTransactions = mergeTransactions(apiTransactions.map(mapApiTransaction), getTransactions());
        setTransactions(mergedTransactions);
        setWalletViews(deriveWalletViews(apiWallets, mergedTransactions));
        setDashboardJars(deriveDashboardJars(apiJars, mergedTransactions, 6));
        setManageJarViews(deriveManageJars(apiJars, mergedTransactions));
        syncCatalogs(apiWallets, apiJars);
      });
    } catch (error) {
      console.error('Failed to refresh authenticated app data:', error);
    }
  };

  const totalBalance = deriveTotalBalance(walletViews);

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
          totalBalance={totalBalance}
          onTransactionClick={handleTransactionClick}
          jars={dashboardJars}
          manageJarsData={manageJarViews}
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
          onDone={() => {
            void refreshAppData();
            navigateTo('dashboard');
          }}
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
          initialWalletsData={walletViews}
        />
      )}
      {auth.status === 'authenticated' && currentPage === 'profile' && (
        <SettingsOverlay
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
          walletsData={walletViews}
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
