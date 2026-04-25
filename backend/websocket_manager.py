from fastapi import WebSocket
import asyncio
import json
import numpy as np

class NumpyEncoder(json.JSONEncoder):
    """Custom encoder that converts NumPy types to native Python types"""
    def default(self, obj):
        if isinstance(obj, (np.bool_, np.bool)):
            return bool(obj)
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

class WebSocketManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Silenced for demo
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, data: dict):
        message = json.dumps(data, cls=NumpyEncoder)
        dead = []
        for ws in self.active_connections:
            try:
                await ws.send_text(message)
            except:
                dead.append(ws)
        for ws in dead:
            self.active_connections.remove(ws)

manager = WebSocketManager()
