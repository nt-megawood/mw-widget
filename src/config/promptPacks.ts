import { UI_COPY, type UiCopy, type WidgetLanguage } from './i18n';
import type { AudiencePath, QuickReplyAction, WidgetVariant } from '../types';

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

type PromptPackMap = Record<WidgetVariant, Record<AudiencePath, PromptPackDef[]>>;

const PROMPT_PACKS: PromptPackMap = {
  website: {
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

export function getPromptPack(variant: WidgetVariant, audiencePath: AudiencePath, language: WidgetLanguage = 'de'): PromptPackOption[] {
  return resolvePack(PROMPT_PACKS[variant][audiencePath], language);
}

export function getDefaultPromptPack(variant: WidgetVariant, language: WidgetLanguage = 'de'): PromptPackOption[] {
  return resolvePack(PROMPT_PACKS[variant].privatkunde, language);
}
