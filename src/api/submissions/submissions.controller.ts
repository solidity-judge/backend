import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Get()
    @ApiQuery({ name: 'skip', required: false, description: 'Default 0' })
    @ApiQuery({ name: 'limit', required: false, description: 'Default 10' })
    @ApiQuery({ name: 'user', required: false, description: 'Default empty' })
    @ApiQuery({
        name: 'problem',
        required: false,
        description: 'Default empty',
    })
    findAll(
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('user', new DefaultValuePipe('')) user: string,
        @Query('problem', new DefaultValuePipe('')) problem: string,
    ) {
        user = user.toLowerCase();
        problem = problem.toLowerCase();
        return this.submissionsService.findAll({
            skip,
            limit,
            userAddress: user,
            problemAddress: problem,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(+id);
    }
}
