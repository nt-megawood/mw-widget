import React, { useState, useCallback, useEffect, useRef } from 'react';
import { loadTerracePlanData, saveTerracePlanData } from '../../services/api';
import type { TerracePlanData } from '../../types';
import {
  DIELEN_VARIANTS, DIELEN_COLORS, PLANNING_FORM_FIELDS, SHAPE_LABELS, PROFIL_OPTIONS, UK_OPTIONS,
  normalizePlanningForm, parseGroesseValue, toPositiveNumber,
} from './planningData';
import type { ShapeVariant } from './planningData';

const DEFAULT_DIELEN_ID = 5;
const DEFAULT_FARBE_ID = 37;

interface DimensionValues {
  [key: string]: string;
}

interface PlanningEditorProps {
  onPlanningCodeDetected?: (code: string) => void;
  detectedCode?: string;
}

export const PlanningEditor: React.FC<PlanningEditorProps> = ({ detectedCode }) => {
  const [planningCode, setPlanningCode] = useState(detectedCode || '');
  const [loadedPayload, setLoadedPayload] = useState<TerracePlanData | null>(null);
  const [selectedForm, setSelectedForm] = useState<ShapeVariant>('rechteck');
  const [dimensionValues, setDimensionValues] = useState<DimensionValues>({});
  const [selectedDielenId, setSelectedDielenId] = useState(DEFAULT_DIELEN_ID);
  const [selectedFarbeId, setSelectedFarbeId] = useState(DEFAULT_FARBE_ID);
  const [selectedProfil, setSelectedProfil] = useState('bronze');
  const [selectedUK, setSelectedUK] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const setStatusMsg = (message: string, type: 'success' | 'error' | '' = '') =>
    setStatus({ type, message });

  const getAvailableColors = (dielenId: number) =>
    DIELEN_VARIANTS[dielenId]?.colors ?? DIELEN_VARIANTS[DEFAULT_DIELEN_ID].colors;

  const handleDielenChange = (newDielenId: number) => {
    setSelectedDielenId(newDielenId);
    const colors = getAvailableColors(newDielenId);
    if (!colors.includes(selectedFarbeId)) {
      setSelectedFarbeId(colors[0] ?? 1);
    }
  };

  const handleDimensionChange = (key: string, value: string) => {
    setDimensionValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (newForm: ShapeVariant) => {
    setSelectedForm(newForm);
  };

  const handleLoad = useCallback(async (codeOverride?: string) => {
    const code = (codeOverride ?? planningCode).trim();
    if (!code) {
      setStatusMsg('Bitte zuerst einen Planungscode eingeben.', 'error');
      return;
    }
    setIsLoading(true);
    setStatusMsg('Planungsdaten werden geladen ...');
    try {
      const payload = await loadTerracePlanData(code);
      setLoadedPayload(payload);
      const form = normalizePlanningForm(payload.form);
      const groesse = parseGroesseValue(payload.groesse);
      const fields = PLANNING_FORM_FIELDS[form] || [];
      const dims: DimensionValues = {};
      fields.forEach((f) => { dims[f.key] = String(groesse[f.key] ?? ''); });
      const dielenId = Number(payload.dielenId || DEFAULT_DIELEN_ID);
      const farbeId = Number(payload.dielenFarbeId || DEFAULT_FARBE_ID);
      setSelectedForm(form);
      setDimensionValues(dims);
      setSelectedDielenId(dielenId);
      setSelectedFarbeId(farbeId);
      setSelectedProfil(String(payload.profil || 'bronze'));
      setSelectedUK(String(payload.uk || 'standard'));
      if (payload.terrassencode) setPlanningCode(payload.terrassencode);
      setStatusMsg('Planungsdaten erfolgreich geladen.', 'success');
    } catch (err) {
      setStatusMsg((err as Error).message || 'Planung konnte nicht geladen werden.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [planningCode]);

  // When a planning code is detected in the chat, automatically update the input
  // and trigger a load — but only for new codes that differ from the current one.
  const lastDetectedCodeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!detectedCode) return;
    if (detectedCode === lastDetectedCodeRef.current) return;
    lastDetectedCodeRef.current = detectedCode;
    setPlanningCode(detectedCode);
    handleLoad(detectedCode);
  }, [detectedCode, handleLoad]);

  const buildPayload = (): TerracePlanData => {
    if (!loadedPayload) throw new Error('Es sind noch keine Planungsdaten geladen.');
    const fields = PLANNING_FORM_FIELDS[selectedForm] || [];
    const groesseObj: Record<string, number> = {};
    for (const field of fields) {
      const val = toPositiveNumber(dimensionValues[field.key]);
      if (val === null) throw new Error(`Bitte '${field.label}' als Zahl größer 0 eingeben.`);
      groesseObj[field.key] = val;
    }
    return {
      ...loadedPayload,
      terrassencode: planningCode.trim() || loadedPayload.terrassencode,
      form: selectedForm,
      groesse: JSON.stringify(groesseObj),
      dielenId: String(selectedDielenId),
      dielenFarbeId: String(selectedFarbeId),
      profil: selectedProfil,
      uk: selectedUK,
      language: String(loadedPayload.language || 'de'),
      _tempSave: String(loadedPayload._tempSave || 'false'),
    };
  };

  const handleSave = async () => {
    if (!loadedPayload) return;
    setIsSaving(true);
    setStatusMsg('Änderungen werden gespeichert ...');
    try {
      const payload = buildPayload();
      const result = await saveTerracePlanData(payload);
      const nextCode = result.terrassencode || String(payload.terrassencode || '');
      if (nextCode) setPlanningCode(nextCode);
      setStatusMsg(`Planung gespeichert. Aktueller Code: ${nextCode}`, 'success');
      // reload to reflect server state
      const reloaded = await loadTerracePlanData(nextCode);
      setLoadedPayload(reloaded);
    } catch (err) {
      setStatusMsg((err as Error).message || 'Speichern fehlgeschlagen.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const fields = PLANNING_FORM_FIELDS[selectedForm] || [];
  const availableColors = getAvailableColors(selectedDielenId);

  return (
    <aside className="chat-side-menu" aria-label="Planung bearbeiten">
      <h3>Planung bearbeiten</h3>
      <div className="side-menu-card planning-card">
        <label className="planning-label" htmlFor="planning-code-input">Planungscode</label>
        <div className="planning-code-row">
          <input
            id="planning-code-input"
            className="planning-input"
            type="text"
            placeholder="z.B. mgw150823"
            autoComplete="off"
            value={planningCode}
            onChange={(e) => setPlanningCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
          />
          <button
            className="side-menu-btn side-menu-btn-primary"
            type="button"
            onClick={() => handleLoad()}
            disabled={isLoading}
          >
            {isLoading ? '…' : 'Laden'}
          </button>
        </div>
        <p className="planning-hint">
          Sobald der Chat eine Planung erstellt hat, wird der Code hier automatisch erkannt.
        </p>
        <p
          className={`planning-status${status.type === 'error' ? ' is-error' : status.type === 'success' ? ' is-success' : ''}`}
          aria-live="polite"
        >
          {status.message}
        </p>
      </div>

      {loadedPayload && (
        <div className="side-menu-card planning-editor" aria-live="polite">
          <strong className="planning-editor-title">
            Geladene Planung: {loadedPayload.terrassencode || planningCode}
          </strong>
          <div className="planning-form-grid">
            <label className="planning-label" htmlFor="planning-form">Form</label>
            <select
              id="planning-form"
              className="planning-input"
              value={selectedForm}
              onChange={(e) => handleFormChange(e.target.value as ShapeVariant)}
            >
              {(Object.keys(SHAPE_LABELS) as ShapeVariant[]).map((shape) => (
                <option key={shape} value={shape}>{SHAPE_LABELS[shape]}</option>
              ))}
            </select>

            {fields.length > 0 && (
              <div id="planning-dimensions" className="planning-dimensions-block">
                {fields.map((field) => (
                  <React.Fragment key={field.key}>
                    <label className="planning-label" htmlFor={`planning-dim-${field.key}`}>
                      {field.label}
                    </label>
                    <input
                      id={`planning-dim-${field.key}`}
                      className="planning-input"
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={dimensionValues[field.key] ?? ''}
                      onChange={(e) => handleDimensionChange(field.key, e.target.value)}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}

            <label className="planning-label" htmlFor="planning-dielen-id">Diele</label>
            <select
              id="planning-dielen-id"
              className="planning-input"
              value={selectedDielenId}
              onChange={(e) => handleDielenChange(Number(e.target.value))}
            >
              {Object.entries(DIELEN_VARIANTS)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([id, variant]) => (
                  <option key={id} value={id}>
                    {variant.name} {variant.masse}
                  </option>
                ))}
            </select>

            <label className="planning-label" htmlFor="planning-dielen-farbe-id">Dielenfarbe</label>
            <select
              id="planning-dielen-farbe-id"
              className="planning-input"
              value={availableColors.includes(selectedFarbeId) ? selectedFarbeId : availableColors[0]}
              onChange={(e) => setSelectedFarbeId(Number(e.target.value))}
            >
              {availableColors.map((colorId) => (
                <option key={colorId} value={colorId}>
                  {DIELEN_COLORS[colorId] ?? `Farbe ${colorId}`}
                </option>
              ))}
            </select>

            <label className="planning-label" htmlFor="planning-profil">Profil</label>
            <select
              id="planning-profil"
              className="planning-input"
              value={selectedProfil}
              onChange={(e) => setSelectedProfil(e.target.value)}
            >
              {PROFIL_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            <label className="planning-label" htmlFor="planning-uk">UK</label>
            <select
              id="planning-uk"
              className="planning-input"
              value={selectedUK}
              onChange={(e) => setSelectedUK(e.target.value)}
            >
              {UK_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <div className="planning-actions-row">
            <button
              className="side-menu-btn"
              type="button"
              onClick={() => handleLoad()}
              disabled={isLoading}
            >
              Neu laden
            </button>
            <button
              className="side-menu-btn side-menu-btn-primary"
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
