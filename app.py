from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms = {}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    if room_id not in rooms:
        rooms[room_id] = []

    rooms[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            for conn in rooms[room_id]:
                if conn != websocket:
                    await conn.send_text(data)

    except:
        rooms[room_id].remove(websocket)

# 👇 IMPORTANT: THIS MATCHES YOUR FOLDER
app.mount("/", StaticFiles(directory="static", html=True), name="static")