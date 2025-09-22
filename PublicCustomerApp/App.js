import React, { useMemo } from 'react';
import MainApp from './src/MainApp';
import { QueryClient, QueryClientProvider } from 'react-query'
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import Config from "react-native-config";
import ErrorBoundary from "react-native-error-boundary";

import crashlytics from '@react-native-firebase/crashlytics';

import { ApolloProvider, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';


const App = () => {

const grapqlEndPoint = '/publicrides/customer/graphql/location';

const httpLink = new HttpLink({
  uri: Config.ROOT_API_URL + grapqlEndPoint,
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

  const myErrorHandler = (error, stackTrace) => {
   
    crashlytics().recordError(error);
  };


  return (
    <ErrorBoundary onError={myErrorHandler}>
      <ApolloProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          
            <MainApp />
       
   
        </QueryClientProvider>
      </I18nextProvider>
    </ApolloProvider>
    </ErrorBoundary>

  );
};

export default App;
