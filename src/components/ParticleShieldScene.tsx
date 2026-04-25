import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

function ParticleShield() {
  const points = useRef<THREE.Points>(null);
  const count = 1800;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.4 + Math.random() * 0.05;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.08;
      points.current.rotation.x += delta * 0.02;
      const t = state.clock.elapsedTime;
      points.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.02);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#5cf2ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function InnerCore() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y -= delta * 0.2;
      mesh.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={mesh} args={[1.1, 64, 64]}>
        <meshStandardMaterial
          color="#7d4dff"
          emissive="#5cf2ff"
          emissiveIntensity={0.5}
          metalness={0.85}
          roughness={0.2}
          wireframe
        />
      </Sphere>
    </Float>
  );
}

function FloatingRings() {
  const g1 = useRef<THREE.Mesh>(null);
  const g2 = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (g1.current) g1.current.rotation.z += delta * 0.3;
    if (g2.current) g2.current.rotation.x += delta * 0.4;
  });
  return (
    <>
      <mesh ref={g1}>
        <torusGeometry args={[2.7, 0.012, 16, 200]} />
        <meshBasicMaterial color="#5cf2ff" transparent opacity={0.5} />
      </mesh>
      <mesh ref={g2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.9, 0.008, 16, 200]} />
        <meshBasicMaterial color="#b07bff" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

export function ParticleShieldScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#0a0d18"]} />
      <fog attach="fog" args={["#0a0d18", 6, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#5cf2ff" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#b07bff" />
      <Suspense fallback={null}>
        <InnerCore />
        <FloatingRings />
        <ParticleShield />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        rotateSpeed={0.4}
      />
    </Canvas>
  );
}
