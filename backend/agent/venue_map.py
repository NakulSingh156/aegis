from collections import deque

# Define which zones are adjacent to each other
ZONE_GRAPH = {
    "lobby":      ["corridor_a", "parking", "exit_a"],
    "restaurant": ["corridor_a", "exit_b"],
    "corridor_a": ["lobby", "restaurant", "stairwell"],
    "stairwell":  ["corridor_a", "pool", "exit_b"],
    "parking":    ["lobby", "exit_a", "exit_c"],
    "pool":       ["stairwell", "exit_b"],
}

EXIT_NODES = {"exit_a", "exit_b", "exit_c"}

def find_evacuation_route(start_zone: str, danger_zones: list[str]) -> list[str]:
    """BFS to find shortest path to any exit, avoiding danger zones.
    Returns the full path including the start zone and the exit node."""
    
    # Even for danger zones, try to find an escape route
    # (people trapped there still need to know the nearest exit)
    blocked = set(danger_zones) - {start_zone}  # don't block the start zone itself
    
    queue = deque([[start_zone]])
    visited = {start_zone}
    
    while queue:
        path = queue.popleft()
        current = path[-1]
        
        if current in EXIT_NODES:
            return path
        
        for neighbor in ZONE_GRAPH.get(current, []):
            if neighbor not in visited and neighbor not in blocked:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    
    return []  # No safe route found

def get_all_evacuation_routes(danger_zones: list[str]) -> dict:
    routes = {}
    all_zones = [z for z in ZONE_GRAPH.keys() if z not in EXIT_NODES]
    
    for zone in all_zones:
        route = find_evacuation_route(zone, danger_zones)
        routes[zone] = route
    
    return routes
