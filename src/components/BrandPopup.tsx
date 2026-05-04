import React from 'react';

const BASE_URL = import.meta.env.BASE_URL;

interface BrandPopupProps {
  onClose: () => void;
}

export const BrandPopup: React.FC<BrandPopupProps> = ({ onClose }) => {
  return (
    <div className="brand-popup" role="dialog" aria-label="Informationen über den KI-Assistenten">
      <button
        className="brand-popup-close"
        onClick={onClose}
        aria-label="Schließen"
        title="Schließen"
      >
        &times;
      </button>
      <p>
        Ich bin ein KI-gestützter Assistent und helfe dir bei Fragen rund um megawood&#174;. Meine
        Antworten werden automatisch generiert &ndash; ich bin daher möglicherweise nicht immer
        100&nbsp;% korrekt. Bitte überprüfe wichtige Informationen.
      </p>
      <div className="brand-popup-footer">
        <img src={`${BASE_URL}woody.png`} alt="Woody" /> megawood KI
      </div>
    </div>
  );
};
