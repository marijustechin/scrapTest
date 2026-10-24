export const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export type ApiResult<T> =
  { status: 'ok'; data: T } | { status: 'not-found' } | { status: 'error' };

/**
 * Serverinių komponentų pagalbinė funkcija. Grąžina rezultatą, o ne meta klaidą,
 * kad puslapis galėtų parodyti draugišką būseną (404 / API nepasiekiamas).
 */
export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: 'no-store' });

    if (response.status === 404) {
      return { status: 'not-found' };
    }

    if (!response.ok) {
      return { status: 'error' };
    }

    return { status: 'ok', data: (await response.json()) as T };
  } catch {
    return { status: 'error' };
  }
}
