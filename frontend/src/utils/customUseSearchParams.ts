import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Contains two functions which:
 *
 * Extract specified query parameters from the URL
 *
 * @param keys - (optional) An array of parameter keys to extract from the query string. If not provided, all parameters are returned.
 *
 *
 * Update or set query string parameters in the URL.
 *
 * @param newParams - Key-value pair of parameters to update or set.
 * @param options - Optional settings.
 *   - `replaceState`: If true, replaces the URL without adding a new history entry. Defaults to `true`.
 */

export function customUseSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSearchParams = (
    newParams: Record<string, string>,
    options?: {
      replaceState?: boolean;
    },
  ) => {
    const { replaceState = true } = options ?? {};
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    const args = [
      `${pathname}?${params.toString()}`,
      { scroll: false },
    ] as const;

    if (replaceState) {
      router.replace(...args);
    } else {
      router.push(...args);
    }
  };

  const getSearchParams = (keys?: string[]) => {
    const filteredSearchParams =
      keys === undefined
        ? searchParams.entries()
        : keys.map((key) => [key, searchParams.get(key)]);
    return Object.fromEntries(filteredSearchParams);
  };

  return { get: getSearchParams, set: setSearchParams } as const;
}
