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

export class RankingSubmissionEntity {
    @ApiProperty()
    point: number;

    @ApiProperty()
    timestamp: Date;

    @ApiProperty()
    solution: string;
}

export class RankingUserEntity {
    @ApiProperty()
    contestant: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    totalPoints: number;

    @ApiProperty({
        type: [RankingSubmissionEntity],
        nullable: true,
    })
    submissions: RankingSubmissionEntity[];
}

export class RankingEntity {
    @ApiProperty()
    total: number;

    @ApiProperty({
        type: [RankingUserEntity],
    })
    ranking: RankingUserEntity[];
}
