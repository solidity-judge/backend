import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Problem, ProblemSchema } from 'src/schema/problem.schema';
import { Contest, ContestSchema } from 'src/schema/contest.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Problem.name, schema: ProblemSchema }],
            'core',
        ),
        MongooseModule.forFeature(
            [{ name: Contest.name, schema: ContestSchema }],
            'core',
        ),
    ],
    controllers: [ContestController],
    providers: [ContestService],
})
export class ContestModule {}
