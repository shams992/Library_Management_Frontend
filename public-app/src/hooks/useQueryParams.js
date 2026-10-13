import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** URL-synced filter/pagination state so dashboard views are shareable. */
export const useQueryParams = (defaults = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = searchParams.get(key);
    if (value !== null) params[key] = value;
  }

  const setParams = useCallback(
    (updates, { replace = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const resetParams = useCallback(
    (keys = Object.keys(defaults)) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        keys.forEach((k) => next.delete(k));
        return next;
      }, { replace: true });
    },
    [setSearchParams, defaults]
  );

  return { params, setParams, resetParams, searchParams };
};
