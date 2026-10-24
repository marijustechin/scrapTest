import type { ProductDto } from '@scraptest/contracts';
import type { Metadata } from 'next';
import Link from 'next/link';
import { apiGet } from '../../lib/api';
import { formatDate } from '../../lib/format';
import styles from './products.module.css';

export const metadata: Metadata = {
  title: 'Produktai · scrapTest',
  description: 'Visų produktų sąrašas.',
};

export default async function ProductsPage() {
  const result = await apiGet<ProductDto[]>('/api/products');

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Pradžia
        </Link>

        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Produktai</span>
            <h1 className={styles.title}>Produktų sąrašas</h1>
            <p className={styles.subtitle}>
              Visi suvesti produktai. Atidarykite produktą, nurodykite šalį ir pradėkite tyrimą.
            </p>
          </div>
          <Link href="/products/new" className={styles.primaryLink}>
            + Naujas produktas
          </Link>
        </header>

        {result.status === 'error' && (
          <div className={styles.alertError} role="alert">
            Nepavyko įkelti produktų. Patikrinkite, ar API veikia (<code>pnpm dev:api</code>).
          </div>
        )}

        {result.status === 'ok' && result.data.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Kol kas produktų nėra.</p>
            <p className={styles.emptyText}>Pradėkite nuo pirmojo produkto įvedimo.</p>
            <Link href="/products/new" className={styles.secondaryLink}>
              Sukurti pirmą produktą
            </Link>
          </div>
        )}

        {result.status === 'ok' && result.data.length > 0 && (
          <ul className={styles.list}>
            {result.data.map((product) => (
              <li key={product.id}>
                <Link href={`/products/${product.id}`} className={styles.row}>
                  <span className={styles.rowMain}>
                    <span className={styles.rowName}>{product.name}</span>
                    <span className={styles.rowMeta}>
                      <span className={styles.chip}>{product.category.name}</span>
                      <span className={product.country ? undefined : styles.muted}>
                        {product.country ?? 'Šalis nenurodyta'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(product.createdAt)}</span>
                    </span>
                  </span>
                  <span className={styles.rowArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {result.status === 'ok' && result.data.length > 0 && (
          <p className={styles.count}>Iš viso: {result.data.length}</p>
        )}
      </div>
    </main>
  );
}
