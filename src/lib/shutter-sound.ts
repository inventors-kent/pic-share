"use client";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;
let shutterBuffer: AudioBuffer | null = null;
let shutterLoadPromise: Promise<AudioBuffer | null> | null = null;

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

  shutterLoadPromise = fetch("/sounds/camera-shutter.wav")
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

export async function playShutterSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  const buffer = await loadShutterBuffer(context);
  if (!buffer) return;

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(0.92, context.currentTime);
  source.connect(gain);
  gain.connect(context.destination);
  source.start();
}
