import { useEffect } from "react";
import { TEXTURE_URLS } from "@/utils/mapConstants";

export function useTextureSwitch(mapMode, globeMatRef, loadTexture) {
  useEffect(() => {
    if (!globeMatRef.current) return;
    const url =
      mapMode === "satellite" ? TEXTURE_URLS.satellite : TEXTURE_URLS.map;
    loadTexture(url).then((tex) => {
      if (tex && globeMatRef.current) {
        globeMatRef.current.map = tex;
        globeMatRef.current.color.set(0xffffff);
        globeMatRef.current.needsUpdate = true;
      }
    });
  }, [mapMode]);
}
