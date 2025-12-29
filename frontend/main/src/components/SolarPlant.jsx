import { MeshDistortMaterial } from "@react-three/drei";

export default function SolarPlant({ stats }) {
  const heatFactor = Math.min(stats.heat / 1500, 1);
  return (
    <group>
      {/* Central Tower */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[1, 1.5, 16]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* The "Sun" Receiver - Glows Red/Orange */}
      <mesh position={[0, 16, 0]}>
        <sphereGeometry args={[3, 32, 32]} />
        <MeshDistortMaterial
          distort={heatFactor * 0.4}
          speed={3}
          color="#fbbf24"
          emissive="#ef4444"
          emissiveIntensity={heatFactor * 4}
        />
      </mesh>

      {/* Solar Panel Array */}
      {[...Array(24)].map((_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i) * 20, 1, Math.cos(i) * 20]}
          rotation={[-0.5, 0, 0]}
          castShadow
        >
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
