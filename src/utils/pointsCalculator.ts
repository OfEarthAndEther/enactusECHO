type WasteType = 'battery' | 'charger' | 'cable_wire' | 'mouse_keyboard' | 'monitor' | 'cpu' | 'mobile' | 'accessories' | 'other';

const BASE_POINTS: Record<WasteType, number> = {
  battery: 2,
  charger: 1.5,
  cable_wire: 0.5,
  mouse_keyboard: 1,
  monitor: 5,
  cpu: 6,
  mobile: 3,
  accessories: 0.5,
  other: 1
};

export function calculatePoints(wasteType: WasteType, quantity: number, unit: 'kg' | 'units'): number {
  const basePoints = BASE_POINTS[wasteType] || 1;
  
  if (unit === 'kg') {
    // For kg, multiply by weight factor
    return Math.round(basePoints * quantity * 10);
  } else {
    // For units, multiply by unit count with smaller factor
    return Math.round(basePoints * quantity * 5);
  }
}

export function getWasteTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    battery: 'Battery',
    charger: 'Charger',
    cable_wire: 'Cable/Wire',
    mouse_keyboard: 'Mouse/Keyboard',
    monitor: 'Monitor',
    cpu: 'CPU',
    mobile: 'Mobile Phone',
    accessories: 'Accessories',
    other: 'Other'
  };
  return labels[type] || type;
}