export default function Overlay({ data, sendAction }) {
  const { wind, solar, tidal, grid } = data;

  return (
    <div className="ui-layer">
      {/* Top Bar */}
      <header>
        <div className="title">
          ECO<span style={{ color: "#3b82f6" }}>SIM</span>{" "}
          <small>ENGINEERING CONSOLE</small>
        </div>
        <div className={`badge ${grid.stability > 0.8 ? "green" : "red"}`}>
          {grid.stability > 0.8 ? "GRID STABLE" : "UNSTABLE"}
        </div>
      </header>

      {/* Main Stats Panel */}
      <div className="stats-panel">
        <StatBox label="Total Load" value={grid.demand} unit="MW" />
        <StatBox
          label="Current Supply"
          value={(wind.produced + solar.produced + tidal.produced).toFixed(0)}
          unit="MW"
        />
        <StatBox
          label="Frequency"
          value={grid.frequency.toFixed(2)}
          unit="Hz"
        />
      </div>

      {/* Control Panel (Bottom Right) */}
      <div className="control-panel">
        <h3>Manual Override</h3>

        <div className="slider-group">
          <div className="slider-label">
            <span>Wind Speed</span> <strong>{wind.speed} m/s</strong>
          </div>
          {/* The input calls sendAction immediately on change */}
          <input
            type="range"
            min="0"
            max="60"
            value={wind.speed}
            onChange={(e) => sendAction("SET_WIND", parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Solar Intensity</span> <strong>{solar.heat} U</strong>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            value={solar.heat}
            onChange={(e) => sendAction("SET_HEAT", parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Tidal Flow</span> <strong>{tidal.flow} kn</strong>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={tidal.flow}
            onChange={(e) =>
              sendAction("SET_TIDAL", parseFloat(e.target.value))
            }
          />
        </div>

        <button onClick={() => sendAction("RESET")}>EMERGENCY RESET</button>
      </div>
    </div>
  );
}

const StatBox = ({ label, value, unit }) => (
  <div className="stat-box">
    <div className="lbl">{label}</div>
    <div className="val">
      {value} <small>{unit}</small>
    </div>
  </div>
);
