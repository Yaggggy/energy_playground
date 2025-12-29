import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function WindTurbine({ stats }) {
  const rotorRef = useRef();

  useFrame((state, delta) => {
    if (stats.status !== "OFFLINE" && rotorRef.current) {
      rotorRef.current.rotation.z -= stats.speed * delta * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Concrete Foundation */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[2, 2.5, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Main Tower */}
      <mesh position={[0, 12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 1.5, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Nacelle */}
      <mesh position={[0, 24, 0.5]} castShadow>
        <boxGeometry args={[1.8, 1.8, 3.5]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* ROTOR */}
      <group position={[0, 24, 2.3]} ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.8, 1.5, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {[0, 120, 240].map((rot) => (
          <group key={rot} rotation={[0, 0, (rot * Math.PI) / 180]}>
            <mesh position={[0, 8, 0]} castShadow>
              <boxGeometry args={[0.7, 18, 0.2]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
