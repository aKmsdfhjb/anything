import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TEXTURE_URLS } from "@/utils/mapConstants";

export function useGlobeScene(canvasRef) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const globeMatRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const textureCache = useRef({});

  const [globeReady, setGlobeReady] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const loadTexture = (url) => {
    return new Promise((resolve) => {
      if (textureCache.current[url]) {
        resolve(textureCache.current[url]);
        return;
      }
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          textureCache.current[url] = texture;
          resolve(texture);
        },
        undefined,
        () => {
          resolve(null);
        },
      );
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1e);
    sceneRef.current = scene;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Globe with texture
    const globeGeo = new THREE.SphereGeometry(1.4, 96, 96);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      shininess: 15,
      specular: 0x333333,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);
    globeRef.current = globe;
    globeMatRef.current = globeMat;

    // Atmosphere
    const atmGeo = new THREE.SphereGeometry(1.48, 64, 64);
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x4f9cff,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Outer glow
    const glowGeo = new THREE.SphereGeometry(1.55, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // Stars background
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 3000; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
      );
    }
    starsGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3),
    );
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(5, 3, 5);
    scene.add(directional);
    const rimLight = new THREE.DirectionalLight(0x4f9cff, 0.3);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);

    // Load initial texture
    loadTexture(TEXTURE_URLS.satellite).then((tex) => {
      if (tex) {
        globeMat.map = tex;
        globeMat.color.set(0xffffff);
        globeMat.needsUpdate = true;
        setTexturesLoaded(true);
      }
    });

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (autoRotate.current && !isDragging.current) {
        globe.rotation.y += 0.0015;
      }
      if (!isDragging.current) {
        globe.rotation.y += rotationVelocity.current.x;
        globe.rotation.x += rotationVelocity.current.y;
        rotationVelocity.current.x *= 0.95;
        rotationVelocity.current.y *= 0.95;
      }
      globe.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, globe.rotation.x),
      );
      renderer.render(scene, camera);
    };
    animate();
    setGlobeReady(true);

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    globeRef,
    globeMatRef,
    isDragging,
    previousMouse,
    rotationVelocity,
    autoRotate,
    globeReady,
    texturesLoaded,
    loadTexture,
  };
}
