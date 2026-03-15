export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: Source[];
  timestamp: Date;
  sessionId?: string;
}

export type Source = string;

export interface ApiResponse {
  answer: string;
  sources?: Source[];
  conversation_id: string;
}

export interface PresenceResponse {
  is_active: boolean;
  new_messages: Array<{ role: string; text: string }>;
  history_count: number;
}

export interface ConversationHistoryItem {
  role: string;
  text: string;
}

export interface ConversationResponse {
  conversation_id: string;
  history: ConversationHistoryItem[];
}

export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'middle-right' | 'middle-left';

export type ShapeVariant = 'rechteck' | 'lform' | 'uform' | 'oform';

export interface TerracePlanData {
  terrassencode?: string;
  form?: string;
  groesse?: string;
  dielenId?: string | number;
  dielenFarbeId?: string | number;
  profil?: string;
  uk?: string;
  language?: string;
  _tempSave?: string;
  [key: string]: unknown;
}

export interface TeaserConfig {
  show: boolean;
  title: string;
  text: string;
}

export interface WidgetConfig {
  mode: 'classic' | 'landscape';
  position: Position;
  teaser: TeaserConfig;
  apiUrl?: string;
}
