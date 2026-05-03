export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  sources?: Source[];
  quickReplies?: QuickReplyOption[];
  inputRequest?: InputRequest | null;
  timestamp: Date;
  sessionId?: string;
}

export type EntryGoal =
  | 'produktberatung'
  | 'terrassenplanung'
  | 'vorhandene_planung'
  | 'händler_finden';

export type AudiencePath = 'privatkunde' | 'gewerblich';

export type PageContext = 'start' | 'product_detail' | 'planner';

export interface EntryContext {
  goal: EntryGoal | null;
  audiencePath: AudiencePath | null;
}

export type Source = string;

export interface ApiResponse {
  answer: string;
  sources?: Source[];
  quick_replies?: QuickReplyOption[];
  input_request?: InputRequest | null;
  conversation_id: string;
}

export type QuickReplyAction =
  | 'send_message'
  | 'open_url'
  | 'request_location_input'
  | 'request_planning_code_input'
  | 'request_muster_bestellen_input'
  | 'start_dealer_flow'
  | 'open_dealer_results';

export type DealerFlowStatus =
  | 'started'
  | 'location_requested'
  | 'location_submitted'
  | 'results_shown'
  | 'click_completed_intent';

export interface DealerFlowContext {
  status: DealerFlowStatus;
  city?: string;
  postal_code?: string;
  results_url?: string;
}

export interface QuickReplyOption {
  label: string;
  message: string;
  action?: QuickReplyAction;
  url?: string;
}

export interface InputRequestField {
  key: string;
  label: string;
}

export interface InputRequest {
  type: 'dimension_input' | 'dealer_location_input' | 'planning_code_input' | 'muster_bestellen_input';
  form?: ShapeVariant;
  title?: string;
  fields: InputRequestField[];
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

export interface TerraceHistoryItem {
  terrassencode: string;
  zuletztaktualisiert?: string;
  form?: string;
  koordinaten?: string;
  diele?: string;
  farbe?: string;
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
  pageContext: PageContext;
  teaser: TeaserConfig;
  apiUrl?: string;
}
