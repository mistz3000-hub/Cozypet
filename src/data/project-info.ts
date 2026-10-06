/**
 * ข้อมูลโปรเจกต์ที่แสดงบนเว็บ (PROMPT.md 5.5, D5, D12)
 * ห้ามแต่งชื่อสมาชิก รายวิชา หรือสถาบัน — ชื่อ–นามสกุลและรหัสนักศึกษาอยู่ใน team.local.json (ไม่ commit)
 * แก้คู่กับหัวข้อ “ทีมงาน” ใน README
 */
export const PROJECT_INFO = {
  projectLabel: 'Final Project prototype',
  teamName: 'ทีมก้าวหน้า',
  teamMembers: [] as string[],
  showMembersOnWebsite: false,
  course: null as string | null,
  institution: null as string | null,
} as const;
