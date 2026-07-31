'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { resetSceneStore, sceneStore } from './scene-store';

// Client-only: never server-render WebGL. Lazy so the ~500KB three bundle never
// blocks first paint or ships to routes that don't mount the scene.
const SceneCanvas = dynamic(() => import('./scene-canvas'), { ssr: false, loading: () => null });

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Fixed, full-viewport cinematic backdrop: a dark night-sky gradient with the
 * live WebGL globe painted over it. Sits behind all content (pointer-events:none)
 * and degrades gracefully to just the gradient when WebGL is unavailable.
 */
export function ImmersiveBackground() {
  const [enabled, setEnabled] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    sceneStore.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!webglAvailable()) return;
    setEnabled(true);

    // R3F measures its container on mount; if layout isn't ready yet the canvas
    // sticks at the default 300x150. Nudge a re-measure once things are laid out
    // (and after the lazy scene chunk has had time to mount).
    const nudges = [80, 300, 700, 1200].map((ms) =>
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), ms),
    );

    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      sceneStore.scrollProgress = Math.min(1, Math.max(0, window.scrollY / max));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf.current = requestAnimationFrame(update);
      }
    };
    const onPointer = (e: PointerEvent) => {
      sceneStore.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneStore.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      nudges.forEach((id) => clearTimeout(id));
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      cancelAnimationFrame(raf.current);
      resetSceneStore();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'radial-gradient(1200px 760px at 50% -8%, #0d2150 0%, #081334 42%, #060a18 72%, #04060f 100%)',
      }}
    >
      {enabled && <SceneCanvas />}
    </div>
  );
}
