import { ApiProperty } from '@nestjs/swagger';

export class ContestEntity {
    @ApiProperty()
    id: number;

    @ApiProperty()
    deadline: number;

    @ApiProperty()
    description: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    problems: number[];
}

export class ContestAllEntity {
    @ApiProperty()
    total: number;

    @ApiProperty({
        type: [ContestEntity],
    })
    contests: ContestEntity[];
}
