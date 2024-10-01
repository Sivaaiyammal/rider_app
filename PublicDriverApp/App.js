import React from 'react';
import MainApp from './src/MainApp';
import { QueryClient, QueryClientProvider } from 'react-query'

const App = () => {

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
};

export default App;
