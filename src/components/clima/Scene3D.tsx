"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, Suspense } from "react";
import * as THREE from "three";

// Note: I will use standard Math.random for simplicity to avoid maath dependency
function ParticleSwarm(props: React.ComponentProps<typeof Points>) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random points in a sphere
  const [sphere] = useState(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 2.5;
      
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta); // x
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      positions[i * 3 + 2] = r * Math.cos(phi); // z
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#84cc16"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0b0b0d]">
      <Canvas camera={{ position: [0, 0, 1.5] }}>
        <Suspense fallback={null}>
          <ParticleSwarm />
        </Suspense>
      </Canvas>
    </div>
  );
}
