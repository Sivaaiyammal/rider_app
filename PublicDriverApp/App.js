import React, { useMemo } from 'react';
import MainApp from './src/MainApp';
import { QueryClient, QueryClientProvider } from 'react-query'

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
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
};

export default App;
