import { useState, useEffect } from 'react';
import { ThemeProvider } from './lib/useTheme';
import Dashboard from './pages/Dashboard';
import PaymentPortal from './pages/PaymentPortal';

export default function App() {
  const [isPayRoute, setIsPayRoute] = useState(
    window.location.pathname.startsWith('/pay')
  );

  useEffect(() => {
    const handlePopState = () => {
      setIsPayRoute(window.location.pathname.startsWith('/pay'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ThemeProvider>
      {isPayRoute ? <PaymentPortal /> : <Dashboard />}
    </ThemeProvider>
  );
}
