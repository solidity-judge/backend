import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Problem, ProblemSchema } from 'src/schema/problem.schema';
import { Category, CategorySchema } from 'src/schema/category.schema';
import { Contest, ContestSchema } from 'src/schema/contest.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Problem.name, schema: ProblemSchema }],
            'core',
        ),
        MongooseModule.forFeature(
            [{ name: Category.name, schema: CategorySchema }],
            'core',
        ),
        MongooseModule.forFeature(
            [{ name: Contest.name, schema: ContestSchema }],
            'core',
        ),
    ],
    controllers: [ProblemsController],
    providers: [ProblemsService],
})
export class ProblemsModule {}
