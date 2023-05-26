import { ApiProperty, PickType } from '@nestjs/swagger';

export class ProblemEntity {
    @ApiProperty()
    id: number;

    @ApiProperty()
    author: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    checker: string;

    @ApiProperty()
    deadline: number;

    @ApiProperty()
    isWhitelisted: boolean;

    @ApiProperty()
    description: string;

    @ApiProperty()
    inputFormat: string[];

    @ApiProperty()
    outputFormat: string[];

    @ApiProperty()
    title: string;

    @ApiProperty()
    gasLimit: number;

    @ApiProperty()
    testVersion: number;

    @ApiProperty()
    block: number;

    @ApiProperty()
    timestamp: Date;

    @ApiProperty()
    categories: {
        key: string;
        name: string;
    }[];
}

export class NarrowedProblemEntity extends PickType(ProblemEntity, [
    'id',
    'address',
    'author',
    'deadline',
    'timestamp',
    'title',
    'categories',
] as const) {
    @ApiProperty()
    solved: boolean;
}
