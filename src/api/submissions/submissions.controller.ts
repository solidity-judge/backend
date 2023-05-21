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
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) {}

    @Get()
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
