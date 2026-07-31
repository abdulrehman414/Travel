/**
 * Routes that render the cinematic immersive treatment (dark scope + fixed WebGL
 * globe backdrop). Kept in one place so the header/footer chrome matches the page.
 * Add a route here when its page is wrapped in <ImmersiveShell/>.
 */
export const IMMERSIVE_ROUTES = ['/', '/about', '/contact', '/domestic'] as const;

export function isImmersiveRoute(pathname: string): boolean {
  return IMMERSIVE_ROUTES.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(`${route}/`)),
  );
}
