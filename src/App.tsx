import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';

type Page = 'dashboard' | 'history';

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
    </>
  );
}

export default App;
