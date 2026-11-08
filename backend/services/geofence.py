dhaka_boundary_polygon = [
  (23.9000, 90.3340),
  (23.8990, 90.4070),
  (23.8340, 90.4370),
  (23.7740, 90.4530),
  (23.7240, 90.4480),
  (23.6930, 90.4350),
  (23.6800, 90.4060),
  (23.6950, 90.3700),
  (23.7250, 90.3450),
  (23.7750, 90.3300),
  (23.8350, 90.3400),
  (23.9000, 90.3340)
]

def is_within_dhaka(lat: float, lng: float) -> bool:
    is_inside = False
    x, y = lat, lng
    poly = dhaka_boundary_polygon
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        
        # Ray casting logic
        # if (yi > y) != (yj > y):
        #   if x < (xj - xi) * (y - yi) / (yj - yi) + xi:
        #       is_inside = not is_inside
        
        intersect = ((yi > y) != (yj > y)) and \
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if intersect:
            is_inside = not is_inside
        j = i
    return is_inside
