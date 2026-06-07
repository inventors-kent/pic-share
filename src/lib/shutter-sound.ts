"use client";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextConstructor =
    window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  audioContext = new AudioContextConstructor();
  return audioContext;
}

export async function playShutterSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume();
  }

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.38, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  master.connect(context.destination);

  const click = context.createOscillator();
  click.type = "triangle";
  click.frequency.setValueAtTime(980, now);
  click.frequency.exponentialRampToValueAtTime(360, now + 0.11);
  click.connect(master);
  click.start(now);
  click.stop(now + 0.14);

  const bufferSize = Math.floor(context.sampleRate * 0.045);
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
  }

  const noise = context.createBufferSource();
  const noiseGain = context.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  noise.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now + 0.018);
  noise.stop(now + 0.07);
}
