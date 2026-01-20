type IconName =
  | "heart"
  | "heart-empty"
  | "heart-broken"
  | "gamepad"
  | "swords"
  | "trophy"
  | "target"
  | "party"
  | "sad"
  | "person"
  | "check"
  | "cross";

interface PixelIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function PixelIcon({ name, size = 16, className = "" }: PixelIconProps) {
  const icons: Record<IconName, JSX.Element> = {
    heart: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#ff0000"
          d="M2 2h2v1h1v1h1v1h1V4h1V3h1V2h1V1h2v1h2v1h1v2h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H7v-1H6v-1H5v-1H4V9H3V8H2V6H1V4h1V2z"
        />
        <path
          fill="#cc0000"
          d="M4 3h1v1H4V3zm6 0h1v1h-1V3zM3 5h1v1H3V5zm8 0h1v1h-1V5z"
        />
        <path
          fill="#ff6666"
          d="M3 3h1v1H3V3zm6 0h1v1H9V3z"
        />
      </svg>
    ),
    "heart-empty": (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#666666"
          d="M2 2h2v1h1v1h1v1h1V4h1V3h1V2h1V1h2v1h2v1h1v2h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H7v-1H6v-1H5v-1H4V9H3V8H2V6H1V4h1V2z"
        />
        <path
          fill="#444444"
          d="M4 3h1v1H4V3zm6 0h1v1h-1V3zM3 5h1v1H3V5zm8 0h1v1h-1V5z"
        />
      </svg>
    ),
    "heart-broken": (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#cc0000"
          d="M2 2h2v1h1v1h1v1h1V4h1V3h1V2h1V1h2v1h2v1h1v2h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H7v-1H6v-1H5v-1H4V9H3V8H2V6H1V4h1V2z"
        />
        <path
          fill="#000000"
          d="M8 3h1v1H8V3zm-1 1h1v1H7V4zm1 1h1v1H8V5zm-1 1h1v1H7V6zm0 1h1v1H7V7zm1 1h1v1H8V8zm-1 1h1v1H7V9zm0 1h1v1H7v-1z"
        />
      </svg>
    ),
    gamepad: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#808080"
          d="M3 4h10v1h1v6h-1v1H3v-1H2V5h1V4z"
        />
        <path
          fill="#c0c0c0"
          d="M4 5h8v1h1v4h-1v1H4v-1H3V6h1V5z"
        />
        <path
          fill="#000080"
          d="M5 7h1v2H5V7zm1-1h1v1H6V6zm0 3h1v1H6V9z"
        />
        <path
          fill="#800000"
          d="M11 7h1v1h-1V7zm-1 1h1v1h-1V8z"
        />
      </svg>
    ),
    swords: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#c0c0c0"
          d="M2 1h1v1h1v1h1v1h1v1h1v1h1V5h1V4h1V3h1V2h1V1h1v2h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v2h-1v-1h-1v-1H9v-1H8v1H7v1H6v1H5v-1h1v-2h1V9h1V8h1V7H8V6H7V5H6V4H5V3H4V2H3V1H2z"
        />
        <path
          fill="#808080"
          d="M3 2h1v1H3V2zm9 0h1v1h-1V2zM5 12h1v1H5v-1zm5 0h1v1h-1v-1z"
        />
        <path
          fill="#804000"
          d="M4 12h1v2H4v-2zm7 0h1v2h-1v-2z"
        />
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#ffcc00"
          d="M4 2h8v1h1v1h1v2h-1v1h-1v1h-1V7h1V5h1V4h-1V3H4v1H3v1h1v2H3V6H2V4h1V3h1V2z"
        />
        <path
          fill="#ffaa00"
          d="M5 3h6v1h1v3h-1v1h-1v1H6V8H5V7H4V4h1V3z"
        />
        <path
          fill="#ffcc00"
          d="M7 9h2v2H7V9z"
        />
        <path
          fill="#804000"
          d="M5 11h6v1H5v-1z"
        />
        <path
          fill="#ffcc00"
          d="M4 12h8v2H4v-2z"
        />
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#ff0000"
          d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2V1z"
        />
        <path
          fill="#ffffff"
          d="M6 3h4v1h1v1h1v4h-1v1h-1v1H6v-1H5v-1H4V6h1V5h1V3z"
        />
        <path
          fill="#ff0000"
          d="M7 5h2v1h1v2h-1v1H7V8H6V6h1V5z"
        />
        <path
          fill="#ffffff"
          d="M7 7h2v2H7V7z"
        />
      </svg>
    ),
    party: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#ffcc00"
          d="M7 1h2v1H7V1zM5 2h1v1H5V2zm5 0h1v1h-1V2zM3 4h1v1H3V4zm9 0h1v1h-1V4z"
        />
        <path
          fill="#ff6600"
          d="M6 3h4v1h1v2h-1v2H9v2H8v3H7v-3H6V8H5V6H4V4h1V3h1z"
        />
        <path
          fill="#ffcc00"
          d="M7 4h2v1H7V4z"
        />
        <path
          fill="#00cc00"
          d="M2 8h1v1H2V8zm11 0h1v1h-1V8zM4 10h1v1H4v-1zm7 0h1v1h-1v-1z"
        />
        <path
          fill="#ff00ff"
          d="M1 6h1v1H1V6zm13 0h1v1h-1V6zM3 12h1v1H3v-1zm9 0h1v1h-1v-1z"
        />
      </svg>
    ),
    sad: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#ffcc00"
          d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2V1z"
        />
        <path
          fill="#000000"
          d="M5 5h2v2H5V5zm4 0h2v2H9V5zM5 10h1v1h1v1h2v-1h1v-1h1v1h-1v1h-1v1H7v-1H6v-1H5v-1z"
        />
      </svg>
    ),
    person: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#808080"
          d="M6 1h4v1h1v3h-1v1H6V5H5V2h1V1z"
        />
        <path
          fill="#c0c0c0"
          d="M7 2h2v2H7V2z"
        />
        <path
          fill="#808080"
          d="M4 7h8v1h1v6h-2v-4H5v4H3V8h1V7z"
        />
        <path
          fill="#000080"
          d="M5 8h6v1H5V8z"
        />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#00aa00"
          d="M12 3h2v2h-1v1h-1v1h-1v1h-1v1H9v1H8v1H7v-1H6v-1H5v-1H4V7h2v1h1v1h1V8h1V7h1V6h1V5h1V3z"
        />
      </svg>
    ),
    cross: (
      <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
        <path
          fill="#cc0000"
          d="M3 3h2v1h1v1h1v1h1V5h1V4h1V3h2v2h-1v1h-1v1h-1v1h1v1h1v1h1v2h-2v-1H9v-1H8v-1H7v1H6v1H5v1H3v-2h1v-1h1V9h1V8H5V7H4V6H3V3z"
        />
      </svg>
    ),
  };

  return icons[name] || null;
}
