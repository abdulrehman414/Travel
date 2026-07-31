import type { ReactNode } from 'react';
import { ImmersiveBackground } from './immersive-background';

/**
 * Wraps a marketing page in the immersive cinematic context: the fixed WebGL
 * backdrop behind, page content layered above it. The backdrop mounts only while
 * this shell is rendered, so it disposes when navigating to functional pages.
 */
export function ImmersiveShell({ children }: { children: ReactNode }) {
  return (
    // `dark` scopes the theme tokens to their dark values, so pages built with
    // semantic classes (bg-card, text-foreground, …) turn cinematic over the
    // globe with no per-element rewrites.
    <div className="immersive-root dark">
      <ImmersiveBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
