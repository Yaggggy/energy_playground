import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function TidalTurbine({ stats }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += stats.flow * delta * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={ref}>
        {[0, 90, 180, 270].map((r) => (
          <mesh
            key={r}
            rotation={[0, (r * Math.PI) / 180, 0]}
            position={[8, 0, 0]}
          >
            <boxGeometry args={[6, 4, 1]} />
            <meshStandardMaterial
              color="#00f2ff"
              emissive="#00f2ff"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[2, 2, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}
