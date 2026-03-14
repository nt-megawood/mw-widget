import React from 'react';

interface BrandPopupProps {
  onClose: () => void;
}

export const BrandPopup: React.FC<BrandPopupProps> = ({ onClose }) => {
  return (
    <div className="brand-popup-overlay" onClick={onClose}>
      <div className="brand-popup" onClick={(e) => e.stopPropagation()}>
        <button className="brand-popup-close" onClick={onClose}>&times;</button>
        <h3>Über diesen Assistenten</h3>
        <p>
          Dieser KI-Assistent wird von megawood® bereitgestellt und von{' '}
          <a href="https://www.neuetechnologie.de" target="_blank" rel="noopener noreferrer">
            Neue Technologie GmbH
          </a>{' '}
          entwickelt.
        </p>
        <p className="brand-disclaimer">
          KI-Assistenten können Fehler machen. Bitte überprüfe wichtige Informationen.
        </p>
      </div>
    </div>
  );
};
