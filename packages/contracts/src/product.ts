import { z } from 'zod';

export const PRODUCT_NAME_MIN_LENGTH = 2;
export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 2000;
export const CATEGORY_NAME_MAX_LENGTH = 60;

/**
 * Vienas validacijos šaltinis:
 * - API: NestJS StandardSchemaValidationPipe (`@Body({ schema })`),
 * - web: formos validacija prieš POST.
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(PRODUCT_NAME_MIN_LENGTH, 'Pavadinimas turi būti bent 2 simbolių.')
    .max(PRODUCT_NAME_MAX_LENGTH, 'Pavadinimas per ilgas (iki 120 simbolių).'),
  category: z
    .string()
    .trim()
    .min(1, 'Įveskite kategoriją.')
    .max(CATEGORY_NAME_MAX_LENGTH, 'Kategorija per ilga (iki 60 simbolių).')
    .regex(/[\p{L}\p{N}]/u, 'Kategorijoje turi būti bent viena raidė arba skaičius.'),
  description: z
    .string()
    .trim()
    .max(PRODUCT_DESCRIPTION_MAX_LENGTH, 'Aprašymas per ilgas (iki 2000 simbolių).')
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  category: CategoryDto;
  createdAt: string;
  updatedAt: string;
}
