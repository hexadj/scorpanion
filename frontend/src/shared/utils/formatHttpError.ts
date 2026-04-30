import type { AxiosBaseQueryError } from '../../services';

export const formatHttpError = (err: unknown) => {
  const e = err as AxiosBaseQueryError | undefined;
  if (e?.data !== undefined && e.data !== null) {
    return typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
  }
  return null;
};
