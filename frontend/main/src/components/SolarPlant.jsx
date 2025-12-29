import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Html } from "@react-three/drei";

export default function SolarPlant({ stats }) {
  const meshRef = useRef();
  const stress = 1 - stats.health / 100;

  return (
    <group>
      {/* Floating Telemetry Box (AR Style) */}
      <Html position={[0, 7, 0]} center distanceFactor={10}>
        <div className={`ar-telemetry ${stress > 0.5 ? "critical" : ""}`}>
          <div className="label">UNIT_02_CORE</div>
          <div className="data">{stats.heat.toFixed(0)}°C</div>
          {stress > 0.1 && (
            <div className="ttf">TTF: {stats.ttf?.toFixed(0)}s</div>
          )}
        </div>
      </Html>

      <Float
        speed={5 * stress}
        rotationIntensity={stress}
        floatIntensity={stress}
      >
        <mesh ref={meshRef} castShadow>
          <cylinderGeometry args={[0.5, 0.8, 6, 32]} />
          {/* This material distorts the geometry based on stress */}
          <MeshDistortMaterial
            speed={stress * 10}
            distort={stress * 0.4}
            color={stress > 0.5 ? "#ff0000" : "#ffffff"}
            emissive={stress > 0.2 ? "#ff0000" : "#000000"}
            emissiveIntensity={stress * 5}
            metalness={1}
            roughness={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
}
