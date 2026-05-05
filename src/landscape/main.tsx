import React from 'react';
import { createRoot } from 'react-dom/client';
import { LandscapeApp } from './LandscapeApp';
import type { WidgetConfig, TeaserConfig, Position } from '../types';
import { normalizePageContext } from '../config/pageContext';
import { getApiUrl } from '../config/api';
import '../styles/classic.css';
import '../styles/landscape.css';

// Configure API URL globally for all API calls
// This is read from VITE_API_BASE_URL environment variable
(window as unknown as Record<string, string>).CHATBOT_API_URL = getApiUrl();

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

function getPageContext() {
  const params = new URLSearchParams(window.location.search);
  const rawValue = params.get('page_context') || params.get('page-context');
  return normalizePageContext(rawValue, 'planner');
}

const config: WidgetConfig = {
  mode: 'landscape',
  position: getPosition(),
  pageContext: getPageContext(),
  teaser: getTeaserConfig(),
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LandscapeApp config={config} />
    </React.StrictMode>
  );
}
