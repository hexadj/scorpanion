/**
 * Hooks Redux typés — à utiliser avec `useAppDispatch` / `useAppSelector` dans les composants.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
