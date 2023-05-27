import { ApiProperty } from '@nestjs/swagger';

export class CreateContestDto {
    @ApiProperty()
    deadline: number;

    @ApiProperty()
    description: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    problems: number[];
}
