/** ภาพที่ฉากสร้างขึ้นตอน ready() แล้วชั้น DOM ต้องใช้ (เช่น “ภาพแรกบนถนน” จากบท 0) */
const store = new Map<string, string>();

export const filmAssets = {
  get: (key: string) => store.get(key),
  set: (key: string, url: string) => {
    store.set(key, url);
  },
};
