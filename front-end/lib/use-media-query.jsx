"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // false during SSR — matchMedia isn't available on the server.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
