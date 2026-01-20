import { PixelIcon } from "./PixelIcon";

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="win95-window modal about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Par programmu</div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              className="title-bar-button close-button"
              onClick={onClose}
            >
              <span className="close-icon">×</span>
            </button>
          </div>
        </div>
        <div className="window-body modal-body about-body">
          <div className="about-icon">
            <PixelIcon name="target" size={48} />
          </div>
          <h2>Lingo</h2>
          <p className="version">Versija 1.0</p>

          <div className="about-description">
            <p>
              Latviešu vārdu minēšanas spēle, kas balstīta uz klasisko TV šovu "Lingo".
            </p>
            <p>
              Uzminiet vārdu 6 mēģinājumos. Zaļš = pareiza vieta, dzeltens = nepareiza vieta, pelēks = nav vārdā.
            </p>
          </div>

          <div className="about-credits">
            <p>© 2024</p>
            <p>Izstrādāts ar <PixelIcon name="heart" size={16} /> Latvijā</p>
          </div>

          <div className="modal-actions">
            <button className="win95-button" onClick={onClose}>
              Labi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
