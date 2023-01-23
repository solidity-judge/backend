import { gql } from 'graphql-request';

export const BUNDLES_QUERY = gql`
  query Bundles {
    data: bundles(first: 1000, subgraphError: allow) {
      id
      syncingIndex
    }
  }
`;
