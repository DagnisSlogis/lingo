interface TimerProps {
  seconds: number;
  isActive: boolean;
}

export function Timer({ seconds, isActive }: TimerProps) {
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className={`timer ${isActive ? "active" : ""} ${isLow ? "low" : ""} ${isCritical ? "critical" : ""}`}>
      <div className="timer-label">Laiks</div>
      <div className="timer-value">
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </div>
    </div>
  );
}
