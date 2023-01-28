export type SubmissionDto = {
    id: string;
    problem: string;
    solution: string;
    point: string;
    contestant: string;
    verdicts: number[];
    version: string;

    syncingIndex: string;
    block: string;
    timestamp: string;
    txHash: string;
};
