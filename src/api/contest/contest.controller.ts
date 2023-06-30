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
import { ContestService } from './contest.service';
import { ApiQuery, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import {
    ContestAllEntity,
    ContestEntity,
    RankingEntity,
    RankingUserEntity,
} from './entities/contest.entity';

@ApiTags('Contests')
@Controller('contests')
export class ContestController {
    constructor(private readonly contestService: ContestService) {}

    @Post()
    @ApiOperation({ summary: 'Create new contest' })
    create(@Body() createContestDto: CreateContestDto) {
        return this.contestService.create(createContestDto);
    }

    @Get()
    @ApiQuery({ name: 'skip', required: false, description: 'Default 0' })
    @ApiQuery({ name: 'limit', required: false, description: 'Default 10' })
    @ApiOperation({ summary: 'Get all contests' })
    @ApiResponse({
        status: 200,
        description: 'Returns list of contests',
        type: ContestAllEntity,
    })
    findAll(
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.contestService.findAll({
            skip,
            limit,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get contest by id' })
    @ApiResponse({
        status: 200,
        description: 'Returns contest',
        type: ContestEntity,
    })
    findOne(@Param('id') id: string) {
        return this.contestService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update contest' })
    update(
        @Param('id') id: string,
        @Body() updateContestDto: UpdateContestDto,
    ) {
        return this.contestService.update(+id, updateContestDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete contest' })
    remove(@Param('id') id: string) {
        return this.contestService.remove(+id);
    }

    @Get(':id/ranking')
    @ApiOperation({ summary: 'Get ranking of a contest' })
    @ApiResponse({
        status: 200,
        description: 'Returns ranking',
        type: RankingEntity,
    })
    async ranking(@Param('id') id: string) {
        const ranks = await this.contestService.ranking(+id);
        return {
            total: ranks.length,
            ranking: ranks,
        };
    }
}
