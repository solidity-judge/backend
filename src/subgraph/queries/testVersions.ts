import { gql } from 'graphql-request';

export const TEST_VERSIONS_QUERY = gql`
    query TestVersions($first: Int, $lastSyncingIndex: Int) {
        data: testVersions(
            first: $first
            orderBy: syncingIndex
            where: { syncingIndex_gt: $lastSyncingIndex }
            subgraphError: allow
        ) {
            id
            problem
            gasLimit
            version

            syncingIndex
            block
            timestamp
            txHash
        }
    }
`;
