'use client'

import { useSearchParams } from 'next/navigation';

/**
 * Extracts specified query parameters from the URL.
 * 
 * @param keys - An array of parameter keys to extract from the query string.
 * @returns An object where each key corresponds to the queried parameter.
 *          If a parameter is not found, its value is `undefined`.
 */
export default function getQueryParams(keys: string[]): Record<string, string | undefined> {
  const searchParams = useSearchParams();

  const result: Record<string, string | undefined> = {};

  keys.forEach((key) => {
    const value = searchParams.get(key);
    result[key] = value || undefined; // Return undefined if the key doesn't exist
  });

  return result;
}
