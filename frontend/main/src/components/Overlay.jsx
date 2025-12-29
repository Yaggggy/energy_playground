import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Overlay({ data, sendAction }) {
  const chartData = [...Array(10)].map(() => ({ v: Math.random() * 100 }));

  return (
    <div className="scada-container">
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="glass-panel sidebar"
      >
        <h2 className="title">CORE_SYSTEM_V4</h2>

        {Object.entries(data).map(([key, asset]) => (
          <div key={key} className="asset-card">
            <div className="asset-meta">
              <span>{key.toUpperCase()}_NODE</span>
              <span className={asset.status}>{asset.status}</span>
            </div>
            <div className="asset-val">
              {asset.produced.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}{" "}
              <small>MWh</small>
            </div>
            <div style={{ height: 2, background: "#111", marginTop: 5 }}>
              <div
                style={{
                  height: "100%",
                  background: "var(--neon)",
                  width: `${asset.health}%`,
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ height: 60, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#00f2ff"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button
          className="glass-panel"
          style={{
            width: "100%",
            marginTop: 20,
            cursor: "pointer",
            color: "white",
          }}
          onClick={() => sendAction("RESET", 0)}
        >
          MANUAL_RECOVERY
        </button>
      </motion.aside>

      <div className="control-deck">
        <ControlNode
          label="WIND_VELOCITY"
          val={data.wind.speed}
          unit="m/s"
          max={60}
          onChange={(v) => sendAction("SET_WIND", v)}
        />
        <ControlNode
          label="THERMAL_OUTPUT"
          val={data.solar.heat}
          unit="°C"
          max={2000}
          onChange={(v) => sendAction("SET_HEAT", v)}
        />
        <ControlNode
          label="TIDAL_SURGE"
          val={data.tidal.flow}
          unit="kn"
          max={20}
          onChange={(v) => sendAction("SET_TIDAL", v)}
        />
      </div>
    </div>
  );
}

const ControlNode = ({ label, val, unit, max, onChange }) => (
  <div className="glass-panel slider-unit">
    <label>{label}</label>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>
        {val.toFixed(1)} <small style={{ fontSize: 10 }}>{unit}</small>
      </span>
    </div>
    <input
      type="range"
      min="0"
      max={max}
      step="0.5"
      value={val}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  </div>
);
