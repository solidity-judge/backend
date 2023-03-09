import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }
  
  @Get()
  findAll(
      @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.categoryService.findAll({
      skip,
      limit,
  });
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(key, updateCategoryDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.categoryService.remove(key);
  }
}
