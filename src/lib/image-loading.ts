'use client';

import { useEffect, useSyncExternalStore } from 'react';

type ImageState = 'idle' | 'loading' | 'ready' | 'error';
interface Entry { state: ImageState; listeners: Set<() => void> }
const images = new Map<string, Entry>();
const MASCOT_IMAGES = {
  cat: ['/mascot/cat-neutral.png', '/mascot/cat-happy.png', '/mascot/cat-yawn.png'],
  dog: ['/mascot/dog-neutral.png', '/mascot/dog-happy.png', '/mascot/dog-yawn.png'],
} as const;

export function mascotImages(kind: 'cat' | 'dog') { return MASCOT_IMAGES[kind]; }

function entry(src: string): Entry {
  let value = images.get(src);
  if (!value) { value = { state: 'idle', listeners: new Set() }; images.set(src, value); }
  return value;
}

function publish(value: Entry, state: ImageState) {
  value.state = state;
  value.listeners.forEach((listener) => listener());
}

/** Actual browser fetch + decode, shared across components using the same atlas. No delay. */
function load(src: string) {
  const value = entry(src);
  if (value.state !== 'idle') return;
  publish(value, 'loading');
  const image = new Image();
  image.decoding = 'async';
  image.onload = async () => {
    try {
      await image.decode();
      publish(value, 'ready');
    } catch { publish(value, 'error'); }
    image.onload = image.onerror = null;
  };
  image.onerror = () => { publish(value, 'error'); image.onload = image.onerror = null; };
  image.src = src;
}

export function retryImages(sources: readonly string[]) {
  for (const src of sources) {
    const value = entry(src);
    if (value.state === 'error') { publish(value, 'idle'); load(src); }
  }
}

export function useImagesReady(sources: readonly string[]) {
  // A primitive dependency also handles callers passing a fresh array each render.
  const key = JSON.stringify(sources);
  const state = useSyncExternalStore(
    (listener) => {
      const values = (JSON.parse(key) as string[]).map(entry);
      values.forEach((value) => value.listeners.add(listener));
      return () => values.forEach((value) => value.listeners.delete(listener));
    },
    () => {
      const values = (JSON.parse(key) as string[]).map((src) => entry(src).state);
      return values.includes('error') ? 'error' : values.every((value) => value === 'ready') ? 'ready' : 'loading';
    },
    () => sources.length ? 'loading' : 'ready',
  );
  useEffect(() => { (JSON.parse(key) as string[]).forEach(load); }, [key]);
  return { ready: state === 'ready', loading: state === 'loading', error: state === 'error' };
}
