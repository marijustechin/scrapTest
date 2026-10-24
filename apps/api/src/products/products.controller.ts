import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  createProductSchema,
  updateProductCountrySchema,
  type CreateProductInput,
  type ProductDto,
  type UpdateProductCountryInput,
} from '@scraptest/contracts';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductDto[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body({ schema: createProductSchema }) input: CreateProductInput): Promise<ProductDto> {
    return this.productsService.create(input);
  }

  @Patch(':id')
  updateCountry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateProductCountrySchema }) input: UpdateProductCountryInput,
  ): Promise<ProductDto> {
    return this.productsService.updateCountry(id, input);
  }
}
