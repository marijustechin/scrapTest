import { createHash } from 'node:crypto';

const MAX_SLUG_LENGTH = 60;

/**
 * Laisvai įvestą kategorijos pavadinimą paverčia stabiliu raktu (slug).
 * Tas pats pavadinimas (nepriklausomai nuo didžiųjų/mažųjų raidžių ir tarpų)
 * visada duoda tą patį slug — todėl kategorijos nesidubliuoja.
 */
export function slugifyCategoryName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');

  if (slug.length > 0) {
    return slug;
  }

  // Pavadinimas be lotyniškų raidžių (pvz., kirilica) — naudojame deterministinį hash.
  const hash = createHash('sha1').update(name.trim().toLowerCase()).digest('hex').slice(0, 12);
  return `k-${hash}`;
}
