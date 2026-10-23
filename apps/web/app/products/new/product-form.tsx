'use client';

import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  createProductSchema,
  type CategoryDto,
} from '@scraptest/contracts';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import styles from './product-form.module.css';

interface FormValues {
  name: string;
  categoryId: string;
  description: string;
}

type FormField = keyof FormValues;
type FieldErrors = Partial<Record<FormField | 'form', string>>;
type CategoriesState = 'loading' | 'ready' | 'error';

const EMPTY_VALUES: FormValues = { name: '', categoryId: '', description: '' };

export function ProductForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesState, setCategoriesState] = useState<CategoriesState>('loading');
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as CategoryDto[];
        if (cancelled) return;

        setCategories(data);
        setCategoriesState('ready');
      } catch {
        if (cancelled) return;

        setCategories([]);
        setCategoriesState('error');
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [categoriesReloadKey]);

  function updateField<Field extends FormField>(field: Field, value: FormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Ta pati schema, kaip backend'e — klaidos parodomos iškart, be serverio kelionės.
    const parsed = createProductSchema.safeParse({
      name: values.name,
      categoryId: values.categoryId,
      description: values.description,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'name' || field === 'categoryId' || field === 'description') {
          nextErrors[field] ??= issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setCreatedName(null);

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

      const product = (await response.json()) as { name: string };
      setCreatedName(product.name);
      setValues(EMPTY_VALUES);
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
    setCreatedName(null);
    nameInputRef.current?.focus();
  }

  const categoriesUnavailable = categoriesState === 'error';
  const submitDisabled = submitting || categoriesUnavailable || categories.length === 0;

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      {createdName && (
        <div className={styles.alertSuccess} role="status">
          <strong>Produktas „{createdName}“ sukurtas.</strong>
          <span>Forma paruošta įvesti kitą produktą.</span>
        </div>
      )}

      {errors.form && (
        <div className={styles.alertError} role="alert">
          {errors.form}
        </div>
      )}

      {categoriesUnavailable && (
        <div className={styles.alertError} role="alert">
          Nepavyko įkelti kategorijų.{' '}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setCategoriesState('loading');
              setCategoriesReloadKey((key) => key + 1);
            }}
          >
            Bandyti dar kartą
          </button>
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
          <select
            id="product-category"
            className={`${styles.control} ${errors.categoryId ? styles.controlInvalid : ''}`}
            value={values.categoryId}
            onChange={(event) => updateField('categoryId', event.target.value)}
            disabled={categoriesState !== 'ready'}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? 'product-category-error' : undefined}
            required
          >
            <option value="" disabled>
              {categoriesState === 'loading' ? 'Kraunamos kategorijos…' : 'Pasirinkite kategoriją'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span id="product-category-error" className={styles.fieldError}>
              {errors.categoryId}
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
        <button type="submit" className={styles.primary} disabled={submitDisabled}>
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
