import React from 'react';

interface BrandPopupProps {
  onClose: () => void;
}

export const BrandPopup: React.FC<BrandPopupProps> = ({ onClose }) => {
  return (
    <div className="brand-popup" onClick={onClose} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <p>
        Ich bin ein KI-gestützter Assistent und helfe dir bei Fragen rund um megawood&#174;. Meine
        Antworten werden automatisch generiert &ndash; ich bin daher möglicherweise nicht immer
        100&nbsp;% korrekt. Bitte überprüfe wichtige Informationen.
      </p>
      <div className="brand-popup-footer">
        <img src="/woody.jpg" alt="Woody" /> megawood KI
      </div>
    </div>
  );
};
