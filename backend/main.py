from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json

app = FastAPI()

# Master Simulation State
state = {
    "wind": {"speed": 10.0, "health": 100, "produced": 0.0, "status": "operating"},
    "solar": {"heat": 300.0, "health": 100, "produced": 0.0, "status": "operating"},
    "tidal": {"flow": 2.5, "health": 100, "produced": 0.0, "status": "operating"},
    "geothermal": {"pressure": 200.0, "health": 100, "produced": 0.0, "status": "operating"}
}

async def physics_engine():
    """Calculates power and damage every 100ms"""
    while True:
        # --- Wind Physics ---
        if state["wind"]["speed"] > 32: # Breaking point
            state["wind"]["health"] -= 1.5
            state["wind"]["status"] = "STRUCTURAL_FAILURE"
        
        # --- Solar Physics ---
        if state["solar"]["heat"] > 1370: # Melting point
            state["solar"]["health"] -= 4.0
            state["solar"]["status"] = "MELTING"

        # --- Tidal Physics ---
        if state["tidal"]["flow"] > 10:
            state["tidal"]["health"] -= 2.0
            state["tidal"]["status"] = "CAVITATION"

        # --- Geothermal Physics ---
        if state["geothermal"]["pressure"] > 850:
            state["geothermal"]["health"] -= 3.5
            state["geothermal"]["status"] = "OVERPRESSURE"

        # --- Global Production & Death Check ---
        for key in state:
            if state[key]["health"] <= 0:
                state[key]["health"] = 0
                state[key]["status"] = "DESTROYED"
            
            if state[key]["status"] != "DESTROYED":
                # Real-world inspired power formulas
                if key == "wind":
                    state[key]["produced"] += (0.5 * 1.2 * 50 * (state[key]["speed"]**3)) * 0.00001
                else:
                    val = state[key].get("heat") or state[key].get("flow") or state[key].get("pressure")
                    state[key]["produced"] += val * 0.01

        await asyncio.sleep(0.1)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(physics_engine())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. Send current state to Frontend
            await websocket.send_json(state)
            
            # 2. Receive commands from Frontend
            try:
                raw_data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                cmd = json.loads(raw_data)
                
                if cmd["type"] == "SET_WIND": state["wind"]["speed"] = cmd["val"]
                if cmd["type"] == "SET_HEAT": state["solar"]["heat"] = cmd["val"]
                if cmd["type"] == "SET_TIDAL": state["tidal"]["flow"] = cmd["val"]
                if cmd["type"] == "SET_GEO": state["geothermal"]["pressure"] = cmd["val"]
                if cmd["type"] == "RESET":
                    for k in state:
                        state[k].update({"health": 100, "status": "operating"})
            except asyncio.TimeoutError:
                pass
    except WebSocketDisconnect:
        pass