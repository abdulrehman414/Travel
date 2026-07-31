'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { GlobeScene } from './globe';

function Starfield() {
  const positions = useMemo(() => {
    const count = 1600;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#cdd8ff"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export default function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <fog attach="fog" args={['#060a18', 10, 30]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <directionalLight position={[-6, -2, -4]} intensity={0.5} color="#3a6bff" />
      <Starfield />
      <GlobeScene />
    </Canvas>
  );
}
