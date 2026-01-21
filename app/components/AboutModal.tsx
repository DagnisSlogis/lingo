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
            <img src="/img/netatirgus.svg" alt="Lingo" className="about-logo" />
          </div>
          <h2>NetaTirgus Lingo</h2>
          <p className="version">Versija 1.0</p>

          <div className="about-description">
            <p>
              Visiem zināmā Tildes Lingo spēlē, lai uzjundīto nostaļģiskas sajūtas :)
            </p>
            <p>
              Spēlē klasisko versiju vai izaicini pretinieku uz Dueli.

            </p>
          </div>

          <div className="about-credits">
            <p>© 2026</p>
            <p>Izstrādājusi komanda no Netatirgus.lv</p>
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
