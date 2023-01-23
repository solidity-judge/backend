import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Problem, ProblemSchema } from 'src/schema/problem.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Problem.name, schema: ProblemSchema }],
            'core',
        ),
    ],
    controllers: [ProblemsController],
    providers: [ProblemsService],
})
export class ProblemsModule {}
