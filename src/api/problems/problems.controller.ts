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
import { UpdateProblemDto } from './updateProblem.dto';

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
        @Query('category', new DefaultValuePipe('')) category: string,
    ) {
        user = user.toLowerCase();
        return this.problemsService.findAll({
            skip,
            limit,
            userAddress: user,
            filterSolved,
            category,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.problemsService.findOne(+id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProblemDto: UpdateProblemDto,
    ) {
        const safeUpdateProblemDto: UpdateProblemDto = {
            isWhitelisted: updateProblemDto.isWhitelisted,
            description: updateProblemDto.description,
            inputFormat: updateProblemDto.inputFormat,
            outputFormat: updateProblemDto.outputFormat,
            title: updateProblemDto.title,
            categories: updateProblemDto.categories,
        };
        await this.problemsService.update(+id, safeUpdateProblemDto);
        return this.problemsService.findOne(+id);
    }
}
