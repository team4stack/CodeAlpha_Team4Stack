/** Remove legacy Vite PWA / Workbox workers left over from the pre-Next.js app. */
export async function cleanupLegacyServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(
    registrations.map(async (registration) => {
      const scriptUrl =
        registration.active?.scriptURL ||
        registration.installing?.scriptURL ||
        registration.waiting?.scriptURL ||
        '';

      const isCurrentAppWorker = scriptUrl.endsWith('/sw.js');
      const isLegacyViteWorker =
        /dev-sw|workbox|vite|pwa-entry/i.test(scriptUrl) || !isCurrentAppWorker;

      if (isLegacyViteWorker) {
        await registration.unregister();
      }
    })
  );

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => /workbox|vite|pwa|precache/i.test(key))
        .map((key) => caches.delete(key))
    );
  }
}
