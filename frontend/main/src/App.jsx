import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sky,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  EffectComposer,
  Vignette,
  TiltShift,
  Bloom,
} from "@react-three/postprocessing";

// Components
import CityDistrict from "./components/CityDistrict";
import WindTurbine from "./components/WindTurbine";
import SolarPlant from "./components/SolarPlant";
import TidalTurbine from "./components/TidalTurbine";
import Overlay from "./components/Overlay";

export default function App() {
  const [data, setData] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    let timeout;

    const connect = () => {
      // Close existing connection if any
      if (socket.current && socket.current.readyState !== WebSocket.CLOSED) {
        return;
      }

      console.log("Attempting to connect to Grid Server...");
      socket.current = new WebSocket("ws://localhost:8000/ws");

      socket.current.onopen = () => {
        console.log("✅ Connected to Grid Server");
      };

      socket.current.onmessage = (e) => {
        // Only parse if data exists
        if (e.data) setData(JSON.parse(e.data));
      };

      socket.current.onclose = () => {
        console.warn("⚠️ Disconnected. Retrying in 3 seconds...");
        timeout = setTimeout(connect, 3000); // Auto-reconnect
      };

      socket.current.onerror = (err) => {
        console.error("❌ Socket Error (Is backend running?)", err);
        socket.current.close();
      };
    };

    connect();

    return () => {
      clearTimeout(timeout);
      if (socket.current) socket.current.close();
    };
  }, []);

  const sendAction = (type, val) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type, val }));
    }
  };

  if (!data)
    return <div className="loading-screen">INITIALIZING SIMULATION...</div>;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#d4e4ef" }}>
      <Overlay data={data} sendAction={sendAction} />

      <Canvas shadows dpr={[1, 2]}>
        {/* CAMERA FIX: 'far' set to 2000 so nothing disappears when zooming out */}
        <PerspectiveCamera
          makeDefault
          position={[120, 80, 120]}
          fov={40}
          near={1}
          far={2000}
        />

        {/* ENVIRONMENT */}
        <Sky sunPosition={[100, 60, 100]} turbidity={0.2} rayleigh={0.5} />
        <Environment preset="city" />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[-100, 150, 50]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-bias={-0.0001}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-150, 150, 150, -150]}
          />
        </directionalLight>

        {/* FOG FIX: Pushed way back so buildings stay visible */}
        <fog attach="fog" args={["#d4e4ef", 100, 800]} />

        {/* --- CITY GENERATOR --- */}
        <CityDistrict activeDistricts={data.grid.active_districts} />

        {/* --- WIND FARM (Far Left) --- */}
        <group position={[-120, 10, -60]}>
          {/* Hill Base */}
          <mesh position={[0, -10, 0]} receiveShadow>
            <cylinderGeometry args={[40, 60, 20, 64]} />
            <meshStandardMaterial color="#86efac" roughness={0.8} />
          </mesh>
          <WindTurbine stats={data.wind} />
        </group>

        {/* --- SOLAR PLANT (Far Right) --- */}
        <group position={[120, 1, -20]}>
          {/* Concrete Pad */}
          <mesh position={[0, -1, 0]} receiveShadow>
            <boxGeometry args={[60, 2, 60]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <SolarPlant stats={data.solar} />
        </group>

        {/* --- TIDAL PLANT (Front Center) --- */}
        <group position={[0, -8, 140]}>
          <TidalTurbine stats={data.tidal} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
            <planeGeometry args={[200, 100]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={0.6}
              roughness={0.05}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* POST PROCESSING: Subtle polish, no crazy bloom */}
        <EffectComposer disableNormalPass>
          <Vignette offset={0.3} darkness={0.3} />
          <TiltShift blur={0.05} />
          {/* Low bloom just for the sun reflections */}
          <Bloom luminanceThreshold={1.2} intensity={0.2} />
        </EffectComposer>

        <OrbitControls
          makeDefault
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={20}
          maxDistance={400}
        />
      </Canvas>
    </div>
  );
}
