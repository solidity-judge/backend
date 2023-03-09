import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { SubgraphService } from './subgraph/subgraph.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncMetadata, SyncMetadataSchema } from './schema/syncMetadata.schema';
import * as Joi from 'joi';
import { Problem, ProblemSchema } from './schema/problem.schema';
import { ProblemsModule } from './api/problems/problems.module';
import { Submission, SubmissionSchema } from './schema/submission.schema';
import { UsersModule } from './api/users/users.module';
import { User, UserSchema } from './schema/user.shema';
import { SubmissionsModule } from './api/submissions/submissions.module';
import { CategoryModule } from './api/category/category.module';
import { Category, CategorySchema } from './schema/category.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                DB_URI: Joi.string().required(),
            }),
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('DB_URI'),
            }),
            connectionName: 'core',
        }),
        MongooseModule.forFeature(
            [
                { name: SyncMetadata.name, schema: SyncMetadataSchema },
                { name: Problem.name, schema: ProblemSchema },
                { name: Submission.name, schema: SubmissionSchema },
                { name: User.name, schema: UserSchema },
                { name: Category.name, schema: CategorySchema },
            ],
            'core',
        ),
        ProblemsModule,
        UsersModule,
        SubmissionsModule,
        CategoryModule,
    ],

    controllers: [AppController],
    providers: [AppService, SubgraphService],
})
export class AppModule {}
