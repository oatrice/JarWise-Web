# 📘 JarWise TypeScript Standards

มาตรฐานการเขียน TypeScript สำหรับโปรเจกต์ JarWise (New Project)
เนื่องจากเราเริ่มเขียนใหม่ทั้งหมดด้วย TypeScript จึงไม่มีขั้นตอน Migration แต่ต้องเคร่งครัดเรื่อง Type Safety

## Core Rules
1.  **Strict Mode Enabled**: `tsconfig.json` ต้องมี `"strict": true` เสมอ (Vite Default)
2.  **No Any**: ห้ามใช้ `any` หรือ `Function` (generic type) โดยเด็ดขาด ให้ใช้ `unknown` หรือสร้าง Interface/Type ที่ชัดเจน
3.  **Explicit Return Types**: แนะนำให้ระบุ Return type สำหรับ Function ที่ซับซ้อน

## Components & Props
- **Interface Only**: ให้ใช้ `interface` สำหรับ Props เสมอ (ไม่ใช้ `type`) เพื่อความง่ายในการ Extend
  ```tsx
  interface JarCardProps {
    jar: Jar;
    active?: boolean;
  }
  ```
- **Functional Components**: เขียนแบบ Arrow Function
  ```tsx
  export const JarCard = ({ jar }: JarCardProps) => { ... }
  ```

## Project-Specific patterns
- **Icons**: ใช้ `lucide-react` เท่านั้น
- **Styling**: ใช้ Tailwind v4 Utilities เป็นหลัก หลีกเลี่ยง Style Object
- **State**: ใช้ Type Inference ยกเว้นกรณีที่ค่าเริ่มต้นเป็น null
  ```tsx
  const [user, setUser] = useState<User | null>(null);
  ```
