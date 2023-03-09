export type UpdateProblemDto = {
    isWhitelisted?: boolean;
    description?: string;
    inputFormat?: string[];
    outputFormat?: string[];
    title?: string;
    categories?: string[];
};
