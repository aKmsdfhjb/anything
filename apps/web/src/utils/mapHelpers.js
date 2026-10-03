import * as THREE from "three";

export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function vector3ToScreenPos(vector, camera, canvas) {
  const projected = vector.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * canvas.clientWidth,
    y: (-projected.y * 0.5 + 0.5) * canvas.clientHeight,
  };
}
