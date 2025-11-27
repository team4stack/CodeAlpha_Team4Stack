import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface CrazyMernEffectProps {
  isDarkMode?: boolean;
}

const CrazyMernEffect: React.FC<CrazyMernEffectProps> = ({ isDarkMode = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --------------------------
    // Scene + Camera + Renderer
    // --------------------------
    const scene = new THREE.Scene();

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
    camera.position.set(0, 0, 80); // Centered view

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --------------------------
    // MERN CODE PARTICLES (removed green, smaller size)
    // --------------------------
    const particleCount = 1200;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 200;
      pPositions[i * 3 + 1] = Math.random() * 120;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      pSpeeds[i] = Math.random() * 0.3 + 0.2;
    }

    pGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pPositions, 3)
    );

    const pMaterial = new THREE.PointsMaterial({
      size: 1.5,
      color: isDarkMode ? "#00eaff" : "#000000", // Cyan for dark mode, black for light mode
      transparent: true,
      opacity: isDarkMode ? 0.6 : 0.4, // Slightly less opacity in light mode
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    // --------------------------
    // 3D WIRE BOX (React vibes) - smaller size, centered
    // --------------------------
    const boxGeo = new THREE.BoxGeometry(40, 40, 40);
    const boxMat = new THREE.MeshBasicMaterial({
      color: isDarkMode ? "#00eaff" : "#1a1a1a", // Cyan for dark mode, dark gray for light mode
      wireframe: true,
      transparent: true,
      opacity: isDarkMode ? 0.4 : 0.3,
    });

    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0, 0); // Center position
    scene.add(box);

    // --------------------------
    // LIGHTS
    // --------------------------
    const rectLight = new THREE.PointLight(isDarkMode ? "#00eaff" : "#4a4a4a", 1.5, 300);
    rectLight.position.set(0, 30, 70);
    scene.add(rectLight);

    // --------------------------
    // ANIMATE LOOP
    // --------------------------
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Floating particles animation (circular/orbital motion)
      const pos = pGeometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const baseX = pos[i3];
        const baseZ = pos[i3 + 2];
        const radius = 20 + (i % 10) * 2;
        const speed = 0.5 + (i % 5) * 0.1;
        
        // Circular floating motion
        pos[i3] = baseX + Math.sin(time * speed + i * 0.1) * 5;
        pos[i3 + 1] = pos[i3 + 1] + Math.sin(time * speed * 0.7 + i * 0.15) * 3;
        pos[i3 + 2] = baseZ + Math.cos(time * speed + i * 0.1) * 5;
      }
      pGeometry.attributes.position.needsUpdate = true;

      // Update colors based on theme (dynamic update)
      pMaterial.color.set(isDarkMode ? "#00eaff" : "#000000");
      pMaterial.opacity = isDarkMode ? 0.6 : 0.4;
      boxMat.color.set(isDarkMode ? "#00eaff" : "#1a1a1a");
      boxMat.opacity = isDarkMode ? 0.4 : 0.3;
      rectLight.color.set(isDarkMode ? "#00eaff" : "#4a4a4a");

      // Rotate 3D box with floating effect
      box.rotation.x += 0.003;
      box.rotation.y += 0.004;
      box.rotation.z += 0.002;
      
      // Floating box animation - centered in middle
      const floatY = Math.sin(time * 0.8) * 5;
      box.position.y = floatY; // Float around center (0)
      
      // Slight scale pulsing
      const scale = 1 + Math.sin(time * 1.2) * 0.05;
      box.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // --------------------------
    // HANDLE RESIZE
    // --------------------------
    const onResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Element might already be removed
        }
      }
      pGeometry.dispose();
      pMaterial.dispose();
      boxGeo.dispose();
      boxMat.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default CrazyMernEffect;

