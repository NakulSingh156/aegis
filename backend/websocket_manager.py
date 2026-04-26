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
        if not self.active_connections:
            return
            
        # Concurrent broadcasting to avoid slow-client blocking
        tasks = [ws.send_text(message) for ws in self.active_connections]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Cleanup dead connections
        dead = [self.active_connections[i] for i, res in enumerate(results) if isinstance(res, Exception)]
        for ws in dead:
            if ws in self.active_connections:
                self.active_connections.remove(ws)

manager = WebSocketManager()
