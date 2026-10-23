'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface HealthResponse {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
  uptime: number;
  timestamp: string;
}

type LoadState = 'loading' | 'ready' | 'error';

export function ApiStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        if (cancelled) return;

        setHealth(data);
        setCheckedAt(new Date(data.timestamp).toLocaleTimeString('lt-LT'));
        setState('ready');
      } catch {
        if (cancelled) return;

        setHealth(null);
        setCheckedAt(null);
        setState('error');
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setState('loading');
    setReloadKey((key) => key + 1);
  }

  const apiState = state === 'loading' ? 'pending' : state === 'ready' ? 'ok' : 'down';
  const dbState =
    state === 'loading' ? 'pending' : health?.db === 'up' ? 'ok' : health ? 'down' : 'pending';

  return (
    <section className={styles.statusCard} aria-live="polite">
      <div className={styles.statusHeader}>
        <div>
          <h2 className={styles.statusTitle}>API būsena</h2>
          <p className={styles.statusMeta}>
            {state === 'loading' && 'Tikrinama…'}
            {state === 'ready' &&
              (health?.db === 'up'
                ? 'Backendas ir duomenų bazė pasiekiami.'
                : 'Backendas veikia, bet duomenų bazė nepasiekiama.')}
            {state === 'error' && 'Backendas nepasiekiamas.'}
          </p>
        </div>
        <button
          type="button"
          className={styles.refresh}
          onClick={reload}
          disabled={state === 'loading'}
        >
          Tikrinti dar kartą
        </button>
      </div>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt className={styles.rowLabel}>API</dt>
          <dd className={styles.rowValue}>
            <span className={`${styles.dot} ${dotClass(styles, apiState)}`} aria-hidden="true" />
            {state === 'loading' ? 'tikrinama' : state === 'ready' ? 'veikia' : 'nepasiekiama'}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.rowLabel}>PostgreSQL</dt>
          <dd className={styles.rowValue}>
            <span className={`${styles.dot} ${dotClass(styles, dbState)}`} aria-hidden="true" />
            {health?.db === 'up' ? 'prijungta' : health?.db === 'down' ? 'nepasiekiama' : '—'}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.rowLabel}>Uptime</dt>
          <dd className={`${styles.rowValue} ${styles.mono}`}>
            {health ? `${health.uptime} s` : '—'}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.rowLabel}>Patikrinta</dt>
          <dd className={`${styles.rowValue} ${styles.mono}`}>{checkedAt ?? '—'}</dd>
        </div>
      </dl>

      {state === 'error' && (
        <p className={styles.errorText}>
          Nepavyko pasiekti <code>/api/health</code>. Paleiskite <code>pnpm dev:api</code> ir
          įsitikinkite, kad PostgreSQL veikia (<code>pnpm db:up</code>).
        </p>
      )}
    </section>
  );
}

function dotClass(stylesMap: Record<string, string>, state: 'ok' | 'down' | 'pending'): string {
  if (state === 'ok') return stylesMap.dotOk ?? '';
  if (state === 'down') return stylesMap.dotDown ?? '';
  return stylesMap.dotPending ?? '';
}
