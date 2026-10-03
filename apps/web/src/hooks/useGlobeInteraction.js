import { useEffect } from "react";

export function useGlobeInteraction(
  canvasRef,
  globeRef,
  cameraRef,
  isDragging,
  previousMouse,
  rotationVelocity,
  autoRotate,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX, y: clientY };
    };

    const handleDown = (e) => {
      isDragging.current = true;
      autoRotate.current = false;
      previousMouse.current = getPos(e);
      rotationVelocity.current = { x: 0, y: 0 };
    };

    const handleMove = (e) => {
      if (!isDragging.current || !globeRef.current) return;
      const pos = getPos(e);
      const dx = pos.x - previousMouse.current.x;
      const dy = pos.y - previousMouse.current.y;
      globeRef.current.rotation.y += dx * 0.005;
      globeRef.current.rotation.x += dy * 0.005;
      rotationVelocity.current = { x: dx * 0.003, y: dy * 0.003 };
      previousMouse.current = pos;
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    // Zoom with mouse wheel
    const handleWheel = (e) => {
      e.preventDefault();
      const camera = cameraRef.current;
      if (!camera) return;
      const zoomSpeed = 0.15;
      const minZ = 1.8;
      const maxZ = 8;
      const delta = e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
      const newZ = camera.position.z + delta;
      camera.position.z = Math.max(minZ, Math.min(maxZ, newZ));
      autoRotate.current = false;
    };

    // Zoom with pinch on touch
    let lastPinchDist = 0;
    const getPinchDist = (e) => {
      if (e.touches.length < 2) return 0;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastPinchDist = getPinchDist(e);
      } else {
        handleDown(e);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const camera = cameraRef.current;
        if (!camera) return;
        const newDist = getPinchDist(e);
        if (lastPinchDist > 0) {
          const scale = lastPinchDist / newDist;
          const zoomSpeed = 0.03;
          const delta = (scale - 1) * 10 * zoomSpeed;
          const minZ = 1.8;
          const maxZ = 8;
          const newZ = camera.position.z + delta;
          camera.position.z = Math.max(minZ, Math.min(maxZ, newZ));
          autoRotate.current = false;
        }
        lastPinchDist = newDist;
      } else {
        handleMove(e);
      }
    };

    const handleTouchEnd = (e) => {
      lastPinchDist = 0;
      handleUp();
    };

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleUp);
    canvas.addEventListener("mouseleave", handleUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleDown);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleUp);
      canvas.removeEventListener("mouseleave", handleUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
}
