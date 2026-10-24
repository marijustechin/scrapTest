'use client';

import {
  PRODUCT_COUNTRY_MAX_LENGTH,
  updateProductCountrySchema,
  type ProductDto,
} from '@scraptest/contracts';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { COUNTRY_SUGGESTIONS } from '../countries';
import styles from '../products.module.css';

interface ResearchPanelProps {
  product: ProductDto;
}

export function ResearchPanel({ product }: ResearchPanelProps) {
  const router = useRouter();
  const [country, setCountry] = useState(product.country ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [startedCountry, setStartedCountry] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateProductCountrySchema.safeParse({ country });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Įveskite šalį.');
      return;
    }

    setSaving(true);
    setError(null);
    setStartedCountry(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        const message = payload?.message;

        setError(
          Array.isArray(message) ? message.join(' ') : (message ?? 'Nepavyko išsaugoti šalies.'),
        );
        return;
      }

      const updated = (await response.json()) as ProductDto;
      setCountry(updated.country ?? parsed.data.country);
      setStartedCountry(updated.country ?? parsed.data.country);
      // Atnaujina serverinio komponento duomenis (pvz., „Šalis“ suvestinėje).
      router.refresh();
    } catch {
      setError('Nepavyko susisiekti su API. Ar backendas paleistas?');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.researchCard}>
      <div className={styles.researchHeader}>
        <div>
          <h2 className={styles.researchTitle}>Tyrimas</h2>
          <p className={styles.researchText}>Nurodykite šalį, kurioje ieškosime šio produkto.</p>
        </div>
        <span className={styles.researchBadge}>
          {product.country ? 'Šalis nurodyta' : 'Tyrimas nepradėtas'}
        </span>
      </div>

      <form className={styles.researchForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="research-country">
            Šalis <span className={styles.required}>*</span>
          </label>
          <input
            id="research-country"
            className={`${styles.control} ${error ? styles.controlInvalid : ''}`}
            type="text"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setError(null);
              setStartedCountry(null);
            }}
            maxLength={PRODUCT_COUNTRY_MAX_LENGTH}
            placeholder="Pvz., Lietuva"
            autoComplete="off"
            list="country-suggestions"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'research-country-error' : 'research-country-hint'}
            required
          />
          <datalist id="country-suggestions">
            {COUNTRY_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          {error ? (
            <span id="research-country-error" className={styles.fieldError} role="alert">
              {error}
            </span>
          ) : (
            <span id="research-country-hint" className={styles.hint}>
              Pasiūlymai – populiariausios šalys; galite įrašyti bet kurią.
            </span>
          )}
        </div>

        <button type="submit" className={styles.startButton} disabled={saving}>
          {saving ? 'Saugoma…' : 'Pradėti tyrimą'}
        </button>
      </form>

      {startedCountry && (
        <div className={styles.researchStatus} role="status">
          <strong>Šalis išsaugota: {startedCountry}.</strong>
          <span>Tyrimo variklis bus prijungtas kitame etape.</span>
        </div>
      )}
    </section>
  );
}
