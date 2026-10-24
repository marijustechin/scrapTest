import { Injectable } from '@nestjs/common';
import type { CategoryDto } from '@scraptest/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import { slugifyCategoryName } from './category-slug.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CategoryDto[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  /**
   * Suranda kategoriją pagal laisvai įvestą pavadinimą arba ją sukuria.
   * Upsert pagal slug yra atsparus lygiagretiems užklausimams, o slug
   * normalizavimas užtikrina, kad "Elektronika" ir "elektronika" nesidubliuotų.
   */
  findOrCreateByName(name: string): Promise<CategoryDto> {
    const slug = slugifyCategoryName(name);

    return this.prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
      select: { id: true, name: true, slug: true },
    });
  }
}
