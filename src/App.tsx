import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={navigateTo} />
      )}
      {currentPage === 'history' && (
        <TransactionHistory onBack={() => navigateTo('dashboard')} />
      )}
      {currentPage === 'add-transaction' && (
        <AddTransaction
          onBack={() => navigateTo('dashboard')}
          onSave={(tx) => {
            console.log('Saved Transaction:', tx);
            navigateTo('dashboard');
          }}
        />
      )}
    </>
  );
}

export default App;
