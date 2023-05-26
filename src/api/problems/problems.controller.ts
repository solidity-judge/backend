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
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProblemsService } from './problems.service';
import { UpdateProblemDto } from './dto/updateProblem.dto';
import { NarrowedProblemEntity, ProblemEntity } from './entity/problem.entity';

@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
    constructor(private readonly problemsService: ProblemsService) {}

    @ApiResponse({
        status: 200,
        description: 'Returns list of problems',
        type: NarrowedProblemEntity,
    })
    @Get()
    @ApiQuery({ name: 'skip', required: false, description: 'Default 0' })
    @ApiQuery({ name: 'limit', required: false, description: 'Default 10' })
    @ApiQuery({ name: 'user', required: false, description: 'Default empty' })
    @ApiQuery({
        name: 'filterSolved',
        required: false,
        description: 'Default false',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: 'Default empty',
    })
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

    @ApiResponse({
        status: 200,
        description: 'Returns problem data',
        type: ProblemEntity,
    })
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
        // remove undefined fields
        const safeObjects = Object.fromEntries(
            Object.entries(safeUpdateProblemDto).filter(
                ([x, y]) => y != undefined,
            ),
        );
        await this.problemsService.update(+id, safeObjects as UpdateProblemDto);
        return this.problemsService.findOne(+id);
    }
}
