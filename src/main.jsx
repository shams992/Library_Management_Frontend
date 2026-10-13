import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry auth / permission / subscription failures.
        if ([401, 402, 403, 404, 422].includes(error?.status)) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
              <Toaster
                position="top-right"
                closeButton
                richColors
                toastOptions={{
                  classNames: {
                    toast: 'rounded-xl border border-border bg-card text-card-foreground shadow-md',
                    description: 'text-muted-foreground',
                  },
                }}
              />
            </AuthProvider>
          </BrowserRouter>
        </SettingsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
