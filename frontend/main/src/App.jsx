import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  Float,
  Sparkles,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import WindTurbine from "./components/WindTurbine";
import SolarPlant from "./components/SolarPlant";
import TidalTurbine from "./components/TidalTurbine";
import Overlay from "./components/Overlay";

export default function App() {
  const [data, setData] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    const connect = () => {
      socket.current = new WebSocket("ws://localhost:8000/ws");
      socket.current.onmessage = (e) => setData(JSON.parse(e.data));
      socket.current.onclose = () => setTimeout(connect, 2000);
    };
    connect();
    return () => socket.current?.close();
  }, []);

  if (!data) return <div className="loading">CONNECTING_TO_GRID...</div>;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Overlay
        data={data}
        sendAction={(type, val) =>
          socket.current.send(json.stringify({ type, val }))
        }
      />

      <Canvas shadows camera={{ position: [15, 15, 15], fov: 35 }}>
        <color attach="background" args={["#050a0f"]} />
        <Environment preset="city" />
        <ambientLight intensity={0.2} />
        <pointLight
          position={[10, 10, 10]}
          intensity={2}
          color="#00f2ff"
          castShadow
        />

        <Grid
          infiniteGrid
          cellColor="#00f2ff"
          sectionColor="#00f2ff"
          fadeDistance={40}
        />

        <group position={[-6, 0, 0]}>
          <WindTurbine stats={data.wind} />
        </group>
        <group position={[0, 0, 0]}>
          <SolarPlant stats={data.solar} />
        </group>

        {/* Tidal Underground Cutaway */}
        <group position={[6, -2, 0]}>
          <mesh>
            <boxGeometry args={[5, 4, 5]} />
            <meshStandardMaterial
              color="#00f2ff"
              transparent
              opacity={0.15}
              metalness={1}
            />
          </mesh>
          <TidalTurbine stats={data.tidal} />
        </group>

        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
          <ChromaticAberration offset={[0.001, 0.001]} />
        </EffectComposer>

        <OrbitControls
          makeDefault
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
