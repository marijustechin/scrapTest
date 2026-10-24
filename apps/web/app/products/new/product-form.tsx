'use client';

import {
  CATEGORY_NAME_MAX_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  createProductSchema,
  type CategoryDto,
  type ProductDto,
} from '@scraptest/contracts';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './product-form.module.css';

interface FormValues {
  name: string;
  category: string;
  description: string;
}

type FormField = keyof FormValues;
type FieldErrors = Partial<Record<FormField | 'form', string>>;

const EMPTY_VALUES: FormValues = { name: '', category: '', description: '' };

export function ProductForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [suggestions, setSuggestions] = useState<CategoryDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Kategorijų sąrašas — tik pasiūlymams (datalist). Įvesti galima bet ką.
  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as CategoryDto[];
        if (!cancelled) {
          setSuggestions(data);
        }
      } catch {
        // Pasiūlymų įkelti nepavyko — forma vis tiek veikia su laisvu tekstu.
      }
    }

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<Field extends FormField>(field: Field, value: FormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Ta pati schema, kaip backend'e — klaidos parodomos iškart, be serverio kelionės.
    const parsed = createProductSchema.safeParse({
      name: values.name,
      category: values.category,
      description: values.description,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'name' || field === 'category' || field === 'description') {
          nextErrors[field] ??= issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setCreated(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        const message = payload?.message;

        setErrors({
          form: Array.isArray(message)
            ? message.join(' ')
            : (message ?? 'Nepavyko išsaugoti produkto.'),
        });
        return;
      }

      const product = (await response.json()) as ProductDto;
      setCreated({ id: product.id, name: product.name });
      setValues(EMPTY_VALUES);
      setSuggestions((current) =>
        current.some((category) => category.slug === product.category.slug)
          ? current
          : [...current, product.category].sort((a, b) => a.name.localeCompare(b.name, 'lt')),
      );
      nameInputRef.current?.focus();
    } catch {
      setErrors({ form: 'Nepavyko susisiekti su API. Ar backendas paleistas?' });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setCreated(null);
    nameInputRef.current?.focus();
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      {created && (
        <div className={styles.alertSuccess} role="status">
          <strong>Produktas „{created.name}“ sukurtas.</strong>
          <span>Forma paruošta įvesti kitą produktą.</span>
          <Link href={`/products/${created.id}`} className={styles.alertLink}>
            Atidaryti produkto puslapį →
          </Link>
        </div>
      )}

      {errors.form && (
        <div className={styles.alertError} role="alert">
          {errors.form}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="product-name">
            Pavadinimas <span className={styles.required}>*</span>
          </label>
          <input
            ref={nameInputRef}
            id="product-name"
            className={`${styles.control} ${errors.name ? styles.controlInvalid : ''}`}
            type="text"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            maxLength={PRODUCT_NAME_MAX_LENGTH}
            placeholder="Pvz., Ausinės Sony WH-1000XM5"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'product-name-error' : undefined}
            required
          />
          {errors.name && (
            <span id="product-name-error" className={styles.fieldError}>
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="product-category">
            Kategorija <span className={styles.required}>*</span>
          </label>
          <input
            id="product-category"
            className={`${styles.control} ${errors.category ? styles.controlInvalid : ''}`}
            type="text"
            value={values.category}
            onChange={(event) => updateField('category', event.target.value)}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            placeholder="Pvz., Virtuvės technika"
            autoComplete="off"
            list="product-category-suggestions"
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'product-category-error' : 'product-category-hint'}
            required
          />
          <datalist id="product-category-suggestions">
            {suggestions.map((category) => (
              <option key={category.id} value={category.name} />
            ))}
          </datalist>
          {errors.category ? (
            <span id="product-category-error" className={styles.fieldError}>
              {errors.category}
            </span>
          ) : (
            <span id="product-category-hint" className={styles.hint}>
              Rašykite laisvai — nauja kategorija bus sukurta automatiškai.
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="product-description">
          Aprašymas <span className={styles.optional}>(neprivaloma)</span>
        </label>
        <textarea
          id="product-description"
          className={`${styles.control} ${styles.textarea} ${
            errors.description ? styles.controlInvalid : ''
          }`}
          value={values.description}
          onChange={(event) => updateField('description', event.target.value)}
          maxLength={PRODUCT_DESCRIPTION_MAX_LENGTH}
          rows={5}
          placeholder="Trumpas produkto aprašymas, specifikacijos, pastabos…"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'product-description-error' : 'product-description-hint'
          }
        />
        <div className={styles.fieldFooter}>
          {errors.description ? (
            <span id="product-description-error" className={styles.fieldError}>
              {errors.description}
            </span>
          ) : (
            <span id="product-description-hint" className={styles.hint}>
              Matoma tik vidiniam naudojimui.
            </span>
          )}
          <span className={styles.counter}>
            {values.description.length}/{PRODUCT_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={submitting}>
          {submitting ? 'Saugoma…' : 'Išsaugoti produktą'}
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={resetForm}
          disabled={submitting}
        >
          Išvalyti
        </button>
      </div>
    </form>
  );
}
