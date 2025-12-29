import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function TidalTurbine({ stats }) {
  const ref = useRef();
  const isBroken = stats.status === "DESTROYED";

  useFrame((_, delta) => {
    if (!isBroken && ref.current)
      ref.current.rotation.y += stats.flow * delta * 0.5;
  });

  return (
    <group>
      <group ref={ref}>
        {[0, 120, 240].map((a) => (
          <mesh
            key={a}
            rotation={[0, (a * Math.PI) / 180, 0]}
            position={[1.2, 0, 0]}
          >
            <boxGeometry args={[2, 0.8, 0.1]} />
            <meshStandardMaterial
              color={isBroken ? "red" : "#00f2ff"}
              emissive="#00f2ff"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
      {!isBroken && stats.flow > 2 && (
        <Sparkles count={40} scale={4} color="#00f2ff" size={3} />
      )}
    </group>
  );
}
