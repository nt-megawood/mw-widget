import type { AudiencePath, PageContext, QuickReplyAction } from '../types';

export interface PromptPackOption {
  label: string;
  message: string;
  action?: QuickReplyAction;
}

type PromptPackMap = Record<PageContext, Record<AudiencePath, PromptPackOption[]>>;

const PROMPT_PACKS: PromptPackMap = {
  start: {
    privatkunde: [
      { label: 'Wie kannst du mir helfen?', message: 'Was kannst du alles für mich tun?' },
      { label: 'Die passende Diele finden', message: 'Ich suche eine passende Diele für meine Terrasse. Kannst du mir eine einfache Empfehlung geben?' },
      { label: 'Händler in meiner Nähe', message: 'Ich suche einen Händler in meiner Nähe.' },
    ],
    gewerblich: [
      { label: 'Projektbezogene Beratung', message: 'Ich plane ein Kundenprojekt und brauche eine strukturierte Produktberatung.' },
      { label: 'Technische Eigenschaften', message: 'Welche technischen Unterschiede gibt es bei den megawood® Dielenvarianten?' },
      { label: 'Partnerhändler finden', message: 'Ich suche einen megawood Partnerhändler in meiner Nähe.' },
    ],
  },
  product_detail: {
    privatkunde: [
      { label: 'Schnellstart: Welche Diele passt?', message: 'Ich bin Privatkunde und neu beim Thema Terrasse. Welche Diele passt gut für einen pflegeleichten Start?' },
      { label: 'Farbe einfach auswählen', message: 'Welche Dielenfarbe wirkt modern und ist im Alltag unempfindlich?' },
      { label: 'Passenden Händler finden', message: 'Kannst du mir für dieses Produkt einen passenden Händler in meiner Nähe zeigen?' },
    ],
    gewerblich: [
      { label: 'Produkt im Projektkontext', message: 'Ich plane gewerblich: Wofür eignet sich dieses Produkt im Projektkontext besonders?' },
      { label: 'Variantenvergleich', message: 'Vergleiche mir die relevanten Varianten zu diesem Produkt kompakt nach Einsatz und Optik.' },
      { label: 'Regionalen Partner finden', message: 'Ich brauche einen regionalen Partnerhändler für dieses Produkt.' },
    ],
  },
  planner: {
    privatkunde: [
      { label: 'Neue Planung erstellen', message: 'Ich möchte eine neue Terrassenplanung erstellen.' },
      { label: 'Vorhandene Planung nutzen', message: '', action: 'request_planning_code_input' },
      { label: 'Nach der Planung Händler finden', message: 'Ich möchte nach der Planung direkt einen Händler in meiner Nähe finden.' },
    ],
    gewerblich: [
      { label: 'Projektplanung starten', message: 'Ich möchte eine neue Terrassenplanung für ein Projekt starten.' },
      { label: 'Planungscode weiterbearbeiten', message: '', action: 'request_planning_code_input' },
      { label: 'Händler/Partner für Umsetzung', message: 'Ich möchte nach der Planung einen passenden Partnerhändler für die Umsetzung finden.' },
    ],
  },
};

export function getPromptPack(pageContext: PageContext, audiencePath: AudiencePath): PromptPackOption[] {
  return PROMPT_PACKS[pageContext][audiencePath];
}

export function getDefaultPromptPack(pageContext: PageContext): PromptPackOption[] {
  return PROMPT_PACKS[pageContext].privatkunde;
}

export { PROMPT_PACKS };
