import type { AxiosError, AxiosRequestConfig } from 'axios';
import { axiosClient } from './axiosClient';

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
};

export type AxiosBaseQueryError = {
  status?: number;
  data: unknown;
};

export const axiosBaseQuery =
  () =>
  async ({ url, method = 'get', data, params }: AxiosBaseQueryArgs) => {
    try {
      const result = await axiosClient({
        url,
        method,
        data,
        params,
      });

      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data ?? axiosError.message,
        } satisfies AxiosBaseQueryError,
      };
    }
  };
