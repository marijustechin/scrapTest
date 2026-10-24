import { z } from 'zod';

export const PRODUCT_NAME_MIN_LENGTH = 2;
export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 2000;
export const CATEGORY_NAME_MAX_LENGTH = 60;
export const PRODUCT_COUNTRY_MAX_LENGTH = 60;

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

/**
 * Produkto puslapyje įvedama šalis, kurioje bus atliekamas tyrimas.
 * Laisvas tekstas (kaip ir kategorija) — šalis gali būti rašoma lietuviškai.
 */
export const updateProductCountrySchema = z.object({
  country: z
    .string()
    .trim()
    .min(2, 'Įveskite šalį.')
    .max(PRODUCT_COUNTRY_MAX_LENGTH, 'Šalies pavadinimas per ilgas (iki 60 simbolių).')
    .regex(/[\p{L}]/u, 'Šalyje turi būti bent viena raidė.'),
});

export type UpdateProductCountryInput = z.infer<typeof updateProductCountrySchema>;

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  category: CategoryDto;
  createdAt: string;
  updatedAt: string;
}
