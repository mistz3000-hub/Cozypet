// สร้างอัตโนมัติจาก CODEX_IMAGE_PROMPTS.md หัวข้อ 5 ด้วย scripts/data/extract-adopters.ts (ห้ามแก้มือ)
// ผู้รับดูแลรายบุคคลทุกคนเป็นบุคคลสมมติ · พิกัด = จุดกึ่งกลางเขต + offset seeded ('cozypet:v1:helper-location:<id>')
import type { AdopterSource } from './adopter-source';

export const ADOPTER_SOURCE: readonly AdopterSource[] = [
  {
    "id": "adopter-001",
    "displayName": "ใบเตย",
    "sex": "female",
    "age": 26,
    "districtId": "lat-phrao",
    "location": {
      "lat": 13.80344,
      "lng": 100.60943
    },
    "occupation": "นักออกแบบกราฟิก ทำงานที่บ้าน 3 วันต่อสัปดาห์",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอน ชั้น 12 ระเบียงติดตาข่ายกันตก นิติบุคคลอนุญาตให้เลี้ยงแมว"
    },
    "currentPets": [
      {
        "name": "ขนมปัง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มลายสลิด",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "มอคค่า",
        "species": "cat",
        "breed": "โคราช",
        "color": "เทาเงิน (สีสวาด)",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ขาวล้วน"
      ],
      "breeds": [
        "ขาวมณี"
      ],
      "reason": "ชอบแมวตาสองสีตั้งแต่เด็ก และเข้าใจว่าแมวขาวบางตัวอาจมีปัญหาการได้ยิน จึงอยากเป็นบ้านที่ดูแลเรื่องนี้ได้"
    },
    "hours": "ทุกวัน 18:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-002",
    "displayName": "เหมยลี่",
    "sex": "female",
    "age": 24,
    "districtId": "samphanthawong",
    "location": {
      "lat": 13.73763,
      "lng": 100.50594
    },
    "occupation": "ช่วยครอบครัวดูแลร้านสมุนไพรจีน",
    "home": {
      "type": "shophouse",
      "summary": "ห้องชั้นสามของตึกแถวครอบครัว หน้าต่างบานเฟี้ยมไม้ ติดมุ้งลวดกันแมวทุกบาน"
    },
    "currentPets": [
      {
        "name": "ซาลาเปา",
        "species": "cat",
        "breed": "บริติชช็อตแฮร์",
        "color": "ครีม",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "สามสี"
      ],
      "breeds": [
        "แมวไทยพันทาง"
      ],
      "reason": "ที่บ้านถือว่าแมวสามสีเป็นมงคล และชอบที่ลายของแต่ละตัวไม่ซ้ำกัน"
    },
    "hours": "ทุกวัน 19:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-003",
    "displayName": "ภูผา",
    "sex": "male",
    "age": 31,
    "districtId": "bang-khun-thian",
    "location": {
      "lat": 13.64334,
      "lng": 100.44193
    },
    "occupation": "ช่างซ่อมเรือและเครื่องยนต์ริมคลอง",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวชั้นเดียว ลานดินกว้างล้อมรั้วสูง ใกล้ป่าชายเลน"
    },
    "currentPets": [
      {
        "name": "ดำ",
        "species": "dog",
        "breed": "ไทยหลังอาน",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "ขาว",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ไทยหลังอาน",
        "หมาไทยพันทาง"
      ],
      "reason": "หมาดำมักถูกรับเลี้ยงช้ากว่าตัวอื่น อยากให้โอกาส และบ้านมีลานกว้างพอให้หมาที่แข็งแรงได้วิ่ง"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-004",
    "displayName": "ตี๋",
    "sex": "male",
    "age": 23,
    "districtId": "pathum-wan",
    "location": {
      "lat": 13.75673,
      "lng": 100.53216
    },
    "occupation": "นักศึกษาปริญญาโทวิศวกรรมคอมพิวเตอร์ และติวเตอร์พาร์ตไทม์",
    "home": {
      "type": "apartment",
      "summary": "ห้องสตูดิโอในอพาร์ตเมนต์ที่อนุญาตสัตว์เลี้ยงขนาดเล็ก"
    },
    "currentPets": [
      {
        "name": "ข้าวต้ม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 1
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "รู้สึกว่าแมวส้มขี้อ้อนเข้ากับตัวเอง (เป็นความชอบส่วนตัว) และช่วงสอบอาจรับได้ไม่เต็มที่"
    },
    "hours": "จันทร์–ศุกร์ 20:00–22:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-005",
    "displayName": "ดาหลา",
    "sex": "female",
    "age": 29,
    "districtId": "dusit",
    "location": {
      "lat": 13.78158,
      "lng": 100.51629
    },
    "occupation": "ครูอนุบาล",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้นในซอยเงียบ มีระเบียงหน้าบ้านติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "มะปราง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ถั่วแดง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลลายเสือ",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลลายเสือ"
      ],
      "breeds": [
        "แมวไทยพันทาง"
      ],
      "reason": "เด็ก ๆ ในห้องเรียนชอบฟังเรื่องแมวลายเสือ และอยากให้แมวพันทางได้บ้านมากขึ้น"
    },
    "hours": "ทุกวัน 17:30–20:30",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-006",
    "displayName": "กัปตัน",
    "sex": "male",
    "age": 38,
    "districtId": "bang-na",
    "location": {
      "lat": 13.67512,
      "lng": 100.59705
    },
    "occupation": "นักบินพาณิชย์",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวในหมู่บ้าน มีสนามหญ้าล้อมรั้ว"
    },
    "currentPets": [
      {
        "name": "กัปปุ",
        "species": "dog",
        "breed": "โกลเด้นรีทรีฟเวอร์",
        "color": "ทอง",
        "sex": "male",
        "ageYears": 6
      }
    ],
    "preferences": {
      "colors": [
        "ครีม",
        "ทอง"
      ],
      "breeds": [
        "โกลเด้นรีทรีฟเวอร์ หรือลาบราดอร์"
      ],
      "reason": "อยากได้เพื่อนเล่นให้กัปปุที่นิสัยเข้ากับครอบครัว ตอนนี้บินต่างประเทศบ่อยจึงปิดรับชั่วคราว"
    },
    "hours": "เฉพาะวันหยุดที่ไม่มีเที่ยวบิน",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-007",
    "displayName": "นิ่มนวล",
    "sex": "female",
    "age": 58,
    "districtId": "bangkok-noi",
    "location": {
      "lat": 13.77408,
      "lng": 100.45893
    },
    "occupation": "ครูเกษียณ",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้สองชั้นริมคลอง ระเบียงไม้ติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "ส้มฉุน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 9
      },
      {
        "name": "ปุยนุ่น",
        "species": "cat",
        "breed": "เปอร์เซีย",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 7
      },
      {
        "name": "ด่างดำ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 8
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี (แมวสูงวัย)"
      ],
      "breeds": [
        "เปอร์เซีย"
      ],
      "reason": "เลี้ยงเปอร์เซียมานานจึงดูแลขนยาวเป็น และอยากรับแมวสูงวัยที่คนมักไม่เลือก"
    },
    "hours": "ทุกวัน 09:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-008",
    "displayName": "ฟ้าใส",
    "sex": "female",
    "age": 22,
    "districtId": "lak-si",
    "location": {
      "lat": 13.89056,
      "lng": 100.57722
    },
    "occupation": "นักศึกษาสัตวแพทย์ชั้นปีสุดท้าย",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ห้องเดียว มีมุมกล่องอนุบาลลูกแมวที่อบอุ่น"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ทุกสี (ลูกแมวกำพร้า)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากดูแลลูกแมวกำพร้าที่ต้องป้อนนมเป็นเวลา ตามที่เรียนมา (ไม่ได้รักษาโรคเอง)"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-009",
    "displayName": "อาทิตย์",
    "sex": "male",
    "age": 34,
    "districtId": "chatuchak",
    "location": {
      "lat": 13.82351,
      "lng": 100.56244
    },
    "occupation": "เจ้าของร้านกาแฟเล็ก ๆ",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวที่ชั้นล่างเป็นร้านกาแฟ ชั้นบนเป็นที่อยู่ มีดาดฟ้าปลูกต้นไม้ล้อมตาข่าย"
    },
    "currentPets": [
      {
        "name": "เอสเพรสโซ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "ลาเต้",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "แมวดำมักถูกมองข้าม อยากให้ได้บ้าน และดำเข้ากับสีร้านพอดี"
    },
    "hours": "ทุกวัน 16:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-010",
    "displayName": "ปริม",
    "sex": "female",
    "age": 30,
    "districtId": "khlong-toei",
    "location": {
      "lat": 13.69945,
      "lng": 100.58518
    },
    "occupation": "เภสัชกรโรงพยาบาล",
    "home": {
      "type": "condo",
      "summary": "คอนโด 2 ห้องนอนใกล้สถานีรถไฟฟ้า"
    },
    "currentPets": [
      {
        "name": "บุหงา",
        "species": "cat",
        "breed": "วิเชียรมาศ",
        "color": "ครีมแต้มน้ำตาล",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ครีมแต้มน้ำตาล"
      ],
      "breeds": [
        "วิเชียรมาศ"
      ],
      "reason": "ชอบนิสัยช่างคุยและผูกพันกับคนของวิเชียรมาศ และอยากให้บุหงามีเพื่อน"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-011",
    "displayName": "วศิน",
    "sex": "male",
    "age": 41,
    "districtId": "bueng-kum",
    "location": {
      "lat": 13.77638,
      "lng": 100.66319
    },
    "occupation": "วิศวกรโยธา",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยว 2 ชั้นในหมู่บ้าน สนามหญ้าล้อมรั้ว แยกโซนหมาและแมว"
    },
    "currentPets": [
      {
        "name": "ข้าวเหนียว",
        "species": "dog",
        "breed": "ไทยบางแก้ว",
        "color": "ขาวแต้มน้ำตาล",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "มะขาม",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาลแดง",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "ทองหยิบ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลแดง"
      ],
      "breeds": [
        "ไทยบางแก้ว"
      ],
      "reason": "ภูมิใจในหมาสายพันธุ์ไทย และบ้านแยกโซนหมากับแมวชัดเจนจึงรับได้ทั้งสองชนิด"
    },
    "hours": "ทุกวัน 18:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-012",
    "displayName": "ข้าวหอม",
    "sex": "female",
    "age": 27,
    "districtId": "ratchathewi",
    "location": {
      "lat": 13.75874,
      "lng": 100.53749
    },
    "occupation": "นักวาดภาพประกอบอิสระ",
    "home": {
      "type": "condo",
      "summary": "คอนโดเก่ารีโนเวตใหม่ ผนังเต็มไปด้วยภาพวาด"
    },
    "currentPets": [
      {
        "name": "หมึก",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "หมึกเป็นแรงบันดาลใจในงานวาด และอยากช่วยแมวดำตัวอื่นเมื่อมีที่ว่าง"
    },
    "hours": "ทุกวัน 13:00–18:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-013",
    "displayName": "เกริก",
    "sex": "male",
    "age": 45,
    "districtId": "thon-buri",
    "location": {
      "lat": 13.72735,
      "lng": 100.48706
    },
    "occupation": "ช่างไม้ทำเฟอร์นิเจอร์",
    "home": {
      "type": "house",
      "summary": "บ้านครึ่งไม้ครึ่งปูน มีโรงงานไม้เล็ก ๆ ข้างบ้าน และบ้านหมาที่ทำเอง"
    },
    "currentPets": [
      {
        "name": "ขี้เลื่อย",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาลอ่อน",
        "sex": "male",
        "ageYears": 7
      },
      {
        "name": "ตะปู",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทา",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลอ่อน"
      ],
      "breeds": [
        "หมาพันทาง"
      ],
      "reason": "ทำคอกและบ้านไม้ให้น้องเองได้ จึงรับน้องที่ต้องการพื้นที่พักฟื้นชั่วคราว"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-014",
    "displayName": "มิ้นท์",
    "sex": "female",
    "age": 25,
    "districtId": "watthana",
    "location": {
      "lat": 13.74251,
      "lng": 100.57751
    },
    "occupation": "นักการตลาดออนไลน์",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอน โทนเทาอ่อน วิวเมือง"
    },
    "currentPets": [
      {
        "name": "มาการอง",
        "species": "cat",
        "breed": "แร็กดอลล์",
        "color": "ครีมแต้มน้ำตาล ตาฟ้า",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ครีม ตาฟ้า"
      ],
      "breeds": [
        "แร็กดอลล์"
      ],
      "reason": "ชอบนิสัยนุ่มนวลและชอบให้อุ้ม ซึ่งเหมาะกับการอยู่คอนโด"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-015",
    "displayName": "บุญมี",
    "sex": "male",
    "age": 63,
    "districtId": "nong-khaem",
    "location": {
      "lat": 13.70785,
      "lng": 100.33913
    },
    "occupation": "ข้าราชการเกษียณ ปลูกผักสวนครัว",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวชั้นเดียว มีสวนผักและต้นมะม่วง ล้อมรั้วตาข่าย"
    },
    "currentPets": [
      {
        "name": "เจ้าเหลือง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "ลำดวน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "สามสี",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "โทน",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 8
      }
    ],
    "preferences": {
      "colors": [
        "สามสี"
      ],
      "breeds": [
        "แมวไทยพันทาง"
      ],
      "reason": "ชอบที่ลายสามสีไม่ซ้ำกันเลยสักตัว และบ้านมีพื้นที่ให้น้องพักฟื้น"
    },
    "hours": "ทุกวัน 08:00–18:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-016",
    "displayName": "ณิชา",
    "sex": "female",
    "age": 33,
    "districtId": "bang-sue",
    "location": {
      "lat": 13.80702,
      "lng": 100.54512
    },
    "occupation": "พยาบาลห้องฉุกเฉิน (ทำงานเป็นกะ)",
    "home": {
      "type": "condo",
      "summary": "คอนโดใกล้ที่ทำงาน มีเครื่องให้อาหารอัตโนมัติ"
    },
    "currentPets": [
      {
        "name": "มอลต์",
        "species": "cat",
        "breed": "บริติชช็อตแฮร์",
        "color": "เทาฟ้า",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "เทาฟ้า"
      ],
      "breeds": [
        "บริติชช็อตแฮร์"
      ],
      "reason": "ชอบนิสัยสงบ ไม่ติดเจ้าของมาก เหมาะกับคนที่ทำงานเป็นกะ"
    },
    "hours": "วันหยุดเวร 10:00–16:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-017",
    "displayName": "ธาวิน",
    "sex": "male",
    "age": 28,
    "districtId": "khlong-san",
    "location": {
      "lat": 13.73629,
      "lng": 100.50956
    },
    "occupation": "ช่างภาพอิสระ",
    "home": {
      "type": "apartment",
      "summary": "ห้องเช่าในอาคารเก่าริมแม่น้ำ หน้าต่างติดมุ้งลวด"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ส้มลายสลิด"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบถ่ายรูปแมวส้มในแสงยามเย็น และตอนนี้อยากเริ่มจากการอุปถัมภ์ชั่วคราวก่อน"
    },
    "hours": "ทุกวัน 10:00–15:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-018",
    "displayName": "ไหมแก้ว",
    "sex": "female",
    "age": 36,
    "districtId": "bang-bon",
    "location": {
      "lat": 13.66182,
      "lng": 100.35939
    },
    "occupation": "เจ้าของร้านดอกไม้",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถว 3 ชั้นที่ชั้นล่างเป็นร้านดอกไม้ ชั้นสองเป็นห้องนั่งเล่น มีคอกกระต่ายในบ้าน"
    },
    "currentPets": [
      {
        "name": "ถั่วเขียว",
        "species": "other",
        "breed": "กระต่ายฮอลแลนด์ลอป",
        "color": "น้ำตาลขาว",
        "sex": "female",
        "ageYears": 2
      },
      {
        "name": "กุหลาบ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "หูตก ทุกสี"
      ],
      "breeds": [
        "กระต่ายฮอลแลนด์ลอป"
      ],
      "reason": "กระต่ายหูตกนิสัยเชื่อง เลี้ยงในบ้านได้ และเข้ากับกุหลาบได้ดี"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "other"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-019",
    "displayName": "กฤต",
    "sex": "male",
    "age": 26,
    "districtId": "bang-na",
    "location": {
      "lat": 13.68644,
      "lng": 100.6093
    },
    "occupation": "เทรนเนอร์ฟิตเนส",
    "home": {
      "type": "condo",
      "summary": "คอนโด 2 ห้องนอนติดสวนสาธารณะ"
    },
    "currentPets": [
      {
        "name": "สปริง",
        "species": "dog",
        "breed": "บีเกิ้ล",
        "color": "สามสี ขาวน้ำตาลดำ",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "สามสี"
      ],
      "breeds": [
        "บีเกิ้ล หรือหมาไทยพันทางขนาดกลาง"
      ],
      "reason": "อยากได้เพื่อนวิ่งตอนเช้าให้สปริง และชอบหมาที่พลังเยอะ"
    },
    "hours": "ทุกวัน 06:00–08:00 และ 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-020",
    "displayName": "อัญชัน",
    "sex": "female",
    "age": 47,
    "districtId": "chom-thong",
    "location": {
      "lat": 13.67643,
      "lng": 100.48179
    },
    "occupation": "เจ้าของร้านตัดเสื้อ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวสองชั้น มีห้องตัดเย็บ และห้องแมวที่ติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "กระดุม",
        "species": "cat",
        "breed": "ขาวมณี",
        "color": "ขาว ตาสองสี",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "ผ้าไหม",
        "species": "cat",
        "breed": "เปอร์เซีย",
        "color": "เทา",
        "sex": "female",
        "ageYears": 6
      },
      {
        "name": "เข็ม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ขาวล้วน"
      ],
      "breeds": [
        "ขาวมณี"
      ],
      "reason": "ชอบแมวไทยโบราณ และขาวมณีตาสองสีเป็นเสน่ห์ที่หลงรักตั้งแต่ครั้งแรก"
    },
    "hours": "ทุกวัน 18:30–20:30",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 3,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-021",
    "displayName": "ปั้น",
    "sex": "male",
    "age": 30,
    "districtId": "yan-nawa",
    "location": {
      "lat": 13.70907,
      "lng": 100.54628
    },
    "occupation": "เชฟขนมอบ",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ 2 ห้อง ครัวแยกปิดประตูได้"
    },
    "currentPets": [
      {
        "name": "ครัวซองต์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "เอ็กโซติกช็อตแฮร์"
      ],
      "reason": "ชอบหน้าแบนน่ารัก แต่เข้าใจว่าต้องดูแลเรื่องการหายใจและคราบน้ำตาเป็นพิเศษ"
    },
    "hours": "ทุกวัน 15:00–18:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-022",
    "displayName": "ซาร่า",
    "sex": "female",
    "age": 29,
    "districtId": "nong-chok",
    "location": {
      "lat": 13.86036,
      "lng": 100.85279
    },
    "occupation": "ครูสอนภาษาอังกฤษ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีสวนมะพร้าวและบ่อปลา ห้องพักฟื้นสัตว์แยกจากตัวบ้าน"
    },
    "currentPets": [
      {
        "name": "มะลิ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "ข้าวหลาม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ครีม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ขาวล้วน"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "บ้านมีห้องพักฟื้นแยก จึงรับน้องที่ต้องพักตัวได้ และชอบแมวขาวที่ดูสะอาดตา"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-023",
    "displayName": "ต้นกล้า",
    "sex": "male",
    "age": 35,
    "districtId": "thawi-watthana",
    "location": {
      "lat": 13.77658,
      "lng": 100.35242
    },
    "occupation": "เกษตรกรปลูกผักออร์แกนิก",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ยกใต้ถุนกลางสวนผัก ลานใต้ถุนกว้างสำหรับหมา"
    },
    "currentPets": [
      {
        "name": "พริก",
        "species": "dog",
        "breed": "ไทยหลังอาน",
        "color": "น้ำตาลแดง",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "มะนาว",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เหลืองอ่อน",
        "sex": "female",
        "ageYears": 2
      },
      {
        "name": "ขิง",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาล",
        "sex": "male",
        "ageYears": 1
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "สวนกว้างพอให้หมาวิ่ง และหมาไทยปรับตัวกับอากาศร้อนได้ดี"
    },
    "hours": "ทุกวัน 16:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-024",
    "displayName": "พลอย",
    "sex": "female",
    "age": 23,
    "districtId": "huai-khwang",
    "location": {
      "lat": 13.78371,
      "lng": 100.58126
    },
    "occupation": "พนักงานบริษัทเกม",
    "home": {
      "type": "condo",
      "summary": "คอนโดห้องสตูดิโอ โทนพาสเทล"
    },
    "currentPets": [
      {
        "name": "โมจิ",
        "species": "cat",
        "breed": "อเมริกันช็อตแฮร์",
        "color": "เงินลายคลาสสิก",
        "sex": "female",
        "ageYears": 1
      }
    ],
    "preferences": {
      "colors": [
        "เงินลาย"
      ],
      "breeds": [
        "อเมริกันช็อตแฮร์"
      ],
      "reason": "ชอบนิสัยขี้เล่นแต่ไม่วุ่นวาย ตอนนี้กำลังจะย้ายคอนโดจึงปิดรับชั่วคราว"
    },
    "hours": "ทุกวัน 21:00–23:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 1,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-025",
    "displayName": "วีระ",
    "sex": "male",
    "age": 52,
    "districtId": "din-daeng",
    "location": {
      "lat": 13.77409,
      "lng": 100.54711
    },
    "occupation": "คนขับแท็กซี่กะกลางวัน",
    "home": {
      "type": "apartment",
      "summary": "ห้องแฟลตชุมชนชั้น 3 มีระเบียงเล็กติดตาข่าย"
    },
    "currentPets": [
      {
        "name": "เจ้าขาว",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "male",
        "ageYears": 8
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี (แมวโต)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "แมวโตนิสัยนิ่ง เหมาะกับห้องเล็ก และเจ้าขาวชอบมีเพื่อนนอนด้วย"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-026",
    "displayName": "แพรวา",
    "sex": "female",
    "age": 31,
    "districtId": "bang-phlat",
    "location": {
      "lat": 13.7871,
      "lng": 100.50363
    },
    "occupation": "ครูสอนโยคะ",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์โฮมริมแม่น้ำ มีห้องโยคะพื้นไม้"
    },
    "currentPets": [
      {
        "name": "สมาธิ",
        "species": "cat",
        "breed": "โคราช",
        "color": "เทาเงิน",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "เทาเงิน"
      ],
      "breeds": [
        "โคราช"
      ],
      "reason": "คนไทยถือว่าแมวโคราชเป็นแมวมงคล และชอบนิสัยเงียบสงบที่เข้ากับบ้าน"
    },
    "hours": "ทุกวัน 11:00–15:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-027",
    "displayName": "ณัฐ",
    "sex": "male",
    "age": 27,
    "districtId": "wang-thonglang",
    "location": {
      "lat": 13.78466,
      "lng": 100.60136
    },
    "occupation": "โปรแกรมเมอร์ทำงานจากบ้าน",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 3 ชั้น ห้องทำงานมีชั้นแมวติดผนัง"
    },
    "currentPets": [
      {
        "name": "บั๊ก",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "ฟีเจอร์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี (ลูกแมว)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ทำงานที่บ้านทั้งวัน จึงป้อนอาหารลูกแมวได้ตรงเวลา"
    },
    "hours": "ทุกวัน 12:00–13:00 และ 18:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-028",
    "displayName": "จันทร์เจ้า",
    "sex": "female",
    "age": 64,
    "districtId": "phra-khanong",
    "location": {
      "lat": 13.70906,
      "lng": 100.59492
    },
    "occupation": "เจ้าของร้านขนมไทยที่เกษียณแล้ว",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวหลังเก่ามีสวนหน้าบ้าน ประตูมุ้งลวดสองชั้น"
    },
    "currentPets": [
      {
        "name": "ทองหยอด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 10
      },
      {
        "name": "ฝอยทอง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 9
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม (แมวสูงวัย)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากให้แมวแก่ได้มีบ้านสงบ ๆ ในบั้นปลาย เหมือนทองหยอดกับฝอยทอง"
    },
    "hours": "ทุกวัน 09:00–16:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-029",
    "displayName": "ภาคิน",
    "sex": "male",
    "age": 29,
    "districtId": "saphan-sung",
    "location": {
      "lat": 13.76899,
      "lng": 100.67569
    },
    "occupation": "ช่างซ่อมมอเตอร์ไซค์คลาสสิก",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีโรงรถกว้าง แยกลานวิ่งสำหรับหมา"
    },
    "currentPets": [
      {
        "name": "ลูกสูบ",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ไทยหลังอาน"
      ],
      "reason": "ชอบหมาดำที่ดูเท่และซื่อสัตย์ และอยากช่วยหมาที่มักถูกรับเลี้ยงช้า"
    },
    "hours": "ทุกวัน 18:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-030",
    "displayName": "ปิ่นมุก",
    "sex": "female",
    "age": 35,
    "districtId": "khan-na-yao",
    "location": {
      "lat": 13.82547,
      "lng": 100.68439
    },
    "occupation": "เจ้าของร้านออนไลน์ขายของใช้สัตว์เลี้ยง",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวในหมู่บ้าน มีสนามหญ้าเล็ก ๆ และประตูกันหมาในบ้าน"
    },
    "currentPets": [
      {
        "name": "ปุยเมฆ",
        "species": "dog",
        "breed": "ปอมเมอเรเนียน",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "น้ำตาล",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลลายเสือ",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ขาว"
      ],
      "breeds": [
        "ปอมเมอเรเนียน",
        "ชิสุ"
      ],
      "reason": "ครอบครัวชอบหมาเล็กที่อยู่ในบ้านได้ และรู้วิธีดูแลขนยาว"
    },
    "hours": "ทุกวัน 10:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-031",
    "displayName": "เจตน์",
    "sex": "male",
    "age": 44,
    "districtId": "lak-si",
    "location": {
      "lat": 13.886,
      "lng": 100.57492
    },
    "occupation": "เจ้าหน้าที่กู้ภัยอาสา",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้น มีกรงพักฟื้นแยกและทางลาดสำหรับหมาขาไม่ดี"
    },
    "currentPets": [
      {
        "name": "ฮีโร่",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาลเข้ม",
        "sex": "male",
        "ageYears": 6
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี (สัตว์พิการ)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "เคยช่วยน้องที่บาดเจ็บ จึงอยากดูแลน้องที่ต้องพักฟื้นหรือพิการ"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-032",
    "displayName": "นภัส",
    "sex": "female",
    "age": 28,
    "districtId": "chatuchak",
    "location": {
      "lat": 13.83324,
      "lng": 100.56285
    },
    "occupation": "พนักงานต้อนรับบนเครื่องบิน",
    "home": {
      "type": "condo",
      "summary": "คอนโดมินิมอลใกล้สวนสาธารณะ"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "เปอร์เซีย"
      ],
      "reason": "ตั้งใจรับเลี้ยงเมื่อย้ายไปทำงานภาคพื้นดิน ตอนนี้บินบ่อยจึงปิดรับชั่วคราว"
    },
    "hours": "ช่วงนี้ไม่สะดวกรับติดต่อ",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-033",
    "displayName": "ชยพล",
    "sex": "male",
    "age": 32,
    "districtId": "lat-phrao",
    "location": {
      "lat": 13.79971,
      "lng": 100.61658
    },
    "occupation": "นักบัญชี",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอนใกล้รถไฟฟ้า มีตาข่ายระเบียง"
    },
    "currentPets": [
      {
        "name": "ภาษี",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ภาษีเป็นแมวส้มตัวแรกในชีวิต และอยากหาเพื่อนสีเดียวกันให้"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-034",
    "displayName": "วรรณา",
    "sex": "female",
    "age": 50,
    "districtId": "bang-kapi",
    "location": {
      "lat": 13.77231,
      "lng": 100.63809
    },
    "occupation": "แม่ค้าขายข้าวแกง",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวที่ด้านหน้าเป็นร้านข้าวแกง ชั้นบนเป็นที่อยู่และห้องแมว"
    },
    "currentPets": [
      {
        "name": "ข้าวมัน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "ไก่ทอด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "แกงเขียว",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ลายเสือเทา",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ร้านอยู่ใกล้ตลาด เจอแมวหลงบ่อย จึงช่วยดูแลชั่วคราวระหว่างรอเจ้าของหรือบ้านใหม่"
    },
    "hours": "ทุกวัน 14:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-035",
    "displayName": "ธนา",
    "sex": "male",
    "age": 36,
    "districtId": "watthana",
    "location": {
      "lat": 13.75215,
      "lng": 100.58726
    },
    "occupation": "สถาปนิก",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์โฮมโมเดิร์นมีคอร์ตกลางบ้านที่ปิดด้วยตาข่ายโปร่ง"
    },
    "currentPets": [
      {
        "name": "ดินสอ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 2
      },
      {
        "name": "สเก็ตช์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "บอมเบย์ หรือแมวดำพันทาง"
      ],
      "reason": "ชอบความเรียบเท่ของแมวดำ เข้ากับบ้านโทนมินิมอล"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-036",
    "displayName": "ปาริชาติ",
    "sex": "female",
    "age": 42,
    "districtId": "pom-prap-sattru-phai",
    "location": {
      "lat": 13.75896,
      "lng": 100.52467
    },
    "occupation": "มัคคุเทศก์นำเที่ยวย่านเมืองเก่า",
    "home": {
      "type": "shophouse",
      "summary": "ห้องชุดในตึกแถวเก่าย่านเมืองเก่า เพดานสูงหน้าต่างไม้"
    },
    "currentPets": [
      {
        "name": "ขนมชั้น",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "สามสี",
        "sex": "female",
        "ageYears": 6
      }
    ],
    "preferences": {
      "colors": [
        "สามสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบลายสามสีที่ดูมีเรื่องเล่า และช่วงพาทัวร์หลายวันจะรับไม่ได้"
    },
    "hours": "วันจันทร์–พฤหัส 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-037",
    "displayName": "กานต์",
    "sex": "male",
    "age": 24,
    "districtId": "bangkok-yai",
    "location": {
      "lat": 13.7271,
      "lng": 100.46297
    },
    "occupation": "นักดนตรีกลางคืน",
    "home": {
      "type": "wooden_house",
      "summary": "ห้องเช่าในบ้านไม้เก่าริมคลอง หน้าต่างติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "คอร์ด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "คอร์ดชอบนอนฟังกีตาร์ อยากให้น้องที่รอบ้านได้พักในห้องที่อบอุ่น"
    },
    "hours": "ทุกวัน 12:00–16:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-038",
    "displayName": "เพ็ญศรี",
    "sex": "female",
    "age": 55,
    "districtId": "phasi-charoen",
    "location": {
      "lat": 13.72004,
      "lng": 100.43596
    },
    "occupation": "เจ้าของร้านผ้าไทย",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้สักริมคลอง มีลานหน้าบ้านล้อมรั้ว"
    },
    "currentPets": [
      {
        "name": "ผ้าขาวม้า",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาวลายดำ",
        "sex": "female",
        "ageYears": 7
      },
      {
        "name": "ครามดำ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ขาวดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบลายขาวดำเหมือนลายผ้าที่ทอ และบ้านรับได้ทั้งหมาและแมว"
    },
    "hours": "ทุกวัน 17:00–19:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-039",
    "displayName": "อิทธิ",
    "sex": "male",
    "age": 47,
    "districtId": "don-mueang",
    "location": {
      "lat": 13.91101,
      "lng": 100.58182
    },
    "occupation": "ช่างเทคนิคซ่อมบำรุงอากาศยาน",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีรั้วสูงและสนามหลังบ้าน"
    },
    "currentPets": [
      {
        "name": "ใบพัด",
        "species": "dog",
        "breed": "ลาบราดอร์รีทรีฟเวอร์",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ลาบราดอร์ รีทรีฟเวอร์"
      ],
      "reason": "ใบพัดเป็นมิตรกับหมาทุกตัว บ้านจึงรับหมาที่ต้องหาที่พักด่วนได้"
    },
    "hours": "ทุกวัน 18:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-040",
    "displayName": "มายด์",
    "sex": "female",
    "age": 26,
    "districtId": "sathon",
    "location": {
      "lat": 13.71589,
      "lng": 100.52326
    },
    "occupation": "ทนายความ",
    "home": {
      "type": "condo",
      "summary": "คอนโดวิวเมือง ห้องนั่งเล่นกว้าง ระเบียงติดตาข่าย"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "เทาฟ้า"
      ],
      "breeds": [
        "รัสเซียนบลู"
      ],
      "reason": "ชอบนิสัยสงบของแมวขนสั้นสีเทาฟ้า และเตรียมบ้านไว้สำหรับรับเลี้ยงตัวแรก"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-041",
    "displayName": "ก้อง",
    "sex": "male",
    "age": 33,
    "districtId": "bang-khen",
    "location": {
      "lat": 13.87162,
      "lng": 100.59051
    },
    "occupation": "ไกด์เดินป่า",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีสวนหลังบ้านกว้าง"
    },
    "currentPets": [
      {
        "name": "ภูเขา",
        "species": "dog",
        "breed": "หมาพันทางเชพเพิร์ด",
        "color": "น้ำตาลดำ",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลดำ"
      ],
      "breeds": [
        "หมาใหญ่พันทาง"
      ],
      "reason": "ภูเขาเข้ากับหมาใหญ่ได้ดี แต่ช่วงมีทริปเดินป่ารับไม่ได้"
    },
    "hours": "ช่วงไม่มีทริป 18:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-042",
    "displayName": "ชมพู่",
    "sex": "female",
    "age": 30,
    "districtId": "sai-mai",
    "location": {
      "lat": 13.9175,
      "lng": 100.65568
    },
    "occupation": "ครูประถม",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้น ห้องนั่งเล่นมีมุมเล่นของแมว"
    },
    "currentPets": [
      {
        "name": "เงาะ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "ลำไย",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลอ่อน",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ส้มขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากให้บ้านมีครบทั้งส้มและขาว ให้เหมือนชื่อผลไม้ของน้อง ๆ"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-043",
    "displayName": "สิงห์",
    "sex": "male",
    "age": 39,
    "districtId": "min-buri",
    "location": {
      "lat": 13.80911,
      "lng": 100.7482
    },
    "occupation": "เจ้าของอู่ซ่อมรถ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวติดอู่ มีลานหลังบ้านล้อมรั้วแยกจากอู่"
    },
    "currentPets": [
      {
        "name": "น็อต",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาล",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "เบรก",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาวน้ำตาล",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "ลานหลังบ้านกว้างและแยกจากอู่ชัดเจน จึงรับหมาที่ต้องการที่พักชั่วคราวได้"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-044",
    "displayName": "ลลิล",
    "sex": "female",
    "age": 27,
    "districtId": "phaya-thai",
    "location": {
      "lat": 13.78267,
      "lng": 100.54416
    },
    "occupation": "บรรณารักษ์",
    "home": {
      "type": "condo",
      "summary": "คอนโดเล็กที่มีชั้นหนังสือเต็มผนัง"
    },
    "currentPets": [
      {
        "name": "จดหมาย",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวเทา",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "เทาขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "จดหมายชอบนอนบนหนังสือ และอยากได้เพื่อนสีเทาขาวเหมือนกัน"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-045",
    "displayName": "ภูมิ",
    "sex": "male",
    "age": 21,
    "districtId": "bang-rak",
    "location": {
      "lat": 13.74428,
      "lng": 100.52512
    },
    "occupation": "นักศึกษาพลศึกษา",
    "home": {
      "type": "apartment",
      "summary": "ห้องพักแบบอพาร์ตเมนต์ใกล้สนามกีฬา"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ตั้งใจช่วยอุปถัมภ์แมวส้มหลังฝึกงาน ตอนนี้กลับต่างจังหวัดจึงปิดรับ"
    },
    "hours": "ช่วงนี้ไม่สะดวก",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-046",
    "displayName": "กิ่งแก้ว",
    "sex": "female",
    "age": 38,
    "districtId": "bang-kho-laem",
    "location": {
      "lat": 13.70447,
      "lng": 100.49803
    },
    "occupation": "นักบัญชีอิสระ",
    "home": {
      "type": "condo",
      "summary": "คอนโดริมแม่น้ำ ระเบียงติดตาข่าย"
    },
    "currentPets": [
      {
        "name": "ข้าวปั้น",
        "species": "cat",
        "breed": "สก็อตติชสเตรท",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "สาหร่าย",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "สก็อตติชสเตรท (หูตั้ง)"
      ],
      "reason": "ชอบหน้ากลมของสายพันธุ์นี้ แต่เลือกหูตั้งเพื่อหลีกเลี่ยงปัญหากระดูกอ่อนของแมวหูพับ"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 2,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-047",
    "displayName": "ธีร์",
    "sex": "male",
    "age": 29,
    "districtId": "bang-khae",
    "location": {
      "lat": 13.69506,
      "lng": 100.40039
    },
    "occupation": "นักออกแบบ UX",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์โฮม 2 ชั้นในหมู่บ้าน ลานหลังบ้านเล็ก ๆ"
    },
    "currentPets": [
      {
        "name": "โคโค่",
        "species": "dog",
        "breed": "ชิบะอินุ",
        "color": "แดง",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "นัตตะ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "แดง/ส้ม"
      ],
      "breeds": [
        "ชิบะอินุ หรือหมาไทยพันทางสีแดง"
      ],
      "reason": "ชอบหมาสีแดงอบอุ่น และบ้านที่มีหมาแมวอยู่ด้วยกันได้อย่างสงบ"
    },
    "hours": "ทุกวัน 19:00–22:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-048",
    "displayName": "รุ่งนภา",
    "sex": "female",
    "age": 61,
    "districtId": "taling-chan",
    "location": {
      "lat": 13.76825,
      "lng": 100.462
    },
    "occupation": "เจ้าของสวนกล้วยไม้",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวกลางสวนกล้วยไม้ มีเรือนเพาะชำและลานหญ้ากว้าง"
    },
    "currentPets": [
      {
        "name": "กล้วยไม้",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 6
      },
      {
        "name": "หวาย",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำขาว",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "เอื้อง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ขาว"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "สวนกว้างเหมาะกับหมาโตที่ต้องการพื้นที่ และคุ้นกับการดูแลสัตว์หลายตัว"
    },
    "hours": "ทุกวัน 08:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-049",
    "displayName": "ยูซุฟ",
    "sex": "male",
    "age": 34,
    "districtId": "min-buri",
    "location": {
      "lat": 13.81635,
      "lng": 100.7493
    },
    "occupation": "เจ้าของร้านอาหารฮาลาล",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีระเบียงหลังบ้านติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "อะลีฟ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวส้ม",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "นูร์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ครอบครัวรักแมวมาก ระเบียงหลังบ้านกว้างพอรับน้องที่ต้องการที่พักด่วน"
    },
    "hours": "ทุกวัน 15:00–17:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-050",
    "displayName": "แจน",
    "sex": "female",
    "age": 32,
    "districtId": "suan-luang",
    "location": {
      "lat": 13.72315,
      "lng": 100.65073
    },
    "occupation": "ทันตแพทย์",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอน อนุญาตหมาเล็ก"
    },
    "currentPets": [
      {
        "name": "ถั่วลันเตา",
        "species": "dog",
        "breed": "ชิวาวา",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "ชิวาวา หรือหมาเล็กพันทาง"
      ],
      "reason": "คอนโดรับได้เฉพาะหมาเล็ก และถั่วลันเตาชอบอยู่ตัวเดียว"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 1,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-051",
    "displayName": "ไอซ์",
    "sex": "female",
    "age": 27,
    "districtId": "lat-krabang",
    "location": {
      "lat": 13.71824,
      "lng": 100.75461
    },
    "occupation": "นักวิทยาศาสตร์อาหาร",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์โฮมใกล้นิคมอุตสาหกรรม ห้องนั่งเล่นโปร่ง"
    },
    "currentPets": [
      {
        "name": "เจล",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวเทา",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "เทาขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "เจลเป็นแมวขี้เหงา อยากได้เพื่อนนิสัยนิ่ง ๆ สีโทนเดียวกัน"
    },
    "hours": "ทุกวัน 18:30–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-052",
    "displayName": "บอส",
    "sex": "male",
    "age": 37,
    "districtId": "prawet",
    "location": {
      "lat": 13.72526,
      "lng": 100.68498
    },
    "occupation": "เจ้าของบริษัทรับจัดงาน",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวสองชั้น สวนสวย สระว่ายน้ำล้อมรั้วกันหมาตก"
    },
    "currentPets": [
      {
        "name": "ซิงเกิล",
        "species": "dog",
        "breed": "เวลช์คอร์กี้",
        "color": "แดงขาว",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "แดงขาว"
      ],
      "breeds": [
        "คอร์กี้ หรือหมาขาสั้นพันทาง"
      ],
      "reason": "อยากให้ซิงเกิลมีเพื่อน และรู้ว่าหมาขาสั้นต้องระวังเรื่องหลังและน้ำหนัก"
    },
    "hours": "เสาร์–อาทิตย์ 10:00–16:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-053",
    "displayName": "น้ำฝน",
    "sex": "female",
    "age": 45,
    "districtId": "khlong-sam-wa",
    "location": {
      "lat": 13.86133,
      "lng": 100.69899
    },
    "occupation": "เจ้าของฟาร์มไข่ไก่เล็ก ๆ",
    "home": {
      "type": "house",
      "summary": "บ้านกึ่งไม้กึ่งปูนกลางทุ่ง มีคอกหมากว้างแยกจากเล้าไก่"
    },
    "currentPets": [
      {
        "name": "ข้าวโพด",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เหลือง",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "ถั่วฝักยาว",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "แตงกวา",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "มีพื้นที่ทุ่งกว้าง เหมาะกับหมาโตที่ต้องการวิ่งและพักฟื้นชั่วคราว"
    },
    "hours": "ทุกวัน 07:00–10:00 และ 16:00–18:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 6,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-054",
    "displayName": "เอกชัย",
    "sex": "male",
    "age": 58,
    "districtId": "rat-burana",
    "location": {
      "lat": 13.68583,
      "lng": 100.50458
    },
    "occupation": "ทหารเรือเกษียณ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวริมแม่น้ำ ห้องรับแขกกว้างติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "นายพล",
        "species": "cat",
        "breed": "วิเชียรมาศ",
        "color": "ครีมแต้มน้ำตาล",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "ทองแดง",
        "species": "cat",
        "breed": "ศุภลักษณ์",
        "color": "น้ำตาลทองแดง",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลทองแดง"
      ],
      "breeds": [
        "ศุภลักษณ์"
      ],
      "reason": "ชอบแมวไทยโบราณ และศุภลักษณ์สีทองแดงหาได้ยาก อยากให้มีบ้านที่เข้าใจสายพันธุ์"
    },
    "hours": "ทุกวัน 09:00–18:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-055",
    "displayName": "ใบบัว",
    "sex": "female",
    "age": 29,
    "districtId": "thung-khru",
    "location": {
      "lat": 13.62174,
      "lng": 100.50404
    },
    "occupation": "อาจารย์มหาวิทยาลัยสาขาชีววิทยา",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ใกล้มหาวิทยาลัย มีคอกกระต่ายในร่มขนาดใหญ่"
    },
    "currentPets": [
      {
        "name": "ถั่วดำ",
        "species": "other",
        "breed": "กระต่ายเนเธอร์แลนด์ดวาร์ฟ",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี"
      ],
      "breeds": [
        "กระต่ายพันธุ์เล็ก"
      ],
      "reason": "เลี้ยงกระต่ายเป็นและมีคอกพร้อม จึงช่วยดูแลกระต่ายหลงระหว่างรอเจ้าของ"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "other"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-056",
    "displayName": "ปกรณ์",
    "sex": "male",
    "age": 40,
    "districtId": "phra-nakhon",
    "location": {
      "lat": 13.7505,
      "lng": 100.49347
    },
    "occupation": "เจ้าของร้านหนังสือมือสอง",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวเก่าที่ชั้นล่างเป็นร้านหนังสือ ชั้นบนเป็นบ้าน"
    },
    "currentPets": [
      {
        "name": "ตัวหนังสือ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "สารบัญ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทา",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ปกแข็ง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ขาวดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ลูกค้าชอบแมวประจำร้าน แต่เลือกรับเพิ่มทีละตัวเพื่อให้แมวเดิมปรับตัวได้"
    },
    "hours": "ทุกวัน 17:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 3,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-057",
    "displayName": "มินตรา",
    "sex": "female",
    "age": 34,
    "districtId": "bang-kapi",
    "location": {
      "lat": 13.77051,
      "lng": 100.66097
    },
    "occupation": "ครูสอนเปียโน",
    "home": {
      "type": "condo",
      "summary": "คอนโดสองห้องนอนที่มีเปียโนอัปไรต์"
    },
    "currentPets": [
      {
        "name": "โน้ต",
        "species": "cat",
        "breed": "เมนคูน",
        "color": "เงินลายเสือ",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "เงิน"
      ],
      "breeds": [
        "เมนคูน"
      ],
      "reason": "ชอบแมวตัวใหญ่นิสัยใจดี และรู้ว่าต้องมีพื้นที่ปีนป่ายมากพอ"
    },
    "hours": "ทุกวัน 16:00–18:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-058",
    "displayName": "สมชาย",
    "sex": "male",
    "age": 66,
    "districtId": "bang-phlat",
    "location": {
      "lat": 13.79068,
      "lng": 100.49912
    },
    "occupation": "ช่างตัดผมเกษียณ",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ชั้นเดียวในชุมชนริมน้ำ มีลานปูนหน้าบ้าน"
    },
    "currentPets": [
      {
        "name": "ลุงดำ",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำแซมขาวที่ปาก",
        "sex": "male",
        "ageYears": 12
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี (หมาสูงวัย)"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "อยากรับหมาสูงวัยมาเป็นเพื่อนลุงดำ เพราะจังหวะชีวิตช้า ๆ เหมือนกัน"
    },
    "hours": "ทุกวัน 09:00–17:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-059",
    "displayName": "เฟิร์น",
    "sex": "female",
    "age": 25,
    "districtId": "don-mueang",
    "location": {
      "lat": 13.92237,
      "lng": 100.58854
    },
    "occupation": "ช่างทำเล็บ",
    "home": {
      "type": "shophouse",
      "summary": "ห้องเช่าเหนือร้านทำเล็บ ติดมุ้งลวดทุกหน้าต่าง"
    },
    "currentPets": [
      {
        "name": "ลูกปัด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ส้มขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ลูกปัดเข้ากับแมวอื่นได้ดี จึงช่วยดูแลน้องหลงชั่วคราวได้ครั้งละตัว"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-060",
    "displayName": "ชาติชาย",
    "sex": "male",
    "age": 50,
    "districtId": "sai-mai",
    "location": {
      "lat": 13.91438,
      "lng": 100.64505
    },
    "occupation": "เจ้าของร้านวัสดุก่อสร้าง",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวลานกว้าง มีคอกหมาหลังร้าน"
    },
    "currentPets": [
      {
        "name": "เหล็ก",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาล",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "ปูน",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เทา",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "ทราย",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "เคยรับหมาหลงหน้าร้านมาดูแลหลายครั้ง ตอนนี้คอกเต็มแล้ว"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 3,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-061",
    "displayName": "อรอุมา",
    "sex": "female",
    "age": 39,
    "districtId": "lat-phrao",
    "location": {
      "lat": 13.80796,
      "lng": 100.60782
    },
    "occupation": "ผู้จัดการฝ่ายบุคคล",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 3 ชั้น ห้องนั่งเล่นตกแต่งเก๋"
    },
    "currentPets": [
      {
        "name": "ขนมครก",
        "species": "cat",
        "breed": "เอ็กโซติกช็อตแฮร์",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ทองม้วน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มลายสลิด",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "บ้านนี้เป็นทีมแมวส้ม และรู้สึกว่าแมวส้มเข้ากันง่าย (ความชอบส่วนตัว)"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-062",
    "displayName": "ปีเตอร์",
    "sex": "male",
    "age": 28,
    "districtId": "watthana",
    "location": {
      "lat": 13.73858,
      "lng": 100.58994
    },
    "occupation": "โค้ชสอนเต้น",
    "home": {
      "type": "condo",
      "summary": "คอนโดวิวเมือง ห้องกว้างโปร่ง"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากรับเลี้ยงแมวตัวแรก และชอบแมวดำที่ดูเท่เข้ากับห้อง"
    },
    "hours": "ทุกวัน 11:00–14:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-063",
    "displayName": "นวล",
    "sex": "female",
    "age": 70,
    "districtId": "khlong-san",
    "location": {
      "lat": 13.73711,
      "lng": 100.51414
    },
    "occupation": "เกษียณ",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ริมแม่น้ำ ระเบียงไม้ติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "ส้มจีน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "female",
        "ageYears": 11
      },
      {
        "name": "มะลิลา",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 12
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี (แมวสูงวัย)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ดูแลแมวแก่มาทั้งชีวิต ตอนนี้ครบสองตัวแล้วจึงยังไม่รับเพิ่ม"
    },
    "hours": "ทุกวัน 09:00–16:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 2,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-064",
    "displayName": "ทรงพล",
    "sex": "male",
    "age": 42,
    "districtId": "bang-khae",
    "location": {
      "lat": 13.6895,
      "lng": 100.41685
    },
    "occupation": "ครูพลศึกษา",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวสนามหญ้ากว้าง แยกห้องแมวกับลานหมา"
    },
    "currentPets": [
      {
        "name": "บาส",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาลอ่อน",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "แชมป์",
        "species": "dog",
        "breed": "ลาบราดอร์รีทรีฟเวอร์",
        "color": "เหลือง",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "นกหวีด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวส้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลอ่อน"
      ],
      "breeds": [
        "ลาบราดอร์ หรือหมาพันทางขนาดใหญ่"
      ],
      "reason": "ชอบหมาใหญ่ที่เล่นกีฬาด้วยได้ และบ้านแยกโซนหมากับแมวชัดเจน"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-065",
    "displayName": "ขวัญ",
    "sex": "female",
    "age": 31,
    "districtId": "nong-khaem",
    "location": {
      "lat": 13.71074,
      "lng": 100.34562
    },
    "occupation": "พนักงานโรงงานกะเช้า",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ชั้นเดียว ห้องนั่งเล่นเรียบง่าย"
    },
    "currentPets": [
      {
        "name": "ปุยปุย",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวครีม",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "กลับบ้านตรงเวลาทุกวัน จึงดูแลน้องที่ต้องกินยาตามเวลาที่สัตวแพทย์สั่งได้"
    },
    "hours": "ทุกวัน 17:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-066",
    "displayName": "โอม",
    "sex": "male",
    "age": 35,
    "districtId": "huai-khwang",
    "location": {
      "lat": 13.77819,
      "lng": 100.59108
    },
    "occupation": "นักข่าว",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอน ระเบียงติดตาข่าย"
    },
    "currentPets": [
      {
        "name": "ข่าวสด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ลายเสือเทา",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ลายเสือ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบแมวลายเสือที่ดูคล่องแคล่ว แต่งานข่าวเวลาไม่แน่นอนจึงรับได้จำกัด"
    },
    "hours": "ทุกวัน 21:00–23:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-067",
    "displayName": "ส้มโอ",
    "sex": "female",
    "age": 28,
    "districtId": "suan-luang",
    "location": {
      "lat": 13.72513,
      "lng": 100.65388
    },
    "occupation": "เจ้าของร้านเค้ก",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวที่ชั้นล่างเป็นร้านเค้ก ชั้นบนเป็นห้องแมว"
    },
    "currentPets": [
      {
        "name": "ส้มซ่า",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "ส้มตำ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มลายสลิด",
        "sex": "female",
        "ageYears": 2
      },
      {
        "name": "ส้มเช้ง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "male",
        "ageYears": 1
      }
    ],
    "preferences": {
      "colors": [
        "ส้มทุกเฉด"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชื่อเล่นเป็นส้มจึงสะสมแมวส้มจนเป็นธีมบ้าน และอยากให้น้องส้มหลงได้บ้าน"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-068",
    "displayName": "ธวัชชัย",
    "sex": "male",
    "age": 55,
    "districtId": "thawi-watthana",
    "location": {
      "lat": 13.77184,
      "lng": 100.34858
    },
    "occupation": "ทำสวนกล้วยน้ำว้า",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ใต้ถุนสูงกลางสวนกล้วย ลานใต้ถุนกว้าง"
    },
    "currentPets": [
      {
        "name": "กล้วยหอม",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เหลือง",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "กล้วยไข่",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "กล้วยเล็บมือ",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาล",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "กล้วยตาก",
        "species": "dog",
        "breed": "ไทยหลังอาน",
        "color": "น้ำตาลแดง",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "สวนกว้างและมีคนอยู่ทั้งวัน จึงรับหมาที่ต้องการที่พักด่วนได้"
    },
    "hours": "ทุกวัน 06:00–09:00 และ 16:00–18:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 6,
    "currentCount": 4,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-069",
    "displayName": "กชกร",
    "sex": "female",
    "age": 26,
    "districtId": "pathum-wan",
    "location": {
      "lat": 13.74718,
      "lng": 100.52858
    },
    "occupation": "นักแสดงละครเวที",
    "home": {
      "type": "condo",
      "summary": "คอนโดหรูใจกลางเมือง ห้องแต่งตัวกว้าง"
    },
    "currentPets": [
      {
        "name": "ม่านแดง",
        "species": "cat",
        "breed": "วิเชียรมาศ",
        "color": "ครีมแต้มน้ำตาล",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "แต้มสี (point)"
      ],
      "breeds": [
        "วิเชียรมาศ"
      ],
      "reason": "ชอบแมวที่ช่างพูดคุยเหมือนนักแสดง และม่านแดงเข้ากับแมวไทยได้ดี"
    },
    "hours": "ทุกวัน 11:00–14:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-070",
    "displayName": "อานนท์",
    "sex": "male",
    "age": 31,
    "districtId": "bangkok-noi",
    "location": {
      "lat": 13.7676,
      "lng": 100.4666
    },
    "occupation": "แพทย์ประจำบ้าน",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ใกล้โรงพยาบาล"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากช่วยอุปถัมภ์แมวหลังจบการฝึกอบรม ตอนนี้เข้าเวรหนักจึงปิดรับ"
    },
    "hours": "ช่วงนี้ไม่สะดวก",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-071",
    "displayName": "ฝ้าย",
    "sex": "female",
    "age": 33,
    "districtId": "khan-na-yao",
    "location": {
      "lat": 13.82961,
      "lng": 100.68245
    },
    "occupation": "โค้ชแบดมินตัน",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวหลังเล็กมีสนามหญ้า"
    },
    "currentPets": [
      {
        "name": "ลูกขนไก่",
        "species": "dog",
        "breed": "แจ็กรัสเซลล์เทอร์เรีย",
        "color": "ขาวน้ำตาล",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ขาวน้ำตาล"
      ],
      "breeds": [
        "แจ็กรัสเซลล์ หรือหมาพลังเยอะ"
      ],
      "reason": "ชอบหมาพลังเยอะที่ออกกำลังด้วยกันได้ทุกเช้า"
    },
    "hours": "ทุกวัน 08:00–10:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-072",
    "displayName": "ศักดิ์ชัย",
    "sex": "male",
    "age": 60,
    "districtId": "dusit",
    "location": {
      "lat": 13.77928,
      "lng": 100.51887
    },
    "occupation": "อาจารย์มหาวิทยาลัยเกษียณ",
    "home": {
      "type": "house",
      "summary": "บ้านเก่าสไตล์โคโลเนียล มีสวนร่มรื่นและห้องสมุด"
    },
    "currentPets": [
      {
        "name": "ปรัชญา",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 7
      },
      {
        "name": "ตรรกะ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทา",
        "sex": "female",
        "ageYears": 6
      },
      {
        "name": "วิจัย",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "บ้านเงียบและมีเวลามาก จึงเหมาะกับแมวขี้อายที่ต้องใช้เวลาปรับตัว"
    },
    "hours": "ทุกวัน 09:00–17:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-073",
    "displayName": "นันทนา",
    "sex": "female",
    "age": 44,
    "districtId": "yan-nawa",
    "location": {
      "lat": 13.7064,
      "lng": 100.53842
    },
    "occupation": "เจ้าของโรงงานเย็บผ้าเล็ก ๆ",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 3 ชั้น ห้องนั่งเล่นพื้นไม้"
    },
    "currentPets": [
      {
        "name": "ขนมจีน",
        "species": "dog",
        "breed": "ชิสุ",
        "color": "ขาวทอง",
        "sex": "female",
        "ageYears": 6
      },
      {
        "name": "น้ำยา",
        "species": "dog",
        "breed": "ชิสุ",
        "color": "ขาวน้ำตาล",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ขาวทอง"
      ],
      "breeds": [
        "ชิสุ หรือหมาเล็กขนยาว"
      ],
      "reason": "ดูแลขนยาวเป็นและมีเวลาพาไปอาบน้ำตัดขนสม่ำเสมอ"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-074",
    "displayName": "ตูน",
    "sex": "male",
    "age": 27,
    "districtId": "saphan-sung",
    "location": {
      "lat": 13.77136,
      "lng": 100.68416
    },
    "occupation": "บาริสต้า",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ห้องเดียว มีระเบียงติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "ช็อต",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลเข้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาล"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ช็อตชอบมีเพื่อนเล่น จึงช่วยอุปถัมภ์น้องหลงได้ครั้งละตัว"
    },
    "hours": "ทุกวัน 15:00–18:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-075",
    "displayName": "อิงฟ้า",
    "sex": "female",
    "age": 30,
    "districtId": "bang-bon",
    "location": {
      "lat": 13.66565,
      "lng": 100.37337
    },
    "occupation": "ช่างปั้นเซรามิก",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวมีสตูดิโอปั้นดินแยกออกไป และสวนเล็ก ๆ"
    },
    "currentPets": [
      {
        "name": "ดินเผา",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มลายสลิด",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "เคลือบ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบแมวสีดินเหมือนงานเซรามิก และสตูดิโอแยกทำให้บ้านปลอดภัยกับแมว"
    },
    "hours": "ทุกวัน 16:00–19:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-076",
    "displayName": "ภัทร",
    "sex": "male",
    "age": 25,
    "districtId": "lat-krabang",
    "location": {
      "lat": 13.72866,
      "lng": 100.75952
    },
    "occupation": "วิศวกรโรงงาน",
    "home": {
      "type": "condo",
      "summary": "คอนโดใกล้ที่ทำงาน มีที่แขวนจักรยานในห้อง"
    },
    "currentPets": [
      {
        "name": "โซ่",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทาลายเสือ",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "เทา"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "โซ่เป็นแมวขี้เล่น อยากได้เพื่อนวัยใกล้กันมาเล่นด้วย"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-077",
    "displayName": "วาสนา",
    "sex": "female",
    "age": 48,
    "districtId": "rat-burana",
    "location": {
      "lat": 13.68677,
      "lng": 100.49993
    },
    "occupation": "แม่ค้าผลไม้ริมน้ำ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวริมน้ำ มีระเบียงล้อมรั้วและกรงพักชั่วคราว"
    },
    "currentPets": [
      {
        "name": "ลิ้นจี่",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวส้ม",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "มังคุด",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "ทุเรียน",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เหลือง",
        "sex": "male",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "เจอสัตว์หลงแถวท่าน้ำบ่อย บ้านมีกรงพักชั่วคราวพร้อมเสมอ"
    },
    "hours": "ทุกวัน 14:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-078",
    "displayName": "ธาร",
    "sex": "male",
    "age": 32,
    "districtId": "bangkok-yai",
    "location": {
      "lat": 13.72288,
      "lng": 100.46912
    },
    "occupation": "ไกด์พายเรือคายัคในคลอง",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ริมคลอง มีลานหน้าบ้านล้อมรั้วกันหมาตกน้ำ"
    },
    "currentPets": [
      {
        "name": "พาย",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ขาวดำ"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "บ้านล้อมรั้วริมน้ำแน่นหนา จึงรับหมาที่ต้องการที่พักด่วนระหว่างรอเจ้าของได้"
    },
    "hours": "ทุกวัน 17:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-079",
    "displayName": "มัลลิกา",
    "sex": "female",
    "age": 36,
    "districtId": "phaya-thai",
    "location": {
      "lat": 13.77744,
      "lng": 100.54835
    },
    "occupation": "นักวิจัยการตลาด",
    "home": {
      "type": "condo",
      "summary": "คอนโด 2 ห้องนอน มีห้องหนึ่งเป็นห้องแมว"
    },
    "currentPets": [
      {
        "name": "มะลิ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "กระเจี๊ยบ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มลายสลิด",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ขาวส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "มีห้องแมวแยกให้น้องใหม่ปรับตัวก่อน และชอบลายขาวส้มที่ดูอบอุ่น"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-080",
    "displayName": "เอก",
    "sex": "male",
    "age": 45,
    "districtId": "chom-thong",
    "location": {
      "lat": 13.67798,
      "lng": 100.49381
    },
    "occupation": "ครูมวยไทย",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวที่มียิมมวยเล็ก ๆ ด้านหน้า และลานหมาด้านหลัง"
    },
    "currentPets": [
      {
        "name": "หมัด",
        "species": "dog",
        "breed": "ไทยหลังอาน",
        "color": "น้ำตาลแดง",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "ศอก",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลแดง"
      ],
      "breeds": [
        "ไทยหลังอาน"
      ],
      "reason": "ชอบหมาไทยที่แข็งแรง และมีลูกศิษย์ช่วยพาหมาเดินทุกวัน"
    },
    "hours": "ทุกวัน 11:00–14:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-081",
    "displayName": "ปลายฟ้า",
    "sex": "female",
    "age": 23,
    "districtId": "lak-si",
    "location": {
      "lat": 13.89064,
      "lng": 100.57349
    },
    "occupation": "นักศึกษาปริญญาโทจิตวิทยา",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ห้องเดียว มุมอ่านหนังสือเล็ก ๆ"
    },
    "currentPets": [
      {
        "name": "ฟ้าคราม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทาฟ้า",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "เทาฟ้า"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "สนใจดูแลแมวขี้กลัวที่ต้องค่อย ๆ สร้างความไว้ใจ ตามที่เรียนด้านพฤติกรรม"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-082",
    "displayName": "กิตติ",
    "sex": "male",
    "age": 38,
    "districtId": "din-daeng",
    "location": {
      "lat": 13.7653,
      "lng": 100.55363
    },
    "occupation": "นักกีตาร์และครูสอนดนตรี",
    "home": {
      "type": "condo",
      "summary": "คอนโดที่มีห้องซ้อมดนตรีเก็บเสียง"
    },
    "currentPets": [
      {
        "name": "ริฟฟ์",
        "species": "cat",
        "breed": "เบงกอล",
        "color": "ลายจุดทอง",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "โซโล่",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "ลายจุด"
      ],
      "breeds": [
        "เบงกอล"
      ],
      "reason": "ชอบแมวพลังเยอะที่ต้องการกิจกรรม แต่ช่วงทัวร์คอนเสิร์ตรับได้จำกัด"
    },
    "hours": "ทุกวัน 13:00–16:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-083",
    "displayName": "สุนิสา",
    "sex": "female",
    "age": 52,
    "districtId": "bang-khen",
    "location": {
      "lat": 13.87915,
      "lng": 100.59139
    },
    "occupation": "เจ้าของร้านทำผม",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวที่ชั้นล่างเป็นร้านทำผม ชั้นบนเป็นบ้าน"
    },
    "currentPets": [
      {
        "name": "ม้วน",
        "species": "dog",
        "breed": "พุดเดิ้ล",
        "color": "น้ำตาลแดง",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "ดัด",
        "species": "dog",
        "breed": "พุดเดิ้ล",
        "color": "ขาว",
        "sex": "male",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลแดง"
      ],
      "breeds": [
        "พุดเดิ้ล หรือหมาเล็กขนหยิก"
      ],
      "reason": "ตัดแต่งขนเองได้ และรู้ว่าหมาขนหยิกต้องแปรงขนทุกวัน"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-084",
    "displayName": "โตโต้",
    "sex": "male",
    "age": 29,
    "districtId": "khlong-toei",
    "location": {
      "lat": 13.71244,
      "lng": 100.57125
    },
    "occupation": "ไรเดอร์ส่งอาหาร",
    "home": {
      "type": "apartment",
      "summary": "ห้องเช่าชั้น 4 มีระเบียงติดตาข่าย"
    },
    "currentPets": [
      {
        "name": "ไรเดอร์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ส้ม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "เคยช่วยลูกแมวข้างทางระหว่างส่งอาหาร จึงอยากช่วยอุปถัมภ์น้องหลงชั่วคราว"
    },
    "hours": "ทุกวัน 10:00–11:00 และ 15:00–16:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-085",
    "displayName": "ใหม่",
    "sex": "female",
    "age": 27,
    "districtId": "bang-rak",
    "location": {
      "lat": 13.72786,
      "lng": 100.52926
    },
    "occupation": "ช่างภาพอาหาร",
    "home": {
      "type": "condo",
      "summary": "คอนโดเก่าย่านเมือง แต่งสไตล์วินเทจ"
    },
    "currentPets": [
      {
        "name": "ครีมบรูเล่",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "มัทฉะ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบถ่ายภาพแมวสีครีมคู่กับขนม และบ้านเงียบพอสำหรับแมวใหม่"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-086",
    "displayName": "พงศ์",
    "sex": "male",
    "age": 34,
    "districtId": "phra-khanong",
    "location": {
      "lat": 13.69076,
      "lng": 100.59435
    },
    "occupation": "เภสัชกรร้านยา",
    "home": {
      "type": "condo",
      "summary": "คอนโด 2 ห้องนอน ห้องหนึ่งมีคอกกระต่าย"
    },
    "currentPets": [
      {
        "name": "ลูกชุบ",
        "species": "other",
        "breed": "กระต่ายฮอลแลนด์ลอป",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 2
      },
      {
        "name": "อาโม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวเทา",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ครีม"
      ],
      "breeds": [
        "กระต่ายหูตก หรือแมวพันทาง"
      ],
      "reason": "แยกห้องกระต่ายกับแมวได้ จึงรับได้ทั้งสองชนิด"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "other"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-087",
    "displayName": "มณี",
    "sex": "female",
    "age": 57,
    "districtId": "pom-prap-sattru-phai",
    "location": {
      "lat": 13.75691,
      "lng": 100.52276
    },
    "occupation": "ครูสอนรำไทย",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวเก่าที่ชั้นบนเป็นห้องซ้อมรำพื้นไม้"
    },
    "currentPets": [
      {
        "name": "ทองคำ",
        "species": "cat",
        "breed": "ศุภลักษณ์",
        "color": "น้ำตาลทองแดง",
        "sex": "female",
        "ageYears": 5
      },
      {
        "name": "มรกต",
        "species": "cat",
        "breed": "วิเชียรมาศ",
        "color": "ครีมแต้มน้ำตาล",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาลทองแดง"
      ],
      "breeds": [
        "ศุภลักษณ์",
        "แมวไทยโบราณ"
      ],
      "reason": "รักแมวไทยโบราณเหมือนรักนาฏศิลป์ไทย อยากช่วยให้สายพันธุ์ไทยได้บ้านที่เข้าใจ"
    },
    "hours": "ทุกวัน 09:00–12:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-088",
    "displayName": "ปรเมศวร์",
    "sex": "male",
    "age": 41,
    "districtId": "bang-kho-laem",
    "location": {
      "lat": 13.68828,
      "lng": 100.49776
    },
    "occupation": "เจ้าของบริษัทนำเข้าอาหาร",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวริมแม่น้ำ สนามหญ้ากว้างล้อมรั้ว"
    },
    "currentPets": [
      {
        "name": "ทองคำขาว",
        "species": "dog",
        "breed": "โกลเด้นรีทรีฟเวอร์",
        "color": "ครีม",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ทับทิม",
        "species": "dog",
        "breed": "โกลเด้นรีทรีฟเวอร์",
        "color": "ทองเข้ม",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ครีม",
        "ทอง"
      ],
      "breeds": [
        "โกลเด้นรีทรีฟเวอร์"
      ],
      "reason": "บ้านมีสนามกว้างพอสำหรับหมาใหญ่ และมีเวลาพาเดินทุกเย็น"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-089",
    "displayName": "เนย",
    "sex": "female",
    "age": 29,
    "districtId": "lat-phrao",
    "location": {
      "lat": 13.80401,
      "lng": 100.59646
    },
    "occupation": "ครูสอนทำขนม",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้น ห้องครัวแยกประตูปิด"
    },
    "currentPets": [
      {
        "name": "คุกกี้",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลลายเสือ",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "บราวนี่",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลเข้ม",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาล"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ตั้งชื่อน้องตามขนม และอยากได้น้องสีช็อกโกแลตมาครบทีม"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-090",
    "displayName": "เอิร์ธ",
    "sex": "male",
    "age": 26,
    "districtId": "wang-thonglang",
    "location": {
      "lat": 13.78482,
      "lng": 100.60951
    },
    "occupation": "นักแต่งเพลง",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์ห้องมุม มีแผ่นเสียงเต็มผนัง"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "สามสี"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากรับเลี้ยงแมวตัวแรก และชอบลายสามสีที่ดูเป็นศิลปะ"
    },
    "hours": "ทุกวัน 14:00–17:00",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-091",
    "displayName": "อรพิน",
    "sex": "female",
    "age": 62,
    "districtId": "bueng-kum",
    "location": {
      "lat": 13.77703,
      "lng": 100.67415
    },
    "occupation": "พยาบาลเกษียณ",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยว 2 ชั้น มีห้องพักฟื้นสัตว์ที่สะอาด"
    },
    "currentPets": [
      {
        "name": "ยาหอม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 10
      },
      {
        "name": "สำลี",
        "species": "cat",
        "breed": "เปอร์เซีย",
        "color": "ขาวครีม",
        "sex": "female",
        "ageYears": 9
      },
      {
        "name": "ผ้าก๊อซ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทา",
        "sex": "male",
        "ageYears": 8
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี (แมวสูงวัย/พักฟื้น)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "มีประสบการณ์ดูแลผู้ป่วย จึงอยากดูแลแมวสูงวัยหรือแมวที่ต้องให้ยาตามคำสั่งสัตวแพทย์"
    },
    "hours": "ทุกวัน 09:00–17:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-092",
    "displayName": "ชัยวัฒน์",
    "sex": "male",
    "age": 36,
    "districtId": "khlong-sam-wa",
    "location": {
      "lat": 13.86673,
      "lng": 100.70838
    },
    "occupation": "เจ้าของบ่อปลา",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยวกลางบ่อปลา มีลานดินกว้างล้อมรั้ว"
    },
    "currentPets": [
      {
        "name": "บ่อ",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 5
      },
      {
        "name": "นิล",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "เทา",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ทับทิม",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "แดง",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ไม่จำกัดสี"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "มีลานกว้างและรั้วแน่นหนา รับหมาที่ต้องการที่พักด่วนได้ทุกขนาด"
    },
    "hours": "ทุกวัน 06:00–08:00 และ 17:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "dog"
    ],
    "capacityTotal": 5,
    "currentCount": 3,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-093",
    "displayName": "น้ำหวาน",
    "sex": "female",
    "age": 24,
    "districtId": "huai-khwang",
    "location": {
      "lat": 13.77301,
      "lng": 100.58331
    },
    "occupation": "ครูสอนร้องเพลง",
    "home": {
      "type": "condo",
      "summary": "คอนโด 1 ห้องนอน ตกแต่งโทนพาสเทล"
    },
    "currentPets": [
      {
        "name": "บับเบิ้ล",
        "species": "cat",
        "breed": "เอ็กโซติกช็อตแฮร์",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ขาว"
      ],
      "breeds": [
        "เอ็กโซติกช็อตแฮร์",
        "เปอร์เซีย"
      ],
      "reason": "ชอบหน้ากลมแบนน่ารัก และพร้อมดูแลเรื่องเช็ดตาทุกวัน"
    },
    "hours": "ทุกวัน 20:00–22:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 2,
    "currentCount": 1,
    "availability": "limited",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-094",
    "displayName": "ธงชัย",
    "sex": "male",
    "age": 49,
    "districtId": "phasi-charoen",
    "location": {
      "lat": 13.71578,
      "lng": 100.43917
    },
    "occupation": "คนขับเรือหางยาวนำเที่ยวคลอง",
    "home": {
      "type": "wooden_house",
      "summary": "บ้านไม้ริมคลอง ท่าน้ำล้อมรั้ว"
    },
    "currentPets": [
      {
        "name": "หางยาว",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาล",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "ท่าน้ำ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ลายเสือ",
        "sex": "female",
        "ageYears": 4
      }
    ],
    "preferences": {
      "colors": [
        "น้ำตาล"
      ],
      "breeds": [
        "หมาไทยพันทาง"
      ],
      "reason": "บ้านริมคลองมีท่าน้ำล้อมรั้ว หมาแมวอยู่ร่วมกันได้ดีมานาน"
    },
    "hours": "ทุกวัน 17:00–19:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-095",
    "displayName": "ลูกปลา",
    "sex": "female",
    "age": 30,
    "districtId": "thon-buri",
    "location": {
      "lat": 13.7205,
      "lng": 100.49894
    },
    "occupation": "นักโภชนาการ",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้น ครัวสะอาด มีมุมอาหารแมวแยก"
    },
    "currentPets": [
      {
        "name": "อินทผลัม",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "น้ำตาลส้ม",
        "sex": "male",
        "ageYears": 4
      },
      {
        "name": "ซัยตูน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "เทาเขียว (ตาเขียว)",
        "sex": "female",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "เทา"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบแมวตาเขียวสีเทา และดูแลเรื่องอาหารให้น้องน้ำหนักพอดีได้"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-096",
    "displayName": "เต้ย",
    "sex": "male",
    "age": 28,
    "districtId": "don-mueang",
    "location": {
      "lat": 13.9201,
      "lng": 100.59608
    },
    "occupation": "พนักงานต้อนรับบนเครื่องบิน",
    "home": {
      "type": "condo",
      "summary": "คอนโดใกล้สนามบิน"
    },
    "currentPets": [],
    "preferences": {
      "colors": [
        "ส้มขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "อยากรับเลี้ยงเมื่อตารางบินลดลง ตอนนี้บินต่างประเทศจึงปิดรับ"
    },
    "hours": "ช่วงนี้ไม่สะดวก",
    "politeParticle": "ครับ",
    "careModes": [
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 1,
    "currentCount": 0,
    "availability": "unavailable",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-097",
    "displayName": "จิราพร",
    "sex": "female",
    "age": 41,
    "districtId": "bang-sue",
    "location": {
      "lat": 13.79952,
      "lng": 100.53359
    },
    "occupation": "รองผู้อำนวยการโรงเรียน",
    "home": {
      "type": "house",
      "summary": "บ้านเดี่ยว 2 ชั้น สวนกว้าง แยกห้องแมวและลานหมา"
    },
    "currentPets": [
      {
        "name": "ครูใหญ่",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 7
      },
      {
        "name": "ผู้ช่วย",
        "species": "dog",
        "breed": "หมาไทยพันทาง",
        "color": "น้ำตาลอ่อน",
        "sex": "female",
        "ageYears": 4
      },
      {
        "name": "ชอล์ก",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาว",
        "sex": "female",
        "ageYears": 3
      },
      {
        "name": "กระดาน",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ดำ",
        "sex": "male",
        "ageYears": 3
      }
    ],
    "preferences": {
      "colors": [
        "ดำ",
        "ขาว"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "บ้านกว้างแยกโซนชัดเจน และครอบครัวช่วยกันดูแลน้องที่มาพักด่วนได้"
    },
    "hours": "ทุกวัน 18:00–20:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat",
      "dog"
    ],
    "capacityTotal": 6,
    "currentCount": 4,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-098",
    "displayName": "ศรัณย์",
    "sex": "male",
    "age": 33,
    "districtId": "thung-khru",
    "location": {
      "lat": 13.61543,
      "lng": 100.50914
    },
    "occupation": "วิศวกรหุ่นยนต์",
    "home": {
      "type": "townhouse",
      "summary": "ทาวน์เฮาส์ 2 ชั้น มีห้องทำงานแยกปิดประตูได้"
    },
    "currentPets": [
      {
        "name": "เซนเซอร์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ขาวดำ",
        "sex": "male",
        "ageYears": 3
      },
      {
        "name": "มอเตอร์",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้ม",
        "sex": "male",
        "ageYears": 2
      }
    ],
    "preferences": {
      "colors": [
        "ขาวดำ"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ชอบแมวพลังเยอะที่เล่นวงล้อแมว และห้องทำงานแยกทำให้ปลอดภัยจากสายไฟ"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  },
  {
    "id": "adopter-099",
    "displayName": "ปุยฝ้าย",
    "sex": "female",
    "age": 25,
    "districtId": "prawet",
    "location": {
      "lat": 13.7135,
      "lng": 100.6998
    },
    "occupation": "ผู้ช่วยสัตวแพทย์",
    "home": {
      "type": "apartment",
      "summary": "อพาร์ตเมนต์สองห้อง มีห้องอนุบาลลูกแมวที่สะอาด"
    },
    "currentPets": [
      {
        "name": "ฝ้ายคำ",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มขาว",
        "sex": "female",
        "ageYears": 1
      },
      {
        "name": "ด้ายแดง",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ลายสลิด",
        "sex": "male",
        "ageYears": 1
      }
    ],
    "preferences": {
      "colors": [
        "ทุกสี (ลูกแมว)"
      ],
      "breeds": [
        "ไม่จำกัดพันธุ์"
      ],
      "reason": "ทำงานคลินิกจึงคุ้นกับลูกแมว และช่วยดูแลชั่วคราวระหว่างรอเจ้าของหรือบ้านใหม่ (ไม่รักษาเอง)"
    },
    "hours": "ทุกวัน 19:00–21:00",
    "politeParticle": "ค่ะ",
    "careModes": [
      "foster"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 4,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": true
  },
  {
    "id": "adopter-100",
    "displayName": "ชาญ",
    "sex": "male",
    "age": 67,
    "districtId": "phra-nakhon",
    "location": {
      "lat": 13.74892,
      "lng": 100.50551
    },
    "occupation": "ช่างทองเกษียณ",
    "home": {
      "type": "shophouse",
      "summary": "ตึกแถวเก่าในย่านเมืองเก่า ชั้นบนเป็นบ้าน หน้าต่างติดมุ้งลวด"
    },
    "currentPets": [
      {
        "name": "ทองเค",
        "species": "cat",
        "breed": "แมวไทยพันทาง",
        "color": "ส้มทอง",
        "sex": "male",
        "ageYears": 6
      },
      {
        "name": "เงินยวง",
        "species": "cat",
        "breed": "โคราช",
        "color": "เทาเงิน",
        "sex": "female",
        "ageYears": 5
      }
    ],
    "preferences": {
      "colors": [
        "ส้มทอง"
      ],
      "breeds": [
        "โคราช"
      ],
      "reason": "ชอบสีส้มทองเหมือนทองที่เคยทำ และแมวโคราชเงินยวงเข้ากับชื่อร้านเก่า"
    },
    "hours": "ทุกวัน 09:00–17:00",
    "politeParticle": "ครับ",
    "careModes": [
      "foster",
      "adopt"
    ],
    "speciesAccepted": [
      "cat"
    ],
    "capacityTotal": 3,
    "currentCount": 2,
    "availability": "available",
    "acceptsEmergency": false
  }
];
