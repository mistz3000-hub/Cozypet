"""
เสียงพากย์สังเคราะห์ (ร่าง) สำหรับวิดีโอเดโม — DEMO_VIDEO.md หัวข้อ 8 (D33)
ใช้ Kokoro-82M (Apache-2.0) ผ่าน kokoro-onnx (MIT) แบบออฟไลน์ ไม่มีค่าใช้จ่าย ไม่เรียก API ภายนอก
เสียงผู้หญิงสมมติจากโมเดล ไม่ได้เลียนเสียงบุคคลจริง และต้องเขียนในเครดิตว่า "เสียงบรรยายสังเคราะห์ด้วย AI"

usage: python voice.py <plan.json> <out_dir>
plan.json = { "voice": "af_heart", "lang": "en-us", "lines": [{ "key", "text", "start", "maxDur" }] }
ต้องมีไฟล์โมเดลใน KOKORO_DIR: kokoro-v1.0.onnx, voices-v1.0.bin (ดาวน์โหลดจาก releases ของ kokoro-onnx ไม่เก็บใน repo)
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SR_OUT = 48000
MAX_SPEED = 1.18


def resample(y: np.ndarray, sr: int, to: int) -> np.ndarray:
    if sr == to:
        return y
    n = int(round(len(y) * to / sr))
    x_old = np.linspace(0, 1, num=len(y), endpoint=False)
    x_new = np.linspace(0, 1, num=n, endpoint=False)
    return np.interp(x_new, x_old, y).astype(np.float32)


def trim(y: np.ndarray, sr: int) -> np.ndarray:
    thr = 0.01 * max(1e-6, float(np.max(np.abs(y))))
    idx = np.where(np.abs(y) > thr)[0]
    if len(idx) == 0:
        return y
    a = max(0, idx[0] - int(0.03 * sr))
    b = min(len(y), idx[-1] + int(0.08 * sr))
    return y[a:b]


def main():
    plan_path, out_dir = sys.argv[1], sys.argv[2]
    plan = json.load(open(plan_path, encoding='utf-8'))
    kdir = os.environ.get('KOKORO_DIR', '.')
    k = Kokoro(os.path.join(kdir, 'kokoro-v1.0.onnx'), os.path.join(kdir, 'voices-v1.0.bin'))
    os.makedirs(out_dir, exist_ok=True)
    voice = plan.get('voice', 'af_heart')
    lang = plan.get('lang', 'en-us')
    total = float(plan['duration'])
    mix = np.zeros(int(total * SR_OUT) + SR_OUT, dtype=np.float32)
    report = []
    for line in plan['lines']:
        speed = float(plan.get('speed', 1.0))
        while True:
            a, sr = k.create(line['text'], voice=voice, speed=speed, lang=lang)
            a = trim(np.asarray(a, dtype=np.float32), sr)
            dur = len(a) / sr
            if dur <= line['maxDur'] or speed >= MAX_SPEED:
                break
            speed = min(MAX_SPEED, speed * min(1.08, dur / line['maxDur'] + 0.01))
        y = resample(a, sr, SR_OUT)
        # fade หัวท้าย 8 ms กันเสียงคลิก
        f = int(0.008 * SR_OUT)
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
        sf.write(os.path.join(out_dir, f"vo-{line['key']}-{int(line['start'] * 1000):06d}.wav"), y, SR_OUT)
        s0 = int(line['start'] * SR_OUT)
        mix[s0:s0 + len(y)] += y
        report.append({'key': line['key'], 'start': line['start'], 'dur': round(len(y) / SR_OUT, 3), 'speed': round(speed, 3), 'maxDur': line['maxDur'], 'fits': len(y) / SR_OUT <= line['maxDur'] + 0.05})
    mix = mix[: int(total * SR_OUT)]
    peak = float(np.max(np.abs(mix))) or 1.0
    mix = mix / peak * 0.89
    sf.write(os.path.join(out_dir, 'voice.wav'), np.stack([mix, mix], axis=1), SR_OUT, subtype='PCM_16')
    json.dump({'voice': voice, 'lang': lang, 'synthetic': True, 'lines': report}, open(os.path.join(out_dir, 'voice.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for r in report:
        flag = '' if r['fits'] else '  ⚠ ยาวเกินช่วง'
        print(f"  {r['start']:7.2f}s  {r['key']:<14} {r['dur']:5.2f}s / {r['maxDur']:5.2f}s  x{r['speed']}{flag}")


if __name__ == '__main__':
    main()
