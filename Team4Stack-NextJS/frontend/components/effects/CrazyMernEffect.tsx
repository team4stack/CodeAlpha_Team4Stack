'use client';

import React, { useRef, useEffect } from 'react';

interface CrazyMernEffectProps {
  isDarkMode?: boolean;
}

const CrazyMernEffect: React.FC<CrazyMernEffectProps> = ({ isDarkMode = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let rafId = 0;
    let renderer: { dispose: () => void; domElement: HTMLElement } | null = null;
    let onResizeHandler: (() => void) | null = null;
    let pGeometry: { dispose: () => void } | null = null;
    let pMaterial: { dispose: () => void } | null = null;

    const run = async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;

        const el = mountRef.current;
        if (!el) return;

        const width = Math.max(el.clientWidth, 1);
        const height = Math.max(el.clientHeight, 1);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
        camera.position.set(0, 0, 80);

        const webRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer = webRenderer;
        webRenderer.setSize(width, height);
        webRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        el.appendChild(webRenderer.domElement);

        const particleCount = 1200;
        const pGeom = new THREE.BufferGeometry();
        pGeometry = pGeom;
        const pPositions = new Float32Array(particleCount * 3);
        const pSpeeds = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          pPositions[i * 3] = (Math.random() - 0.5) * 200;
          pPositions[i * 3 + 1] = Math.random() * 120;
          pPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
          pSpeeds[i] = Math.random() * 0.3 + 0.2;
        }

        pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

        const pMat = new THREE.PointsMaterial({
          size: 1.5,
          color: isDarkMode ? '#00eaff' : '#000000',
          transparent: true,
          opacity: isDarkMode ? 0.6 : 0.4,
          blending: THREE.AdditiveBlending
        });
        pMaterial = pMat;

        const particles = new THREE.Points(pGeom, pMat);
        scene.add(particles);

        const rectLight = new THREE.PointLight(isDarkMode ? '#00eaff' : '#4a4a4a', 1.5, 300);
        rectLight.position.set(0, 30, 70);
        scene.add(rectLight);

        const animate = () => {
          if (disposed) return;
          rafId = requestAnimationFrame(animate);

          const pos = pGeom.attributes.position.array as Float32Array;
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
          pGeom.attributes.position.needsUpdate = true;

          pMat.color.set(isDarkMode ? '#00eaff' : '#000000');
          pMat.opacity = isDarkMode ? 0.6 : 0.4;
          rectLight.color.set(isDarkMode ? '#00eaff' : '#4a4a4a');

          webRenderer.render(scene, camera);
        };

        rafId = requestAnimationFrame(animate);

        onResizeHandler = () => {
          if (disposed || !mountRef.current || !webRenderer) return;
          const w = Math.max(mountRef.current.clientWidth, 1);
          const h = Math.max(mountRef.current.clientHeight, 1);
          webRenderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResizeHandler);
      } catch (error) {
        if (!disposed) {
          console.error('Failed to load three.js:', error);
        }
      }
    };

    void run();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (onResizeHandler) {
        window.removeEventListener('resize', onResizeHandler);
      }
      if (renderer) {
        renderer.dispose();
        const el = mountRef.current;
        if (el && renderer.domElement.parentNode === el) {
          try {
            el.removeChild(renderer.domElement);
          } catch {
            // already removed
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
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default CrazyMernEffect;
