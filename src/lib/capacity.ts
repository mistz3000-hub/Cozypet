/** ความจุ — ฟังก์ชันเดียวทั่วทั้งแอป ห้ามเก็บค่าที่ว่างแยก (PROMPT.md 7.4) */
export function availableSlots(h: { capacityTotal: number; currentCount: number }): number {
  return Math.max(0, h.capacityTotal - h.currentCount);
}

export function occupancyRatio(h: { capacityTotal: number; currentCount: number }): number {
  return h.capacityTotal > 0 ? h.currentCount / h.capacityTotal : 1;
}
