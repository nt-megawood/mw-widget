/**
 * Zentrale API-Konfiguration
 * 
 * Alle API URLs werden hier definiert und können über die .env Datei
 * an einer zentralen Stelle konfiguriert werden.
 * 
 * Usage:
 * import { getApiUrl, getConversationUrl } from '../config/api';
 * const url = getApiUrl(); // http://localhost:8000/v1/chat
 */

// ============================================================================
// API Base URLs - All in one place
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get the full chat API URL
 * @returns Full URL including /v1/chat endpoint
 */
export function getApiUrl(): string {
  return `${API_BASE_URL}/v1/chat`;
}

/**
 * Get the conversation API URL base (for history operations)
 * @returns Conversation base URL
 */
export function getConversationUrl(): string {
  return `${API_BASE_URL}/v1/conversation`;
}

/**
 * Get the backend base URL (without endpoint paths)
 * Used for other API calls like token generation
 * @returns Base URL (e.g., http://localhost:8000)
 */
export function getBackendBaseUrl(): string {
  return API_BASE_URL;
}

// ============================================================================
// Terrace Planner URLs
// ============================================================================

export const TERRACE_LOAD_URL = 
  import.meta.env.VITE_TERRACE_LOAD_URL || 
  'https://betaplaner.megawood.com/api/terrassedaten/ladeDaten';

export const TERRACE_SAVE_URL = 
  import.meta.env.VITE_TERRACE_SAVE_URL || 
  'https://betaplaner.megawood.com/api/terrassedaten/speichereDaten';

export const TERRACE_BAUPLAN_PDF_URL_BASE = 
  import.meta.env.VITE_TERRACE_BAUPLAN_URL_BASE || 
  'https://betaplaner.megawood.com/api/bauplan/pdf';

export const TERRACE_MATERIALLISTE_PDF_URL_BASE = 
  import.meta.env.VITE_TERRACE_MATERIALLISTE_URL_BASE || 
  'https://betaplaner.megawood.com/api/materialliste/pdf';

export const TERRACE_HISTORY_URL_BASE = 
  import.meta.env.VITE_TERRACE_HISTORY_URL_BASE || 
  'https://betaplaner.megawood.com/api/terrassehistorie';

// ============================================================================
// Environment Info
// ============================================================================

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
