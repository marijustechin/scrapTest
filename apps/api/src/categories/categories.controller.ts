import { Controller, Get } from '@nestjs/common';
import type { CategoryDto } from '@scraptest/contracts';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }
}
