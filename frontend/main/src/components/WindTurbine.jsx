import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Html } from "@react-three/drei";

export default function WindTurbine({ stats }) {
  const bladeRef = useRef();

  useFrame((state, delta) => {
    if (stats.status !== "destroyed" && bladeRef.current) {
      bladeRef.current.rotation.z += stats.speed * delta * 0.5;
    }
  });

  return (
    <group>
      {/* Tower */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 5]} />
        <meshStandardMaterial
          color={stats.status === "destroyed" ? "#333" : "white"}
        />
      </mesh>

      {/* Nacelle & Blades */}
      <group position={[0, 5, 0.4]}>
        <group ref={bladeRef}>
          {[0, 120, 240].map((deg) => (
            <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
              <boxGeometry args={[0.2, 3, 0.05]} />
              <meshStandardMaterial color="white" />
            </mesh>
          ))}
        </group>
      </group>

      {stats.status === "destroyed" && (
        <Html position={[0, 6, 0]}>
          <div className="warning-label">💥 STRUCTURAL FAILURE</div>
        </Html>
      )}
    </group>
  );
}
