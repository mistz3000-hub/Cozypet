'use client';
/**
 * สถานะ runtime ของ autopilot (“ให้ Cozypet สาธิต”) — ระหว่างสาธิต component ต้องไม่เรียก network
 * ไม่เขียน storage (ยกเว้น tourState) และใช้กฎคำสำคัญแทน AI (MOTION.md 6.4)
 */
let autopilot = false;
const listeners = new Set<() => void>();

export function isAutopilot(): boolean {
  return autopilot;
}
export function setAutopilot(on: boolean) {
  autopilot = on;
  listeners.forEach((l) => l());
}
export function subscribeAutopilot(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** อีเวนต์ให้ component คืนสถานะ UI (ปิด pop-up/แผง ล้างข้อความ) เมื่อทัวร์ไปขั้นถัดไปหรือออก */
export const TOUR_RESET_EVENT = 'cozypet:tour-reset';
