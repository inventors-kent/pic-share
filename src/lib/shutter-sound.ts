"use client";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;
let shutterBuffer: AudioBuffer | null = null;
let shutterLoadPromise: Promise<AudioBuffer | null> | null = null;
const activeSources = new Set<AudioBufferSourceNode>();

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextConstructor =
    window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  audioContext = new AudioContextConstructor();
  return audioContext;
}

async function loadShutterBuffer(context: AudioContext) {
  if (shutterBuffer) return shutterBuffer;
  if (shutterLoadPromise) return shutterLoadPromise;

  shutterLoadPromise = fetch("/sounds/camera-shutter.mp3")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Camera shutter sound could not be loaded.");
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
    .then((buffer) => {
      shutterBuffer = buffer;
      return buffer;
    })
    .catch(() => null);

  return shutterLoadPromise;
}

export async function primeShutterSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  await loadShutterBuffer(context);
}

export function stopShutterSound() {
  activeSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // The source may have already ended naturally.
    }
  });
  activeSources.clear();
}

export async function playShutterSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  const buffer = await loadShutterBuffer(context);
  if (!buffer) return;

  stopShutterSound();

  const source = context.createBufferSource();
  const gain = context.createGain();
  const duration = buffer.duration;
  const fadeStart = Math.max(0, duration - 0.03);
  source.buffer = buffer;
  gain.gain.setValueAtTime(0.92, context.currentTime);
  gain.gain.setValueAtTime(0.92, context.currentTime + fadeStart);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
  source.connect(gain);
  gain.connect(context.destination);
  source.addEventListener("ended", () => {
    activeSources.delete(source);
  });
  activeSources.add(source);
  source.start(context.currentTime, 0, duration);
}
