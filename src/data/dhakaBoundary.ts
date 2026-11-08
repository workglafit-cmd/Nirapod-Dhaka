export const dhakaBoundaryPolygon: [number, number][] = [
  [23.9000, 90.3340],
  [23.8990, 90.4070],
  [23.8340, 90.4370],
  [23.7740, 90.4530],
  [23.7240, 90.4480],
  [23.6930, 90.4350],
  [23.6800, 90.4060],
  [23.6950, 90.3700],
  [23.7250, 90.3450],
  [23.7750, 90.3300],
  [23.8350, 90.3400],
  [23.9000, 90.3340]
];

export function isWithinDhaka(lat: number, lng: number): boolean {
  let isInside = false;
  const poly = dhakaBoundaryPolygon;
  const x = lat, y = lng;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}
