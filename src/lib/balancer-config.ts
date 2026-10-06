/**
 * น้ำหนักของ Smart Load Balancer — ที่เดียวในโค้ด (PROMPT.md 11.5, S15)
 * UI แผงเบื้องหลัง Phone Tour คำบรรยายวิดีโอ และสไลด์อ่านค่าจากที่นี่ ห้ามพิมพ์ตัวเลขซ้ำที่อื่น
 */
export const HELPER_WEIGHTS = { space: 0.5, proximity: 0.35, urgency: 0.15 } as const;
export const DONATION_WEIGHTS = { scarcity: 0.55, crowding: 0.25, fairness: 0.2 } as const;
export const ADOPTION_WEIGHTS = { crowding: 0.5, waiting: 0.3, history: 0.2 } as const;

/** รัศมีอ้างอิงเมื่อเลือก “ทั้งกรุงเทพฯ” (กม.) */
export const ALL_BANGKOK_REFERENCE_KM = 15;
/** ความขาดแคลน: เพดานวันที่ใช้คำนวณ */
export const SCARCITY_CAP_DAYS = 14;
/** ความเป็นธรรม: เพดานจำนวนแพ็กเกจใน 30 วัน */
export const FAIRNESS_CAP_PACKAGES = 10;
/** ระยะเวลารอ: เพดานวัน */
export const WAITING_CAP_DAYS = 60;
/** ระดับสถานะ: สัดส่วนที่ถือว่า “ใกล้เต็ม” */
export const TIGHT_RATIO = 0.8;
/** ระดับเสบียง (วัน) */
export const SUPPLY_CRITICAL_DAYS = 3;
export const SUPPLY_LOW_DAYS = 7;
/** timeline คำสั่งจำลอง: วินาทีต่อขั้น (PROMPT.md 7.12) */
export const ORDER_STEP_SECONDS = 15;
/** จำนวนขั้นของ timeline: ยืนยันคำสั่ง → แบรนด์รับออเดอร์ → แพ็กและจัดส่ง → ถึงผู้ดูแล → ผู้ดูแลขอบคุณ */
export const ORDER_STEPS = 5;
/** index ของขั้น “ถึงผู้ดูแล” */
export const ORDER_ARRIVED_STEP = 3;
/** index ของขั้น “แพ็กและจัดส่ง” (ยกเลิกได้ก่อนขั้นนี้) */
export const ORDER_SHIPPING_STEP = 2;
