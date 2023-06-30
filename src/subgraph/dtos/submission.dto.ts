export type SubmissionDto = {
    id: string;
    problem: string;
    solution: string;
    point: string;
    contestant: string;
    verdicts: number[];
    isPreDeadline: boolean;

    syncingIndex: string;
    block: string;
    timestamp: string;
    txHash: string;
};
