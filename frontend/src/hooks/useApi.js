import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useApiData — fetch data dari endpoint dengan loading/error/pagination state
 * Usage: const { data, loading, error, refetch, meta, setParams } = useApiData(apiFn, initialParams)
 */
export function useApiData(apiFn, initialParams = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [params, setParams] = useState(initialParams);
  const _abortRef = useRef(null);

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(overrideParams ?? params);
      const { data: d, meta: m } = res.data;
      setData(d);
      if (m) setMeta(m);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.response?.data?.message || 'Gagal memuat data.');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, ...deps]);

  useEffect(() => {
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return { data, loading, error, meta, refetch: fetch, params, setParams };
}

/**
 * useCrud — wrapper untuk operasi create/update/delete dengan loading state per operasi
 */
export function useCrud(api) {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null); // id yang sedang dihapus

  const create = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await api.create(data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menyimpan data.',
        errors: err.response?.data?.errors || {},
      };
    } finally {
      setSubmitting(false);
    }
  }, [api]);

  const update = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      const res = await api.update(id, data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal memperbarui data.',
        errors: err.response?.data?.errors || {},
      };
    } finally {
      setSubmitting(false);
    }
  }, [api]);

  const remove = useCallback(async (id) => {
    setDeleting(id);
    try {
      await api.delete(id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Gagal menghapus data.',
      };
    } finally {
      setDeleting(null);
    }
  }, [api]);

  return { submitting, deleting, create, update, remove };
}

/**
 * usePagination — state helper for paginated tables
 */
export function usePagination(initialPage = 1, initialPerPage = 15) {
  const [page, setPage] = useState(initialPage);
  const [perPage] = useState(initialPerPage);

  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback((meta) => {
    if (meta && page < meta.last_page) setPage((p) => p + 1);
  }, [page]);
  const prevPage = useCallback(() => {
    if (page > 1) setPage((p) => p - 1);
  }, [page]);

  return { page, perPage, goToPage, nextPage, prevPage };
}
