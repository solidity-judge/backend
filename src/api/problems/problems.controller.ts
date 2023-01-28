import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    ParseBoolPipe,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
    constructor(private readonly problemsService: ProblemsService) {}

    @Get()
    findAll(
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('user', new DefaultValuePipe('')) user: string,
        @Query('filterSolved', new DefaultValuePipe(false), ParseBoolPipe)
        filterSolved: boolean,
    ) {
        user = user.toLowerCase();
        return this.problemsService.findAll({
            skip,
            limit,
            userAddress: user,
            filterSolved,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.problemsService.findOne(+id);
    }
}
