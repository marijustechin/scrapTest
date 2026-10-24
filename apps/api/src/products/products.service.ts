import { Injectable } from '@nestjs/common';
import type { CategoryDto, CreateProductInput, ProductDto } from '@scraptest/contracts';
import { CategoriesService } from '../categories/categories.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryDto;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return products.map((product) => this.toDto(product));
  }

  async create(input: CreateProductInput): Promise<ProductDto> {
    // Laisvai įvesta kategorija: jei tokios dar nėra — sukuriama čia pat.
    const category = await this.categories.findOrCreateByName(input.category);

    const product = await this.prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        categoryId: category.id,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return this.toDto(product);
  }

  private toDto(product: ProductRecord): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
