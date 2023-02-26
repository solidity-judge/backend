import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from 'src/schema/submission.schema';

@Module({
  imports: [
      MongooseModule.forFeature(
          [{ name: Submission.name, schema: SubmissionSchema }],
          'core',
      ),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService]
})
export class SubmissionsModule {}
