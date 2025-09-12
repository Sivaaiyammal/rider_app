// apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ROOT_API_URL } from '../Config/APIURLConfig';

const grapqlEndPoint = '/publicrides/customer/graphql/location';

const httpLink = new HttpLink({
  uri: ROOT_API_URL + grapqlEndPoint,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
