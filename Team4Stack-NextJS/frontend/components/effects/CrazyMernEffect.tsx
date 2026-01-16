'use client';

import React, { useRef, useEffect } from "react";

interface CrazyMernEffectProps {
  isDarkMode?: boolean;
}

const CrazyMernEffect: React.FC<CrazyMernEffectProps> = ({ isDarkMode = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let THREE: any;
    let scene: any, camera: any, renderer: any;
    let particles: any, pGeometry: any, pMaterial: any;
    let rectLight: any;
    let frameId: number;
    let particleCount = 1200;
    let onResizeHandler: (() => void) | null = null;

    // Dynamically import three.js only on client side
    const initThree = async () => {
      try {
        THREE = await import('three');
        
        // --------------------------
        // Scene + Camera + Renderer
        // --------------------------
        scene = new THREE.Scene();

        const width = mountRef.current!.clientWidth;
        const height = mountRef.current!.clientHeight;

        camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
        camera.position.set(0, 0, 80);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current!.appendChild(renderer.domElement);

        // --------------------------
        // MERN CODE PARTICLES
        // --------------------------
        pGeometry = new THREE.BufferGeometry();
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

        pMaterial = new THREE.PointsMaterial({
          size: 1.5,
          color: isDarkMode ? "#00eaff" : "#000000",
          transparent: true,
          opacity: isDarkMode ? 0.6 : 0.4,
          blending: THREE.AdditiveBlending,
        });

        particles = new THREE.Points(pGeometry, pMaterial);
        scene.add(particles);

        // --------------------------
        // LIGHTS
        // --------------------------
        rectLight = new THREE.PointLight(isDarkMode ? "#00eaff" : "#4a4a4a", 1.5, 300);
        rectLight.position.set(0, 30, 70);
        scene.add(rectLight);

        // --------------------------
        // ANIMATE LOOP
        // --------------------------
        const animate = () => {
          frameId = requestAnimationFrame(animate);

          // Floating particles animation
          const pos = pGeometry.attributes.position.array as Float32Array;
          const time = Date.now() * 0.001;
          
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const baseX = pos[i3];
            const baseZ = pos[i3 + 2];
            const speed = 0.5 + (i % 5) * 0.1;
            
            pos[i3] = baseX + Math.sin(time * speed + i * 0.1) * 5;
            pos[i3 + 1] = pos[i3 + 1] + Math.sin(time * speed * 0.7 + i * 0.15) * 3;
            pos[i3 + 2] = baseZ + Math.cos(time * speed + i * 0.1) * 5;
          }
          pGeometry.attributes.position.needsUpdate = true;

          // Update colors based on theme
          pMaterial.color.set(isDarkMode ? "#00eaff" : "#000000");
          pMaterial.opacity = isDarkMode ? 0.6 : 0.4;
          rectLight.color.set(isDarkMode ? "#00eaff" : "#4a4a4a");

          renderer.render(scene, camera);
        };

        animate();

        // --------------------------
        // HANDLE RESIZE
        // --------------------------
        onResizeHandler = () => {
          if (!mountRef.current) return;
          const newWidth = mountRef.current.clientWidth;
          const newHeight = mountRef.current.clientHeight;
          renderer.setSize(newWidth, newHeight);
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResizeHandler);
      } catch (error) {
        console.error('Failed to load three.js:', error);
      }
    };

    initThree();

    // Cleanup on unmount
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (onResizeHandler) {
        window.removeEventListener("resize", onResizeHandler);
      }
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && renderer.domElement) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (e) {
            // Element might already be removed
          }
        }
      }
      if (pGeometry) pGeometry.dispose();
      if (pMaterial) pMaterial.dispose();
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
