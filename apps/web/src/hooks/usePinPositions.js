import { useEffect, useState } from "react";
import * as THREE from "three";
import { latLngToVector3, vector3ToScreenPos } from "@/utils/mapHelpers";

export function usePinPositions(
  globeReady,
  destinations,
  globeRef,
  cameraRef,
  canvasRef,
) {
  const [pinPositions, setPinPositions] = useState([]);

  useEffect(() => {
    if (!globeReady || destinations.length === 0) return;
    let active = true;

    const updatePins = () => {
      if (!active) return;
      const globe = globeRef.current;
      const camera = cameraRef.current;
      const canvas = canvasRef.current;
      if (!globe || !camera || !canvas) return;

      const newPins = destinations.map((dest) => {
        const localPos = latLngToVector3(dest.latitude, dest.longitude, 1.42);
        const worldPos = localPos.clone();
        globe.localToWorld(worldPos);
        const dirToCamera = new THREE.Vector3()
          .subVectors(camera.position, worldPos)
          .normalize();
        const surfaceNormal = worldPos.clone().sub(globe.position).normalize();
        const dot = dirToCamera.dot(surfaceNormal);
        const screenPos = vector3ToScreenPos(worldPos, camera, canvas);

        let dominantCategory = "recommend";
        if (
          dest.avoid_count > dest.recommend_count &&
          dest.avoid_count > dest.warning_count
        )
          dominantCategory = "avoid";
        else if (dest.warning_count > dest.recommend_count)
          dominantCategory = "safety_warning";

        return {
          ...dest,
          screenX: screenPos.x,
          screenY: screenPos.y,
          visible: dot > 0.15,
          dominantCategory,
        };
      });

      setPinPositions(newPins);
      requestAnimationFrame(updatePins);
    };

    requestAnimationFrame(updatePins);
    return () => {
      active = false;
    };
  }, [globeReady, destinations]);

  return pinPositions;
}
