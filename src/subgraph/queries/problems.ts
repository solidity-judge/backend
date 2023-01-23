import { gql } from 'graphql-request';

export const PROBLEMS_QUERY = gql`
    query Problems($first: Int, $lastSyncingIndex: Int) {
        data: problems(
            first: $first
            orderBy: syncingIndex
            where: { syncingIndex_gt: $lastSyncingIndex }
            subgraphError: allow
        ) {
            id
            author
            address
            checker

            syncingIndex
            block
            timestamp
            txHash
        }
    }
`;
