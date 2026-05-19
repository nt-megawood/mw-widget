import { useState, useCallback } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { PlanningEditor } from '../components/PlanningEditor';
import type { WidgetConfig } from '../types';
import type { WidgetLanguage } from '../config/i18n';

interface PlannerAppProps {
  config: WidgetConfig;
}

export function PlannerApp({ config }: PlannerAppProps) {
  const [detectedPlanningCode, setDetectedPlanningCode] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<WidgetLanguage>('de');

  const handlePlanningCodeDetected = useCallback((code: string) => {
    setDetectedPlanningCode(code);
  }, []);

  const handleLanguageChange = useCallback((lang: WidgetLanguage) => {
    setLanguage(lang);
  }, []);

  return (
    <ChatWidget
      config={config}
      widgetId="planner"
      onPlanningCodeDetected={handlePlanningCodeDetected}
      onLanguageChange={handleLanguageChange}
    >
      <PlanningEditor detectedCode={detectedPlanningCode} language={language} />
    </ChatWidget>
  );
}
