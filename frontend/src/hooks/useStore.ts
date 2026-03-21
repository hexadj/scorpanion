/**
 * Hooks Redux typés pour l'application
 *
 * Utiliser useAppDispatch et useAppSelector dans tous les composants à la place de useDispatch/useSelector
 * pour bénéficier du typage du store (RootState, AppDispatch). Évite les casts manuels.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/** Dispatch typé : pour dispatcher les actions des slices. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Selector typé : pour lire l'état (ex. selectAuthUser). */
export const useAppSelector = useSelector.withTypes<RootState>();
