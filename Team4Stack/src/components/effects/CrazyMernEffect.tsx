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

    // Center spheres removed - only corner half spheres now

    // --------------------------
    // FLOATING RINGS (Enhanced decorative elements) - COMMENTED OUT (only rings removed, balls kept)
    // --------------------------
    // const rings: THREE.Mesh[] = [];
    // const ringBasePositions = [
    //   { x: -60, y: 20, z: -30 },
    //   { x: 60, y: -20, z: -30 },
    //   { x: 0, y: 40, z: 20 },
    // ];

    // ringBasePositions.forEach((pos, index) => {
    //   // Varied ring sizes and thickness for visual interest
    //   const ringSizes = [18, 20, 16]; // Different radii
    //   const ringThickness = [2, 2.5, 1.8]; // Different tube radii
    //   
    //   const ringGeo = new THREE.TorusGeometry(
    //     ringSizes[index],      // radius (varied)
    //     ringThickness[index],   // tube radius (varied)
    //     16,                     // radial segments (increased for smoother rings)
    //     32                      // tubular segments (increased for better quality)
    //   );
    //   
    //   // Different colors for each ring
    //   const ringColors = isDarkMode 
    //     ? ["#00eaff", "#8b5cf6", "#00eaff"] // Cyan and Purple
    //     : ["#6366f1", "#818cf8", "#6366f1"]; // Indigo shades
    //   
    //   const ringMat = new THREE.MeshBasicMaterial({
    //     color: ringColors[index],
    //     wireframe: true,
    //     transparent: true,
    //     opacity: isDarkMode ? 0.25 : 0.2, // More visible
    //     side: THREE.DoubleSide,
    //   });

    //   const ring = new THREE.Mesh(ringGeo, ringMat);
    //   ring.position.set(pos.x, pos.y, pos.z);
    //   
    //   // Varied initial rotations for each ring
    //   const initialRotations = [
    //     { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
    //     { x: Math.PI / 3, y: Math.PI / 4, z: 0 },
    //     { x: 0, y: Math.PI / 4, z: Math.PI / 3 },
    //   ];
    //   ring.rotation.x = initialRotations[index].x;
    //   ring.rotation.y = initialRotations[index].y;
    //   ring.rotation.z = initialRotations[index].z;
    //   
    //   rings.push(ring);
    //   scene.add(ring);
    // });

    // --------------------------
    // BALLS REMOVED - not needed
    // --------------------------

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
      rectLight.color.set(isDarkMode ? "#00eaff" : "#4a4a4a");

      // Animate floating rings with enhanced, varied animations - COMMENTED OUT (only rings removed, balls kept)
      // rings.forEach((ring, index) => {
      //   // Varied rotation speeds on all axes for dynamic movement
      //   const rotSpeeds = [
      //     { x: 0.002, y: 0.006, z: 0.003 },
      //     { x: 0.003, y: 0.004, z: 0.005 },
      //     { x: 0.001, y: 0.007, z: 0.002 },
      //   ];
      //   
      //   ring.rotation.x += rotSpeeds[index].x;
      //   ring.rotation.y += rotSpeeds[index].y;
      //   ring.rotation.z += rotSpeeds[index].z;
      //   
      //   // Enhanced floating animation with 3D movement
      //   const basePos = ringBasePositions[index];
      //   const floatX = Math.sin(time * (0.4 + index * 0.1) + index * 0.5) * 6;
      //   const floatY = Math.cos(time * (0.5 + index * 0.15) + index * 0.7) * 8;
      //   const floatZ = Math.sin(time * (0.3 + index * 0.1) + index * 0.3) * 4;
      //   
      //   ring.position.x = basePos.x + floatX;
      //   ring.position.y = basePos.y + floatY;
      //   ring.position.z = basePos.z + floatZ;
      //   
      //   // Gentle pulsing effect
      //   const pulse = 1 + Math.sin(time * 0.6 + index * 0.5) * 0.12;
      //   ring.scale.set(pulse, pulse, pulse);
      //   
      //   // Breathing opacity effect
      //   const mat = ring.material as THREE.MeshBasicMaterial;
      //   mat.opacity = isDarkMode
      //     ? (0.25 + Math.sin(time * 1.0 + index * 0.6) * 0.08)
      //     : (0.2 + Math.sin(time * 1.0 + index * 0.6) * 0.08);
      // });

      // Ball animation removed

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
      
      // Dispose code removed - no balls or rings to dispose
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

