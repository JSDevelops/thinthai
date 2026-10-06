# ThinThai Database

PostgreSQL 16+ ในเครื่อง แยก development/test ที่พอร์ต 55433 ใช้ npm run db:start, db:migrate และ db:seed ตามคู่มือ docs/LOCAL_DEVELOPMENT.md

001: users, roles, store memberships, areas; 002: passwords, sessions, rate limits, audit. Migration ที่ถูกใช้งานแล้วไม่แก้ย้อนหลัง ให้เพิ่มไฟล์ใหม่แทน PostGIS/โซนจัดส่งยังอยู่ขั้นถัดไป
