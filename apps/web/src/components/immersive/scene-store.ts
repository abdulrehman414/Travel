/**
 * Tiny mutable singleton the WebGL render loop reads every frame. Updated by DOM
 * listeners in <ImmersiveBackground/> (scroll + pointer). Deliberately NOT React
 * state — the render loop mutates/reads it directly so scrolling never triggers
 * React re-renders.
 */
export const sceneStore = {
  /** 0..1 progress down the immersive page. */
  scrollProgress: 0,
  /** Normalised pointer position, -1..1 on each axis. */
  pointerX: 0,
  pointerY: 0,
  /** Honour prefers-reduced-motion: freeze heavy motion when true. */
  reducedMotion: false,
};

export function resetSceneStore(): void {
  sceneStore.scrollProgress = 0;
  sceneStore.pointerX = 0;
  sceneStore.pointerY = 0;
}
