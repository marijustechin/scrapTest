import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  createProductSchema,
  type CreateProductInput,
  type ProductDto,
} from '@scraptest/contracts';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductDto[]> {
    return this.productsService.findAll();
  }

  @Post()
  create(@Body({ schema: createProductSchema }) input: CreateProductInput): Promise<ProductDto> {
    return this.productsService.create(input);
  }
}
