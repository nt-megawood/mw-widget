import type { PageContext } from '../types';

const PAGE_CONTEXT_ALIASES: Record<string, PageContext> = {
  start: 'start',
  homepage: 'start',
  home: 'start',
  product_detail: 'product_detail',
  productdetail: 'product_detail',
  product: 'product_detail',
  planner: 'planner',
  terrassenplaner: 'planner',
};

export function normalizePageContext(value: string | null | undefined, fallback: PageContext): PageContext {
  const key = String(value || '').trim().toLowerCase();
  return PAGE_CONTEXT_ALIASES[key] || fallback;
}
