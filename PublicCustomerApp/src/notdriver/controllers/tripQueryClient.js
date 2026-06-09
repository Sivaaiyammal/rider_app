import { QueryClient } from 'react-query';

const tripQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30000,
      cacheTime: 60000,
    },
  },
});

export default tripQueryClient;
