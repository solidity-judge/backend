import { gql } from 'graphql-request';

export const SUBMISSIONS_QUERY = gql`
    query Submissions($first: Int, $lastSyncingIndex: Int) {
        data: submissions(
            first: $first
            orderBy: syncingIndex
            where: { syncingIndex_gt: $lastSyncingIndex }
            subgraphError: allow
        ) {
            id
            problem
            solution
            point
            contestant
            verdicts

            syncingIndex
            block
            timestamp
            txHash
        }
    }
`;
