import Link from 'next/link';
import { ApiStatus } from './api-status';
import styles from './page.module.css';

const stack = [
  {
    label: 'Backend',
    value: 'NestJS 12 · Fastify',
    href: 'https://docs.nestjs.com',
  },
  {
    label: 'Duomenų bazė',
    value: 'Prisma 7 · PostgreSQL',
    href: 'https://www.prisma.io/docs',
  },
  {
    label: 'Frontend',
    value: 'Next.js 16 · React 19',
    href: 'https://nextjs.org/docs',
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.badge}>pnpm monorepo</span>
          <h1 className={styles.title}>scrapTest</h1>
          <p className={styles.subtitle}>
            Minimalus startinis projektas: NestJS su Fastify adapteriu, Prisma 7 ir Next.js App
            Router.
          </p>
        </header>

        <section className={styles.cards} aria-label="Technologijos">
          {stack.map((item) => (
            <a
              key={item.label}
              className={styles.card}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.cardLabel}>{item.label}</span>
              <span className={styles.cardValue}>{item.value}</span>
            </a>
          ))}
        </section>

        <div className={styles.ctaRow}>
          <Link href="/products" className={styles.cta}>
            <span>
              Produktų sąrašas
              <span className={styles.ctaHint}>Peržiūrėti, atidaryti, pradėti tyrimą</span>
            </span>
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
          <Link href="/products/new" className={styles.ctaSecondary}>
            + Naujas produktas
          </Link>
        </div>

        <ApiStatus />

        <footer className={styles.footer}>
          <code className={styles.footerCode}>pnpm db:up</code>
          <span aria-hidden="true">·</span>
          <code className={styles.footerCode}>pnpm db:migrate</code>
          <span aria-hidden="true">·</span>
          <code className={styles.footerCode}>pnpm dev</code>
        </footer>
      </div>
    </main>
  );
}
