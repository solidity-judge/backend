import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Problem, ProblemSchema } from 'src/schema/problem.schema';
import { Contest, ContestSchema } from 'src/schema/contest.schema';
import { Submission, SubmissionSchema } from 'src/schema/submission.schema';

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
        MongooseModule.forFeature(
            [{ name: Submission.name, schema: SubmissionSchema }],
            'core',
        ),
    ],
    controllers: [ContestController],
    providers: [ContestService],
})
export class ContestModule {}
