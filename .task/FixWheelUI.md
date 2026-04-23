# 🧩 TASK: FixWheelUI

## 🎯 Objective
Fix wheel layout, alignment, and animation to look realistic and centered.

---

## 🔄 Flow

1. Ensure wheel container is perfectly centered
2. Fix pointer position (top center)
3. Ensure segments are evenly distributed
4. Add realistic spin animation:
   - ease-out
   - random rotation (multiple spins)
5. Ensure result aligns with pointer

---

## 🧠 Frontend

- components/Wheel.tsx
- use CSS transform + rotate
- calculate angle per segment

---

## ⚠️ Edge Cases

- wrong segment result due to rotation mismatch
- animation stops between segments

---

## 🚫 Anti-pattern

- do NOT hardcode rotation degrees