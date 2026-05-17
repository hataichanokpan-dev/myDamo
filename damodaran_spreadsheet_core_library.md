# Damodaran Spreadsheet Core Library

สรุปไฟล์ Spreadsheet สำคัญของ Aswath Damodaran สำหรับเก็บเป็นคลังเครื่องมือ Valuation ส่วนตัว

| # | File | ใช้ทำอะไร | ใช้ตอนไหน |
|---|---|---|---|
| 1 | `fcffsimpleginzu.xlsx` | DCF แบบ FCFF เวอร์ชันใช้ง่าย คำนวณรายได้, margin, reinvestment, terminal value และ fair value | ใช้เป็นไฟล์หลักสำหรับประเมินมูลค่าหุ้นทั่วไป เริ่มต้นทำเว็บ Valuation ควรเริ่มจากตัวนี้ |
| 2 | `fcffginzu.xls` | DCF แบบ FCFF เวอร์ชันใหญ่ มีเครื่องมือปรับงบ เช่น beta, rating, R&D, lease, normalized earnings | ใช้ศึกษา logic ขั้นสูง หรือใช้กับบริษัทที่ต้องปรับงบหลายส่วนก่อนประเมินมูลค่า |
| 3 | `higrowth.xls` | Valuation สำหรับบริษัทโตสูง กำไรยังไม่นิ่ง หรือยังขาดทุน | ใช้กับหุ้น Growth, Tech, SaaS, AI, Platform หรือบริษัทที่ narrative สำคัญกว่ากำไรปัจจุบัน |
| 4 | `model.xls` | ช่วยเลือกโมเดล Valuation ที่เหมาะสม เช่น Dividend, FCFE, FCFF | ใช้ตอนยังไม่แน่ใจว่าหุ้นตัวนี้ควรประเมินด้วยโมเดลอะไร |
| 5 | `wacccalc.xls` | คำนวณ Cost of Capital / WACC จาก risk-free rate, beta, ERP, debt cost และโครงสร้างเงินทุน | ใช้ก่อนทำ DCF ทุกครั้ง เพราะ WACC เป็น assumption สำคัญมาก |
| 6 | `impliedROC&ROE.xls` | ตรวจว่า Terminal Value imply ROIC หรือ ROE เท่าไร | ใช้เป็น sanity check ว่า DCF เพ้อเกินไปหรือไม่ โดยเฉพาะช่วง terminal value |
| 7 | `implprem.xls` | คำนวณ Implied Equity Risk Premium ของตลาด | ใช้หา ERP ที่สมเหตุสมผลสำหรับประเมินหุ้น โดยเฉพาะหุ้นสหรัฐฯ หรือ global market |
| 8 | `R&DConv.xls` | แปลง R&D จากค่าใช้จ่ายเป็นสินทรัพย์ลงทุน และปรับ operating income ใหม่ | ใช้กับบริษัท Tech, Software, Pharma, Biotech หรือบริษัทที่ลงทุนผ่าน R&D สูง |
| 9 | `oplease.xls` | แปลง Operating Lease ให้เป็น Debt และปรับ Operating Income | ใช้กับธุรกิจเช่าพื้นที่เยอะ เช่น ค้าปลีก ร้านอาหาร สายการบิน โรงแรม |
| 10 | `normearn.xls` | Normalize earnings จากกำไรย้อนหลังหรือค่าเฉลี่ยอุตสาหกรรม | ใช้กับหุ้น cyclical, turnaround, กำไรผันผวน หรือปีล่าสุดมีกำไรพิเศษ |

## ลำดับที่ควรโหลดก่อน

1. `fcffsimpleginzu.xlsx` — แกน DCF หลัก  
2. `wacccalc.xls` — แกนคำนวณ WACC  
3. `impliedROC&ROE.xls` — ตัวตรวจความสมเหตุสมผลของ Terminal Value  
4. `normearn.xls` — ใช้ปรับกำไรให้เป็นฐานปกติ  
5. `higrowth.xls` — ใช้กับหุ้นเติบโตสูงหรือกำไรยังไม่นิ่ง  

## สรุปสั้นที่สุด

- ถ้าจะทำ DCF หุ้นทั่วไป: ใช้ `fcffsimpleginzu.xlsx`
- ถ้าต้องการรุ่นใหญ่ครบเครื่อง: ใช้ `fcffginzu.xls`
- ถ้าหุ้นโตสูงหรือกำไรยังไม่ชัด: ใช้ `higrowth.xls`
- ถ้าไม่รู้ควรใช้โมเดลไหน: ใช้ `model.xls`
- ถ้าต้องหา WACC: ใช้ `wacccalc.xls`
- ถ้าต้องตรวจว่า terminal value สมเหตุสมผลไหม: ใช้ `impliedROC&ROE.xls`
- ถ้าต้องหา ERP จากตลาด: ใช้ `implprem.xls`
- ถ้าบริษัทมี R&D สูง: ใช้ `R&DConv.xls`
- ถ้าบริษัทมี lease เยอะ: ใช้ `oplease.xls`
- ถ้ากำไรผันผวนหรือมี one-off: ใช้ `normearn.xls`
