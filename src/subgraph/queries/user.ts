import { gql } from 'graphql-request';

export const USERS_QUERY = gql`
    query Users($first: Int, $lastSyncingIndex: Int) {
        data: users(
            first: $first
            orderBy: syncingIndex
            where: { syncingIndex_gt: $lastSyncingIndex }
            subgraphError: allow
        ) {
            username: id
            address: user
            gate

            syncingIndex
            block
            timestamp
            txHash
        }
    }
`;
