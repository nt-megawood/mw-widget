import React, { useState } from 'react';
import { loadTerracePlanData, saveTerracePlanData } from '../../services/api';
import type { TerracePlanData } from '../../types';
import { DIELEN_PRODUCTS, COLORS, PROFIL_OPTIONS, UK_OPTIONS, SHAPE_LABELS } from './planningData';
import type { ShapeVariant } from './planningData';

interface PlanningEditorProps {
  onPlanningCodeDetected?: (code: string) => void;
  detectedCode?: string;
}

export const PlanningEditor: React.FC<PlanningEditorProps> = ({ detectedCode }) => {
  const [planningCode, setPlanningCode] = useState(detectedCode || '');
  const [planData, setPlanData] = useState<TerracePlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeVariant>('rechteck');
  const [selectedDielen, setSelectedDielen] = useState(DIELEN_PRODUCTS[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedProfil, setSelectedProfil] = useState(PROFIL_OPTIONS[0]);
  const [selectedUK, setSelectedUK] = useState(UK_OPTIONS[0]);

  const handleLoad = async () => {
    if (!planningCode.trim()) {
      setStatus({ type: 'error', message: 'Bitte gib einen Planungscode ein.' });
      return;
    }
    setIsLoading(true);
    setStatus(null);
    try {
      const data = await loadTerracePlanData(planningCode.trim());
      setPlanData(data);
      if (data.terrasse?.grundform) {
        setSelectedShape(data.terrasse.grundform as ShapeVariant);
      }
      setStatus({ type: 'success', message: 'Planung erfolgreich geladen.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Fehler beim Laden der Planung.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!planData) return;
    setIsSaving(true);
    setStatus(null);
    try {
      const updatedData = {
        ...planData,
        terrasse: { ...planData.terrasse, grundform: selectedShape },
        dielen: { ...planData.dielen, art: selectedDielen, farbe: selectedColor, profil: selectedProfil },
        unterkonstruktion: { art: selectedUK },
      };
      const result = await saveTerracePlanData(updatedData);
      setStatus({ type: 'success', message: `Gespeichert! Code: ${result.terrassencode}` });
    } catch (error) {
      setStatus({ type: 'error', message: 'Fehler beim Speichern der Planung.' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="chat-side-menu">
      <h3>Planung bearbeiten</h3>
      <div className="planning-load-row">
        <input
          type="text"
          className="planning-code-input"
          placeholder="Planungscode eingeben…"
          value={planningCode}
          onChange={(e) => setPlanningCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
        />
        <button className="planning-load-btn" onClick={handleLoad} disabled={isLoading}>
          {isLoading ? '…' : 'Laden'}
        </button>
      </div>

      {status && (
        <p className={`planning-status ${status.type}`}>{status.message}</p>
      )}

      {planData && (
        <div className="planning-form">
          <div className="planning-field">
            <label>Form</label>
            <select value={selectedShape} onChange={(e) => setSelectedShape(e.target.value as ShapeVariant)}>
              {(Object.keys(SHAPE_LABELS) as ShapeVariant[]).map((shape) => (
                <option key={shape} value={shape}>{SHAPE_LABELS[shape]}</option>
              ))}
            </select>
          </div>
          <div className="planning-field">
            <label>Dielen</label>
            <select value={selectedDielen} onChange={(e) => setSelectedDielen(e.target.value)}>
              {DIELEN_PRODUCTS.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="planning-field">
            <label>Farbe</label>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              {COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div className="planning-field">
            <label>Profil</label>
            <select value={selectedProfil} onChange={(e) => setSelectedProfil(e.target.value)}>
              {PROFIL_OPTIONS.map((profil) => (
                <option key={profil} value={profil}>{profil}</option>
              ))}
            </select>
          </div>
          <div className="planning-field">
            <label>Unterkonstruktion</label>
            <select value={selectedUK} onChange={(e) => setSelectedUK(e.target.value)}>
              {UK_OPTIONS.map((uk) => (
                <option key={uk} value={uk}>{uk}</option>
              ))}
            </select>
          </div>
          <div className="planning-actions">
            <button className="planning-save-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
