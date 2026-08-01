import type { ReactNode } from 'react';

/**
 * The immersive cinematic backdrop (globe) is now global — rendered once in the
 * root layout so it persists across navigation. This wrapper is kept as a simple
 * passthrough for import compatibility with pages that already use it.
 */
export function ImmersiveShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
