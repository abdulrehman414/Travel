import type { ReactNode } from 'react';
import { ImmersiveBackground } from './immersive-background';

/**
 * Wraps a marketing page in the immersive cinematic context: the fixed WebGL
 * backdrop behind, page content layered above it. The backdrop mounts only while
 * this shell is rendered, so it disposes when navigating to functional pages.
 */
export function ImmersiveShell({ children }: { children: ReactNode }) {
  return (
    <div className="immersive-root">
      <ImmersiveBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
