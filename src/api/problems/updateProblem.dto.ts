import { ApiProperty } from '@nestjs/swagger';

export class UpdateProblemDto {
    @ApiProperty()
    isWhitelisted?: boolean;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    inputFormat?: string[];

    @ApiProperty()
    outputFormat?: string[];

    @ApiProperty()
    title?: string;

    @ApiProperty()
    categories?: string[];
}
