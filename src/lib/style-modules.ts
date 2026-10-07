import { type ClassValue } from "clsx";
import { cn } from "@/lib/utils";

/** Merge CSS module class with optional Tailwind overrides */
export function cm(
  moduleClass: string | undefined,
  ...overrides: ClassValue[]
): string {
  return cn(moduleClass, ...overrides);
}
