import { UI_COPY, type UiCopy, type WidgetLanguage } from './i18n';
import type { AudiencePath, PageContext, QuickReplyAction } from '../types';

export interface PromptPackOption {
  label: string;
  message: string;
  action?: QuickReplyAction;
}

interface PromptPackDef {
  labelKey: keyof UiCopy;
  message: string;
  action?: QuickReplyAction;
}

type PromptPackMap = Record<PageContext, Record<AudiencePath, PromptPackDef[]>>;

const PROMPT_PACKS: PromptPackMap = {
  start: {
    privatkunde: [
      { labelKey: 'promptPackHowCanYouHelp', message: 'Was kannst du alles für mich tun?' },
      { labelKey: 'promptPackDiscoverDecking', message: 'Ich suche eine passende Diele für meine Terrasse. Welche Dielen bietet megawood® an?' },
      { labelKey: 'promptPackFindDealer', message: 'Ich suche einen Händler in meiner Nähe.' },
    ],
    gewerblich: [
      { labelKey: 'promptPackProjectConsulting', message: 'Ich plane ein Kundenprojekt und brauche eine strukturierte Produktberatung.' },
      { labelKey: 'promptPackTechnicalProperties', message: 'Welche technischen Unterschiede gibt es bei den megawood® Dielenvarianten?' },
      { labelKey: 'promptPackFindPartnerDealer', message: 'Ich suche einen megawood Partnerhändler in meiner Nähe.' },
    ],
  },
  product_detail: {
    privatkunde: [
      { labelKey: 'promptPackQuickstartDecking', message: 'Ich bin Privatkunde und neu beim Thema Terrasse. Welche Diele passt gut für einen pflegeleichten Start?' },
      { labelKey: 'promptPackChooseColour', message: 'Welche Dielenfarbe wirkt modern und ist im Alltag unempfindlich?' },
      { labelKey: 'quickReplyFindDealerProximity', message: 'Kannst du mir für dieses Produkt einen passenden Händler in meiner Nähe zeigen?' },
    ],
    gewerblich: [
      { labelKey: 'promptPackProductInProjectContext', message: 'Ich plane gewerblich: Wofür eignet sich dieses Produkt im Projektkontext besonders?' },
      { labelKey: 'promptPackVariantComparison', message: 'Vergleiche mir die relevanten Varianten zu diesem Produkt kompakt nach Einsatz und Optik.' },
      { labelKey: 'promptPackFindRegionalPartner', message: 'Ich brauche einen regionalen Partnerhändler für dieses Produkt.' },
    ],
  },
  planner: {
    privatkunde: [
      { labelKey: 'promptPackCreateNewPlan', message: 'Ich möchte eine neue Terrassenplanung erstellen.' },
      { labelKey: 'promptPackUseExistingPlan', message: '', action: 'request_planning_code_input' },
      { labelKey: 'promptPackFindDealer', message: 'Ich möchte nach der Planung direkt einen Händler in meiner Nähe finden.' },
    ],
    gewerblich: [
      { labelKey: 'promptPackStartProjectPlan', message: 'Ich möchte eine neue Terrassenplanung für ein Projekt starten.' },
      { labelKey: 'promptPackContinueWithCode', message: '', action: 'request_planning_code_input' },
      { labelKey: 'promptPackFindDealerForImplementation', message: 'Ich möchte nach der Planung einen passenden Partnerhändler für die Umsetzung finden.' },
    ],
  },
};

function resolvePack(defs: PromptPackDef[], language: WidgetLanguage): PromptPackOption[] {
  const copy = UI_COPY[language];
  return defs.map(({ labelKey, message, action }) => ({
    label: copy[labelKey] as string,
    message,
    ...(action ? { action } : {}),
  }));
}

export function getPromptPack(pageContext: PageContext, audiencePath: AudiencePath, language: WidgetLanguage = 'de'): PromptPackOption[] {
  return resolvePack(PROMPT_PACKS[pageContext][audiencePath], language);
}

export function getDefaultPromptPack(pageContext: PageContext, language: WidgetLanguage = 'de'): PromptPackOption[] {
  return resolvePack(PROMPT_PACKS[pageContext].privatkunde, language);
}
