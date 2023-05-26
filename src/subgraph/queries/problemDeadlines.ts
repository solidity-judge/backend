import { gql } from 'graphql-request';

export const PROBLEM_DEADLINES_QUERY = gql`
    query ProblemDeadlines($first: Int, $lastSyncingIndex: Int) {
        data: problemDeadlines(
            first: $first
            orderBy: syncingIndex
            where: { syncingIndex_gt: $lastSyncingIndex }
            subgraphError: allow
        ) {
            id
            deadline
            problem

            syncingIndex
            block
            timestamp
            txHash
        }
    }
`;
