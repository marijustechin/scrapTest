import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CategoryDto,
  CreateProductInput,
  ProductDto,
  UpdateProductCountryInput,
} from '@scraptest/contracts';
import { CategoriesService } from '../categories/categories.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryDto;
}

const productWithCategory = {
  include: { category: { select: { id: true, name: true, slug: true } } },
} as const;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      ...productWithCategory,
    });

    return products.map((product) => this.toDto(product));
  }

  async findOne(id: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      ...productWithCategory,
    });

    if (!product) {
      throw new NotFoundException('Produktas nerastas.');
    }

    return this.toDto(product);
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
      ...productWithCategory,
    });

    return this.toDto(product);
  }

  async updateCountry(id: string, input: UpdateProductCountryInput): Promise<ProductDto> {
    const exists = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Produktas nerastas.');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { country: input.country },
      ...productWithCategory,
    });

    return this.toDto(product);
  }

  private toDto(product: ProductRecord): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      country: product.country,
      category: product.category,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
