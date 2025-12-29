from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json
import random

app = FastAPI()

# Master Simulation State
state = {
    "wind": {"speed": 15.0, "health": 100, "produced": 0.0, "status": "NOMINAL"},
    "solar": {"heat": 800.0, "health": 100, "produced": 0.0, "status": "NOMINAL"},
    "tidal": {"flow": 5.0, "health": 100, "produced": 0.0, "status": "NOMINAL"},
    "grid": {
        "demand": 1500,           # Total MW needed by the city
        "stability": 1.0,         # 0.0 to 1.2 (1.0 is perfect balance)
        "active_districts": 8,    # How many city blocks have lights on (Max 8)
        "frequency": 60.0         # Grid Hz
    }
}

async def simulation_loop():
    while True:
        # 1. Physics Calculations
        # Wind: Power = v^3 (Capped at 40m/s for safety)
        wind_p = (min(state["wind"]["speed"], 40) ** 3) * 0.002 if state["wind"]["status"] == "NOMINAL" else 0
        
        # Solar: Power = Heat * Efficiency
        solar_p = (state["solar"]["heat"] * 1.5) if state["solar"]["status"] == "NOMINAL" else 0
        
        # Tidal: Power = Flow * Torque
        tidal_p = (state["tidal"]["flow"] * 80) if state["tidal"]["status"] == "NOMINAL" else 0

        total_supply = wind_p + solar_p + tidal_p
        
        # 2. Grid Logic
        # Stability determines how many city lights stay on
        state["grid"]["stability"] = min(1.2, total_supply / state["grid"]["demand"])
        state["grid"]["active_districts"] = int(state["grid"]["stability"] * 8) 
        state["grid"]["frequency"] = 60.0 + (state["grid"]["stability"] - 1.0) * 0.5

        # 3. Update Individual Asset Production
        state["wind"]["produced"] = wind_p
        state["solar"]["produced"] = solar_p
        state["tidal"]["produced"] = tidal_p

        # 4. Damage Logic
        if state["solar"]["heat"] > 1450: state["solar"]["health"] -= 2.5
        if state["wind"]["speed"] > 45: state["wind"]["health"] -= 3.0
        
        # Check for destruction
        for key in ["wind", "solar", "tidal"]:
            if state[key]["health"] <= 0:
                state[key]["health"] = 0
                state[key]["status"] = "CRITICAL_FAILURE"

        await asyncio.sleep(0.1)

@app.on_event("startup")
async def start_sim():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(state)
            data = await asyncio.wait_for(websocket.receive_text(), timeout=0.05)
            cmd = json.loads(data)
            
            if cmd["type"] == "SET_WIND": state["wind"]["speed"] = cmd["val"]
            if cmd["type"] == "SET_HEAT": state["solar"]["heat"] = cmd["val"]
            if cmd["type"] == "SET_TIDAL": state["tidal"]["flow"] = cmd["val"]
            if cmd["type"] == "RESET":
                for k in ["wind", "solar", "tidal"]: 
                    state[k].update({"health": 100, "status": "NOMINAL"})
    except:
        pass