import type { ReactNode } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
}

export function Window({ title, children }: WindowProps) {
  return (
    <div className="win95-window">
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" className="title-bar-button">
            <span className="minimize-icon">_</span>
          </button>
          <button aria-label="Maximize" className="title-bar-button">
            <span className="maximize-icon">□</span>
          </button>
          <button aria-label="Close" className="title-bar-button close-button">
            <span className="close-icon">×</span>
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
