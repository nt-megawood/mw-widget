import { ChatWidget } from '../components/ChatWidget';
import type { WidgetConfig } from '../types';

interface PlannerAppProps {
  config: WidgetConfig;
}

export function PlannerApp({ config }: PlannerAppProps) {
  return <ChatWidget config={config} widgetId="planner" />;
}
