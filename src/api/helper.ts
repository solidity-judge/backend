export function getAggregateProject(skip: number, limit: number, sort?: any) {
    if (!sort) {
        sort = {
            id: 1,
        };
    }
    return [
        {
            $sort: sort,
        },
        {
            $facet: {
                results: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: 'total' }],
            },
        },
        {
            $replaceWith: {
                $mergeObjects: ['$$ROOT', { $first: '$total' }],
            },
        },
        {
            $project: {
                results: 1,
                total: {
                    $cond: {
                        if: { $isArray: '$total' },
                        then: 0,
                        else: '$total',
                    },
                },
            },
        },
    ] as any;
}
