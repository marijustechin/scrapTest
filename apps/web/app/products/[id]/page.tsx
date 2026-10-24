import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProductDto } from '@scraptest/contracts';
import { apiGet } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import styles from '../products.module.css';
import { ResearchPanel } from './research-panel';

export const metadata: Metadata = {
  title: 'Produktas · scrapTest',
};

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const result = await apiGet<ProductDto>(`/api/products/${id}`);

  if (result.status === 'not-found') {
    notFound();
  }

  if (result.status === 'error') {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <Link href="/products" className={styles.back}>
            ← Visi produktai
          </Link>
          <div className={styles.alertError} role="alert">
            Nepavyko įkelti produkto. Patikrinkite, ar API veikia (<code>pnpm dev:api</code>).
          </div>
        </div>
      </main>
    );
  }

  const product = result.data;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/products" className={styles.back}>
          ← Visi produktai
        </Link>

        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{product.category.name}</span>
            <h1 className={styles.title}>{product.name}</h1>
            {product.description ? (
              <p className={styles.subtitle}>{product.description}</p>
            ) : (
              <p className={styles.muted}>Aprašymas nenurodytas.</p>
            )}
          </div>
        </header>

        <dl className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Kategorija</dt>
            <dd className={styles.metaValue}>{product.category.name}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Šalis</dt>
            <dd className={product.country ? styles.metaValue : styles.muted}>
              {product.country ?? 'Nenurodyta'}
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Sukurtas</dt>
            <dd className={styles.metaValue}>{formatDate(product.createdAt)}</dd>
          </div>
        </dl>

        <ResearchPanel product={product} />
      </div>
    </main>
  );
}
