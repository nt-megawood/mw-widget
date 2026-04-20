import React from 'react';
import type { AudiencePath, EntryContext, EntryGoal } from '../../types';

interface GoalOption {
  value: EntryGoal;
  label: string;
  description: string;
}

interface AudienceOption {
  value: AudiencePath;
  label: string;
}

interface EntryFlowProps {
  entryContext: EntryContext;
  onGoalSelect: (goal: EntryGoal) => void;
  onAudienceSelect: (audiencePath: AudiencePath) => void;
  onStart: () => void;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'produktberatung',
    label: 'Produktberatung',
    description: 'Finde die passende Diele und erhalte Empfehlungen zu Eigenschaften und Einsatz.',
  },
  {
    value: 'terrassenplanung',
    label: 'Terrassenplanung',
    description: 'Starte die Planung deiner Terrasse Schritt für Schritt mit Woody.',
  },
  {
    value: 'vorhandene_planung',
    label: 'Vorhandene Planung nutzen',
    description: 'Lade oder bearbeite eine bestehende Planung mit deinem Planungscode.',
  },
  {
    value: 'händler_finden',
    label: 'Händler in meiner Nähe finden',
    description: 'Finde schnell einen megawood Partner in deiner Region.',
  },
];

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { value: 'privatkunde', label: 'Privatkunde' },
  { value: 'gewerblich', label: 'Gewerblich' },
];

export const EntryFlow: React.FC<EntryFlowProps> = ({
  entryContext,
  onGoalSelect,
  onAudienceSelect,
  onStart,
}) => {
  const isComplete = Boolean(entryContext.goal && entryContext.audiencePath);

  return (
    <div className="entry-flow" aria-label="Einstiegsauswahl">
      <div className="entry-flow-section">
        <h3 className="entry-flow-title">Wobei kann ich dich unterstützen?</h3>
        <p className="entry-flow-subtitle">Wähle zuerst dein Ziel für den Einstieg.</p>
        <div className="entry-goal-grid">
          {GOAL_OPTIONS.map((option) => {
            const selected = entryContext.goal === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`entry-goal-card ${selected ? 'is-selected' : ''}`}
                onClick={() => onGoalSelect(option.value)}
                aria-pressed={selected}
              >
                <span className="entry-goal-label">{option.label}</span>
                <span className="entry-goal-description">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="entry-flow-section">
        <h3 className="entry-flow-title">Für wen ist die Anfrage?</h3>
        <div className="entry-audience-row" role="group" aria-label="Zielgruppe auswählen">
          {AUDIENCE_OPTIONS.map((option) => {
            const selected = entryContext.audiencePath === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`entry-audience-btn ${selected ? 'is-selected' : ''}`}
                onClick={() => onAudienceSelect(option.value)}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="chat-btn entry-start-btn"
        onClick={onStart}
        disabled={!isComplete}
      >
        Beratung starten
      </button>
    </div>
  );
};
