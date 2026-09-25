import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { initializeMobileFeatures } from './lib/mobile';
import { UserProvider } from './context/UserContext';
import { PopupProvider } from './context/PopupContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Clean up any insecure legacy demo tokens
    if (localStorage.getItem('token') === 'portfolio-demo-token') {
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      localStorage.removeItem('user');
    }
    
    // Initialize mobile features
    initializeMobileFeatures().catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <ThemeProvider>
            <AuthProvider>
              <UserProvider>
                <PopupProvider>
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </PopupProvider>
              </UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
