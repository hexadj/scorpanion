import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Fusionne des classes CSS : `clsx` assemble les morceaux (conditions, tableaux…), `twMerge` résout les conflits Tailwind (ex. `p-2` + `p-4` → `p-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
