import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/schema/category.schema';

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Category.name, schema: CategorySchema }],
            'core',
        ),
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
})
export class CategoryModule {}
