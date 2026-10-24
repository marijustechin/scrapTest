import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductForm } from './product-form';
import styles from './product-form.module.css';

export const metadata: Metadata = {
  title: 'Naujas produktas · scrapTest',
  description: 'Produkto įvedimo forma: pavadinimas, kategorija ir aprašymas.',
};

export default function NewProductPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Atgal
        </Link>

        <header className={styles.header}>
          <span className={styles.eyebrow}>Produktai</span>
          <h1 className={styles.title}>Naujas produktas</h1>
          <p className={styles.subtitle}>
            Užpildykite pavadinimą, įrašykite kategoriją (arba pasirinkite iš siūlomų) ir, jei
            reikia, pridėkite aprašymą.
          </p>
        </header>

        <ProductForm />
      </div>
    </main>
  );
}
