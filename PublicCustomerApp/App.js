import React, { useMemo } from 'react';
import MainApp from './src/MainApp';
import { QueryClient, QueryClientProvider } from 'react-query'
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';

const App = () => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 30000,
        cacheTime: 60000,
      },
    },
  }), []);

  return (
    <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
    </I18nextProvider>
  );
};

export default App;
