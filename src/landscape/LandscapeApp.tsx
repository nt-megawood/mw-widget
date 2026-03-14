import { useState, useCallback } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { PlanningEditor } from '../components/PlanningEditor';
import type { WidgetConfig } from '../types';

interface LandscapeAppProps {
  config: WidgetConfig;
}

export function LandscapeApp({ config }: LandscapeAppProps) {
  const [detectedPlanningCode, setDetectedPlanningCode] = useState<string | undefined>(undefined);

  const handlePlanningCodeDetected = useCallback((code: string) => {
    setDetectedPlanningCode(code);
  }, []);

  return (
    <ChatWidget
      config={config}
      widgetId="landscape"
      onPlanningCodeDetected={handlePlanningCodeDetected}
    >
      <PlanningEditor detectedCode={detectedPlanningCode} />
    </ChatWidget>
  );
}
