import type { DealerFlowStatus, PageContext } from '../types';

export type DealerConversionEventName =
  | 'dealer_flow_started'
  | 'dealer_location_submitted'
  | 'dealer_results_shown'
  | 'dealer_click_completed';

export interface DealerConversionEventPayload {
  widget_variant?: 'classic' | 'landscape';
  page_context?: PageContext;
  audience_path?: string | null;
  conversation_id?: string | null;
  dealer_flow_status?: DealerFlowStatus;
  city?: string;
  postal_code?: string;
  results_url?: string;
}

function pushMatomoEvent(eventName: DealerConversionEventName, payload: DealerConversionEventPayload): void {
  const maybeWindow = window as Window & { _paq?: unknown[] };
  const paq = maybeWindow._paq;
  if (!Array.isArray(paq)) return;

  paq.push([
    'trackEvent',
    'chatbot_conversion',
    eventName,
    payload.page_context || payload.widget_variant || 'unknown',
  ]);
}

export function dispatchDealerConversionEvent(
  eventName: DealerConversionEventName,
  payload: DealerConversionEventPayload,
): void {
  if (typeof window === 'undefined') return;

  try {
    const detail = {
      name: eventName,
      payload,
      timestamp: Date.now(),
    };
    window.dispatchEvent(new CustomEvent('mw:dealer-conversion', { detail }));
    pushMatomoEvent(eventName, payload);
  } catch {
    // No-op by design: event hooks must never block core chat behavior.
  }
}
