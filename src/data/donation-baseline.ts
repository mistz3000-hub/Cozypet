/**
 * ค่าตั้งต้นของ “ยอดแพ็กเกจที่ส่งถึงผู้ดูแล” บนแดชบอร์ด — **ยอดจำลองจากข้อมูลสมมติ** ไม่ใช่ตัวเลขที่ตั้งเองให้ดูดี
 * สร้างครั้งเดียวด้วย seed 'cozypet:v1:donation-baseline' จากแพ็กเกจและราคาตัวอย่าง (จำนวนแต่ละแบบ × ราคา)
 */
export const DONATION_BASELINE = {
  items: [
    {
      "packageId": "pkg-cat-food-7d",
      "count": 118,
      "unitPriceTHB": 290
    },
    {
      "packageId": "pkg-dog-food-7d",
      "count": 104,
      "unitPriceTHB": 350
    },
    {
      "packageId": "pkg-cat-litter",
      "count": 44,
      "unitPriceTHB": 250
    },
    {
      "packageId": "pkg-care-basic",
      "count": 80,
      "unitPriceTHB": 390
    },
    {
      "packageId": "pkg-bundle-30d",
      "count": 57,
      "unitPriceTHB": 990
    }
  ],
  totalPackages: 403,
  totalTHB: 169250,
  /** เป้าตัวอย่างสำหรับแถบความคืบหน้า (สมมติ) */
  targetTHB: 280000,
} as const;
