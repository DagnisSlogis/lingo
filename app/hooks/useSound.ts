import { useCallback, useEffect, useRef, useState } from "react";

export type SoundType =
  | "keyPress"
  | "letterPlaced"
  | "correct"
  | "wrong"
  | "win"
  | "lose"
  | "menuClick"
  | "yourTurn"
  | "opponentGuess";

// Using Web Audio API for retro 8-bit sounds
// These are procedurally generated to avoid needing external sound files

interface AudioContext {
  context: globalThis.AudioContext | null;
  initialized: boolean;
}

const audioState: AudioContext = {
  context: null,
  initialized: false,
};

function getAudioContext(): globalThis.AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioState.context) {
    try {
      audioState.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn("Web Audio API not supported");
      return null;
    }
  }

  return audioState.context;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume: number = 0.3,
  decay: boolean = true
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (needed for user interaction requirement)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  if (decay) {
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  }

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playKeyPress() {
  playTone(800, 0.05, "square", 0.15);
}

function playLetterPlaced() {
  playTone(440, 0.08, "square", 0.2);
}

function playCorrect() {
  // Rising tone for correct
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const notes = [523, 659, 784]; // C5, E5, G5 - happy chord
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "square", 0.25), i * 80);
  });
}

function playWrong() {
  // Descending buzzer for wrong
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  playTone(200, 0.3, "sawtooth", 0.3);
}

function playWin() {
  // Celebratory fanfare
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "square", 0.3), i * 120);
  });
  // Final sustained note
  setTimeout(() => playTone(1047, 0.5, "square", 0.25), 500);
}

function playLose() {
  // Sad descending tones
  const notes = [392, 349, 311, 262]; // G4, F4, Eb4, C4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "triangle", 0.25), i * 180);
  });
}

function playMenuClick() {
  playTone(600, 0.05, "square", 0.15);
}

function playYourTurn() {
  // Alert notification - two beeps
  playTone(880, 0.1, "square", 0.2);
  setTimeout(() => playTone(1100, 0.15, "square", 0.25), 120);
}

function playOpponentGuess() {
  // Subtle notification
  playTone(400, 0.1, "triangle", 0.15);
}

const soundFunctions: Record<SoundType, () => void> = {
  keyPress: playKeyPress,
  letterPlaced: playLetterPlaced,
  correct: playCorrect,
  wrong: playWrong,
  win: playWin,
  lose: playLose,
  menuClick: playMenuClick,
  yourTurn: playYourTurn,
  opponentGuess: playOpponentGuess,
};

// Shared state across all useSound instances
let globalSoundEnabled = typeof window !== "undefined"
  ? localStorage.getItem("lingo_sound_enabled") !== "false"
  : true;

const SOUND_TOGGLE_EVENT = "lingo-sound-toggle";

export function useSound() {
  const [enabled, setEnabled] = useState(globalSoundEnabled);
  const initialized = useRef(false);

  // Listen for sound toggle events from other instances
  useEffect(() => {
    const handleSoundToggle = (e: CustomEvent<boolean>) => {
      setEnabled(e.detail);
    };

    window.addEventListener(SOUND_TOGGLE_EVENT, handleSoundToggle as EventListener);
    return () => {
      window.removeEventListener(SOUND_TOGGLE_EVENT, handleSoundToggle as EventListener);
    };
  }, []);

  // Initialize audio context on first user interaction
  useEffect(() => {
    if (initialized.current) return;

    const initAudio = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
      initialized.current = true;
    };

    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabled) return;

    try {
      soundFunctions[sound]();
    } catch (error) {
      console.warn("Failed to play sound:", error);
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    const newValue = !globalSoundEnabled;
    globalSoundEnabled = newValue;

    if (typeof window !== "undefined") {
      localStorage.setItem("lingo_sound_enabled", String(newValue));
      // Notify all other useSound instances
      window.dispatchEvent(new CustomEvent(SOUND_TOGGLE_EVENT, { detail: newValue }));
    }

    setEnabled(newValue);
  }, []);

  return {
    play,
    enabled,
    toggle,
  };
}
