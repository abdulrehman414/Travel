'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { sceneStore } from './scene-store';

const R = 1.6;
const AQUA = '#41e0cf';
const GOLD = '#e7c86a';

/** Real destinations the platform serves. */
const CITIES = [
  { name: 'Makkah', lat: 21.4225, lng: 39.8262, hub: true },
  { name: 'Madinah', lat: 24.4686, lng: 39.6142 },
  { name: 'Jeddah', lat: 21.4858, lng: 39.1925 },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
] as const;

/** Arcs fan out from Makkah (the hub) to the world. */
const ROUTES: Array<[string, string]> = [
  ['Makkah', 'London'],
  ['Makkah', 'Istanbul'],
  ['Makkah', 'Cairo'],
  ['Makkah', 'Jakarta'],
  ['Makkah', 'Kuala Lumpur'],
  ['Makkah', 'New York'],
  ['Riyadh', 'Dubai'],
  ['Madinah', 'Istanbul'],
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-5) return a.clone();
  const sin = Math.sin(omega);
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega) / sin)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / sin));
}

/** A lifted great-circle curve between two surface points. */
function routeCurve(aName: string, bName: string): THREE.CatmullRomCurve3 {
  const ca = CITIES.find((c) => c.name === aName)!;
  const cb = CITIES.find((c) => c.name === bName)!;
  const a = latLngToVec3(ca.lat, ca.lng, 1).normalize();
  const b = latLngToVec3(cb.lat, cb.lng, 1).normalize();
  const lift = 0.18 + a.angleTo(b) * 0.14;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const p = slerp(a, b, t).normalize();
    p.multiplyScalar(R + Math.sin(t * Math.PI) * lift);
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Evenly distributed dots on the sphere (fibonacci) → glowing dotted globe. */
function Dots() {
  const positions = useMemo(() => {
    const count = 2200;
    const arr = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      arr[i * 3] = Math.cos(theta) * radius * R;
      arr[i * 3 + 1] = y * R;
      arr[i * 3 + 2] = Math.sin(theta) * radius * R;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={AQUA}
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color('#2f6bff') } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
            gl_FragColor = vec4(uColor, 1.0) * intensity;
          }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  return (
    <mesh scale={1.22} material={material}>
      <sphereGeometry args={[R, 48, 48]} />
    </mesh>
  );
}

function Marker({ position }: { position: THREE.Vector3 }) {
  const halo = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!halo.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + seed) * 0.35;
    halo.current.scale.setScalar(pulse);
    const mat = halo.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 - (pulse - 1) * 0.6;
  });
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Arc({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const dot = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random(), []);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.006, 8, false), [curve]);
  useFrame((state) => {
    if (!dot.current) return;
    const t = (state.clock.elapsedTime * 0.12 + offset) % 1;
    const p = curve.getPointAt(t);
    dot.current.position.copy(p);
  });
  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={GOLD} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#fff4d6" />
      </mesh>
    </group>
  );
}

/** The whole globe assembly: rotates, reacts to scroll + pointer. */
export function GlobeScene() {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const markers = useMemo(
    () => CITIES.map((c) => ({ name: c.name, pos: latLngToVec3(c.lat, c.lng, R + 0.005) })),
    [],
  );
  const arcs = useMemo(() => ROUTES.map(([a, b]) => routeCurve(a, b)), []);

  useFrame((_state, delta) => {
    const g = group.current;
    if (!g) return;
    const sp = sceneStore.scrollProgress;
    if (!sceneStore.reducedMotion) {
      g.rotation.y += delta * 0.045;
    }
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.18 + sp * 0.55, 0.05);

    const targetZ = 4.4 - sp * 1.1;
    const px = sceneStore.pointerX;
    const py = sceneStore.pointerY;
    camera.position.x += (px * 0.5 - camera.position.x) * 0.045;
    camera.position.y += (-py * 0.35 + 0.15 - camera.position.y) * 0.045;
    camera.position.z += (targetZ - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 64, 64]} />
        <meshStandardMaterial color="#0a1330" emissive="#0b1e46" emissiveIntensity={0.35} roughness={0.85} metalness={0.15} />
      </mesh>
      <Dots />
      <Atmosphere />
      {markers.map((m) => (
        <Marker key={m.name} position={m.pos} />
      ))}
      {arcs.map((curve, i) => (
        <Arc key={i} curve={curve} />
      ))}
    </group>
  );
}
