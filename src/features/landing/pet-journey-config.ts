/** Scroll keyframes in STORYBOARD.md, 8 October 2026. */
export const PET_JOURNEY = {
  yawnStart: 0.04,
  yawnFull: 0.2,
  enterStart: 0.24,
  enterEnd: 0.82,
  linksActive: 0.82,
  petFade: [0.74, 0.9],
  haloFade: [0.16, 0.3],
  portalFade: [0.24, 0.36],
  portalLight: [0.76, 0.82],
  previewMarks: [0.24, 0.44, 0.66, 0.82],
  previewRecenter: [0.62, 0.82],
  previewDesktop: [0.12, 0.3, 0.68, 1],
  previewMobile: [0.18, 0.4, 0.78, 1],
  maskOpaque: 0.86,
  zoom: { cat: 24, dog: 24 },
  mouth: { cat: { x: 0.5, y: 0.59, rx: 0.07, ry: 0.105 }, dog: { x: 0.5, y: 0.525, rx: 0.075, ry: 0.11 } },
} as const;
