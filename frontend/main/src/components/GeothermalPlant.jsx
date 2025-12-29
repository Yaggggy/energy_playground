import { MeshWobbleMaterial } from "@react-three/drei";

export default function GeothermalPlant({ stats }) {
  const isDestroyed = stats.status === "DESTROYED";
  const p = stats.pressure / 1000;

  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.5, 1, 6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {!isDestroyed && stats.pressure > 400 && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.5 * p]} />
          <MeshWobbleMaterial
            color="white"
            transparent
            opacity={0.4}
            factor={p * 3}
            speed={5}
          />
        </mesh>
      )}
    </group>
  );
}
