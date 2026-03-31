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
import { fetchJars, fetchTransactions, fetchWallets, type ApiJar, type ApiTransaction, type ApiWallet } from './lib/api';
import type { Jar, Wallet } from './utils/generatedMockData';
import { deriveDashboardJars, deriveManageJars, deriveTotalBalance, deriveWalletViews, type ManageJarView } from './utils/importedViews';
import { resetCatalogs, setJarCatalog, setWalletCatalog } from './utils/constants';

import MigrationUploadScreen from './pages/MigrationUploadScreen';
import MigrationStatusScreen from './pages/MigrationStatusScreen';
import ReportsPage from './pages/ReportsPage';
import type { Page } from './types/navigation';
import { useAuth } from './context/useAuth';

const WALLET_ICONS = ['💵', '🏦', '💳', '🧾', '💼', '🪙'];
const WALLET_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500'];
const JAR_EXPENSE_ICONS = ['🧾', '🍽️', '🎮', '🚌', '🏠', '🛍️'];
const JAR_INCOME_ICONS = ['💰', '💵', '🏆', '📈', '🎁', '🏦'];
const JAR_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500', 'bg-orange-500'];
type AppDataStatus = 'idle' | 'loading' | 'ready' | 'refreshing' | 'error';

function sortTransactionsDescending(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

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
  return sortTransactionsDescending([...merged.values()]);
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

function AppLoadingScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="animate-spin text-blue-400" size={32} />
        <div>
          <p className="text-sm text-gray-300 font-medium">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => sortTransactionsDescending(getTransactions()));
  const [walletViews, setWalletViews] = useState<Wallet[]>([]);
  const [dashboardJars, setDashboardJars] = useState<Jar[]>([]);
  const [manageJarViews, setManageJarViews] = useState<ManageJarView[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [migrationJobId, setMigrationJobId] = useState<string | null>(null);
  const [appDataStatus, setAppDataStatus] = useState<AppDataStatus>('idle');
  const [hasHydratedAppData, setHasHydratedAppData] = useState(false);

  const applyAuthenticatedAppData = (apiTransactions: ApiTransaction[], apiWallets: ApiWallet[], apiJars: ApiJar[]) => {
    const mergedTransactions = mergeTransactions(
      apiTransactions.map(mapApiTransaction),
      getTransactions(),
    );

    setTransactions(mergedTransactions);
    setWalletViews(deriveWalletViews(apiWallets, mergedTransactions));
    setDashboardJars(deriveDashboardJars(apiJars, mergedTransactions, 6));
    setManageJarViews(deriveManageJars(apiJars, mergedTransactions));
    syncCatalogs(apiWallets, apiJars);
  };

  useEffect(() => {
    let cancelled = false;

    const loadAppData = async () => {
      try {
        setAppDataStatus('loading');
        const [apiTransactions, apiWallets, apiJars] = await Promise.all([
          fetchTransactions(),
          fetchWallets(),
          fetchJars(),
        ]);

        if (cancelled) {
          return;
        }

        applyAuthenticatedAppData(apiTransactions, apiWallets, apiJars);
        setHasHydratedAppData(true);
        setAppDataStatus('ready');
      } catch (error) {
        console.error('Failed to load authenticated app data:', error);
        if (!cancelled) {
          setAppDataStatus('error');
        }
      }
    };

    void loadAppData();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const refreshAppData = async ({ blocking = false }: { blocking?: boolean } = {}) => {
    try {
      setAppDataStatus(blocking ? 'loading' : 'refreshing');
      const [apiTransactions, apiWallets, apiJars] = await Promise.all([
        fetchTransactions(),
        fetchWallets(),
        fetchJars(),
      ]);

      applyAuthenticatedAppData(apiTransactions, apiWallets, apiJars);
      setHasHydratedAppData(true);
      setAppDataStatus('ready');
    } catch (error) {
      console.error('Failed to refresh authenticated app data:', error);
      setAppDataStatus(hasHydratedAppData ? 'ready' : 'error');
    }
  };

  const totalBalance = deriveTotalBalance(walletViews);

  if (appDataStatus === 'loading' || (appDataStatus === 'idle' && !hasHydratedAppData)) {
    return (
      <AppLoadingScreen
        title="Loading your data"
        subtitle="Syncing your wallets, jars, and transactions..."
      />
    );
  }

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard
          onNavigate={navigateTo}
          transactions={transactions}
          totalBalance={totalBalance}
          onTransactionClick={handleTransactionClick}
          jars={dashboardJars}
          manageJarsData={manageJarViews}
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
          onJobCreated={(jobId) => setMigrationJobId(jobId)}
        />
      )}
      {currentPage === 'migration-status' && (
        <MigrationStatusScreen
          onBack={() => navigateTo('migration-upload')}
          onDone={async () => {
            navigateTo('dashboard');
            await refreshAppData({ blocking: true });
          }}
          jobId={migrationJobId}
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
      {currentPage === 'wallets' && (
        <ManageWallets
          onClose={() => navigateTo('dashboard')}
          initialWalletsData={walletViews}
        />
      )}
      {currentPage === 'profile' && (
        <SettingsOverlay
          onBack={() => navigateTo('dashboard')}
          onNavigate={navigateTo}
          walletsData={walletViews}
        />
      )}
      {currentPage === 'reports' && (
        <ReportsPage
          onBack={() => navigateTo('dashboard')}
          onNavigate={(p) => navigateTo(p as Page)}
        />
      )}
    </>
  );
}

function App() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.status !== 'authenticated') {
      resetCatalogs();
    }
  }, [auth.status]);

  if (auth.status === 'loading') {
    return (
      <AppLoadingScreen
        title="Restoring your session"
        subtitle="Checking your JarWise account..."
      />
    );
  }

  if (auth.status !== 'authenticated') {
    return <LoginScreen />;
  }

  return <AuthenticatedApp key={auth.user?.id ?? 'authenticated'} />;
}

export default App;
