# Luma Code Review Report

**Date:** 2026-03-10 11:19:15
**Files Reviewed:** ['src/App.tsx', 'src/pages/SettingsOverlay.tsx', 'src/pages/ReportsPage.tsx', 'code_review.md', 'package-lock.json', 'package.json', 'src/pages/ManageJars.tsx', 'src/utils/generatedMockData.ts', 'src/components/BottomNav.tsx', 'src/components/ExpenseGraphMock.tsx', 'src/pages/ManageWallets.tsx']

## 📝 Reviewer Feedback

ในไฟล์ `src/pages/ManageWallets.tsx` ที่คอมโพเนนต์ `AddWalletModal` มีข้อผิดพลาดด้าน Logic และทำให้เกิดประสบการณ์การใช้งานที่ไม่ดี

**ปัญหา:**

dropdown สำหรับเลือก Parent Wallet แสดง Wallet ทั้งหมดให้ผู้ใช้เลือก แม้ว่า Wallet บางอันจะไม่สามารถเป็น Parent ได้ (เนื่องจากมี level เกินที่กำหนดไว้คือ level 2) ระบบจะแจ้งเตือนผู้ใช้ด้วย `alert()` ก็ต่อเมื่อพยายามจะบันทึกแล้วเท่านั้น ซึ่งเป็นประสบการณ์ที่ไม่ดี

**วิธีการแก้ไข:**

ควรปรับปรุงโดยการกรองรายชื่อ Wallet ใน dropdown ให้แสดงเฉพาะ Wallet ที่สามารถเป็น Parent ได้เท่านั้น (คือ Wallet ที่มี `level < 2`) เพื่อป้องกันไม่ให้ผู้ใช้เลือกตัวเลือกที่ผิดตั้งแต่แรก

เปลี่ยนจาก:
```tsx
<select
    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={parentId}
    onChange={e => setParentId(e.target.value)}
>
    <option value="">No Parent</option>
    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
</select>
```

เป็น:
```tsx
<select
    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={parentId}
    onChange={e => setParentId(e.target.value)}
>
    <option value="">No Parent</option>
    {wallets.filter(w => w.level < 2).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
</select>
```

## 🧪 Test Suggestions

สวัสดีครับ เพื่อที่จะวิเคราะห์การเปลี่ยนแปลงของโค้ดและเขียน "Manual Verification Guide" ให้ได้นั้น ผมต้องการข้อมูลโค้ดที่มีการเปลี่ยนแปลงซึ่งยังไม่ได้ระบุไว้ในคำสั่งครับ

กรุณาแนบโค้ดส่วนที่มีการเปลี่ยนแปลงมาเพื่อให้ผมดำเนินการต่อได้ครับ

