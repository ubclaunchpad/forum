import { NextRouter } from 'next/router'

/**
 * Updates or sets query string parameters in the URL.
 * 
 * @param router - The Next.js router object.
 * @param params - An object containing key-value pairs to set or update in the query string.
 * @param options - Optional settings.
 *   - `replaceState`: If true, replaces the URL without adding a new history entry. Defaults to `true`.
 *   - `shallowRoute`: If true, replaces the URL without running data fetching methods again (e.g., getServerSideProps). Defaults to `false`.
 */
export function updateQueryParams(
  router: NextRouter,
  params: Record<string, string | number | undefined>,
  options?: { replaceState?: boolean; shallowRoute?: boolean}
) {
  const { replaceState = true, shallowRoute = false } = options || {};
  const currentQuery = { ...router.query };

  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) {
      delete currentQuery[key];
    } else {
      currentQuery[key] = params[key]?.toString() || '';
    }
  });

  const url = {
    pathname: router.pathname,
    query: currentQuery,
  };

  if (replaceState) {
    router.replace(url, undefined, { shallow: shallowRoute, scroll: false });
  } else {
    router.push(url, undefined, { shallow: shallowRoute, scroll: false });
  }
}
