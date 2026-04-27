import numpy as np

class PersonDetector:
    def __init__(self, shared_model=None):
        self.model = shared_model
        self.model_loaded = True if shared_model else False

    def _ensure_model(self):
        if self.model_loaded: return
        try:
            print(f"[AEGIS] Lazy-loading Person YOLO...")
            from ultralytics import YOLO
            self.model = YOLO("yolov8n.pt") 
        except Exception as e:
            print(f"[PersonDetector] YOLO failed: {e}")
        self.model_loaded = True

    def analyze(self, frame):
        self._ensure_model()
        if not self.model:
             return {"person_count": 0, "crowd_crush": False, "annotated_frame": frame.copy()}
        # Lower confidence threshold to detect partially visible people (pool, far away)
        results = self.model(frame, verbose=False, conf=0.10)[0]
        
        person_boxes = [box for box in results.boxes if int(box.cls) == 0]
        person_count = len(person_boxes)
        
        # Crowd density: divide frame into grid, count people per cell
        h, w = frame.shape[:2]
        density_map = np.zeros((3, 3))  # 3x3 grid
        
        for box in person_boxes:
            x_center = float(box.xywh[0][0]) / w
            y_center = float(box.xywh[0][1]) / h
            grid_x = min(int(x_center * 3), 2)
            grid_y = min(int(y_center * 3), 2)
            density_map[grid_y][grid_x] += 1
        
        # Crowd crush: any cell has more than 8 people
        crowd_crush = bool(density_map.max() > 8)
        
        return {
            "person_count": person_count,
            "crowd_crush": crowd_crush,
            "annotated_frame": results.plot()
        }
