import { useMemo } from "react";

export default function CityDistrict({ activeDistricts }) {
  const buildings = useMemo(() => {
    const items = [];
    const gridSize = 16;
    const spacing = 12;

    for (let i = 0; i < gridSize * gridSize; i++) {
      const x = (i % gridSize) * spacing - (gridSize * spacing) / 2;
      const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2;

      // Exclusion Zones (Wind & Solar areas)
      if (x < -70 && z < -20) continue;
      if (x > 70 && z < -20) continue;

      const height = Math.random() * 35 + 8;
      const districtId = Math.floor((i / 256) * 8);

      items.push({ x, z, height, districtId });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Darker Asphalt Ground for contrast */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {buildings.map((b, i) => {
        const isPowered = b.districtId < activeDistricts;
        return (
          <group key={i} position={[b.x, b.height / 2, b.z]}>
            {/* Building Body: VISIBLE GREY */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[8, b.height, 8]} />
              <meshStandardMaterial
                color="#4b5563"
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>

            {/* Windows */}
            <mesh position={[0, 0, 4.05]}>
              <planeGeometry args={[6, b.height - 2]} />
              <meshStandardMaterial
                color={isPowered ? "#fef3c7" : "#1e293b"}
                emissive={isPowered ? "#fbbf24" : "#000"}
                emissiveIntensity={isPowered ? 0.5 : 0}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Roof Detail (Darker Grey) */}
            <mesh position={[0, b.height / 2 + 0.1, 0]}>
              <boxGeometry args={[7, 0.2, 7]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
