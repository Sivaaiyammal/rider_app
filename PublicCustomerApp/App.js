import React, { useMemo } from 'react';
import MainApp from './src/MainApp';
import { QueryClient, QueryClientProvider } from 'react-query'
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';

import { ApolloProvider, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';
import { ROOT_API_URL } from './src/Config/APIURLConfig';
const App = () => {

const grapqlEndPoint = '/publicrides/customer/graphql/location';

const httpLink = new HttpLink({
  uri: ROOT_API_URL + grapqlEndPoint,
});
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});





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
   <ApolloProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MainApp />
        </QueryClientProvider>
      </I18nextProvider>
    </ApolloProvider>

  );
};

export default App;
