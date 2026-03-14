import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from '../components/ChatWidget';
import type { WidgetConfig, TeaserConfig, Position } from '../types';
import '../styles/classic.css';

function getTeaserConfig(): TeaserConfig {
  const params = new URLSearchParams(window.location.search);
  return {
    show: params.get('teaser') === '1' || params.get('teaser') === 'true',
    title: params.get('teaser_title') || 'Willkommen bei megawood® 👋',
    text: params.get('teaser_text') || 'Ich bin Woody, dein persönlicher KI-Assistent für alles rund um megawood® Terrassendielen.',
  };
}

function getPosition(): Position {
  const params = new URLSearchParams(window.location.search);
  return (params.get('position') as Position) || 'bottom-right';
}

const config: WidgetConfig = {
  mode: 'classic',
  position: getPosition(),
  teaser: getTeaserConfig(),
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget config={config} widgetId="classic" />
    </React.StrictMode>
  );
}
