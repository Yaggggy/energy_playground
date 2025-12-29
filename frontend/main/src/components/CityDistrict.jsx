import { useMemo } from "react";

export default function CityDistrict({ activeDistricts }) {
  const buildings = useMemo(() => {
    const items = [];
    const gridSize = 16; // Larger grid
    const spacing = 12;

    for (let i = 0; i < gridSize * gridSize; i++) {
      const x = (i % gridSize) * spacing - (gridSize * spacing) / 2;
      const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2;

      // --- EXCLUSION ZONES (Prevent merging) ---
      // If x is near Wind Farm (Left side)
      if (x < -80 && z < -20) continue;
      // If x is near Solar Farm (Right side)
      if (x > 80 && z < -20) continue;

      // Random Height
      const height = Math.random() * 30 + 5;
      const districtId = Math.floor((i / 256) * 8);

      items.push({ x, z, height, districtId });
    }
    return items;
  }, []);

  return (
    <group>
      {/* City Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {buildings.map((b, i) => {
        const isPowered = b.districtId < activeDistricts;
        return (
          <group key={i} position={[b.x, b.height / 2, b.z]}>
            {/* Building Wall (White/Grey) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[8, b.height, 8]} />
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.5}
                metalness={0.1}
              />
            </mesh>

            {/* Windows (Dark Glass by default, Warm Light when powered) */}
            <mesh position={[0, 0, 4.05]}>
              <planeGeometry args={[6, b.height - 2]} />
              <meshStandardMaterial
                color={isPowered ? "#fef3c7" : "#1e293b"} // Warm Yellow vs Dark Glass
                emissive={isPowered ? "#fbbf24" : "#000"} // Warm glow
                emissiveIntensity={isPowered ? 0.5 : 0}
                roughness={0.2}
                metalness={0.8} // Glassy look
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
