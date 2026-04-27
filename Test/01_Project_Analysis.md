# Phan tich du an - Library Management System

## 1. Pham vi thong tin da phan tich

Nguon thong tin duoc doc va doi chieu:

- `README.md`
- `CONTEXT.md`
- Backend Spring Boot trong `backend/src/main/java/com/library`
- Schema va seed SQL Server trong `backend/database/library_sqlserver_seed.sql`
- Frontend React/Vite trong `frontend/src/main.jsx`
- Cau hinh build backend/frontend trong `backend/pom.xml` va `frontend/package.json`

## 2. Muc tieu he thong

Library Management System la ung dung quan ly thu vien gom backend REST API, frontend dashboard va co so du lieu SQL Server. Muc tieu chinh:

- Quan ly danh muc sach va so luong ban sao.
- Quan ly thanh vien thu vien.
- Ho tro muon sach khi thanh vien hop le va sach con kha dung.
- Ho tro tra sach, cap nhat trang thai phieu muon va so luong sach kha dung.
- Theo doi sach dang muon, sach qua han va lich su tra sach.
- Hien thi dashboard thong ke tong sach, tong thanh vien, sach dang muon va sach qua han.

## 3. Kien truc tong quan

| Thanh phan | Cong nghe | Vai tro |
|---|---|---|
| Frontend | React 19, Vite, lucide-react | Dashboard va cac man hinh quan ly sach, thanh vien, muon/tra |
| Backend | Java 17, Spring Boot 3.3.5 | REST API tai `/api`, xu ly nghiep vu va ket noi SQL Server |
| Database | SQL Server | Luu Books, Members, BorrowRecords, ReturnBooks |
| Data access | JDBC | Truy van SQL truc tiep thong qua `SqlServerLibraryService` |

## 4. Cac module/chuc nang chinh

| Module | Chuc nang hien co | Ghi chu |
|---|---|---|
| Dashboard | Xem tong so sach, thanh vien, sach dang muon, sach qua han | Lay tu `/api/stats`; fallback tinh tren local data neu API loi |
| Book Management | Xem danh sach sach, tim/filter sach tren UI, them sach moi | Backend co `GET /api/books`, `GET /api/books?q=`, `POST /api/books`; nut edit/delete tren UI chua co API xu ly |
| Member Management | Xem danh sach thanh vien, them thanh vien | Backend co `GET /api/members`, `POST /api/members`; UI tu sinh member code |
| Circulation | Tao phieu muon, xem active loans, tra sach | Backend co `POST /api/borrow-records`, `GET /api/borrow-records/active`, `POST /api/returns` |
| Return history | Xem danh sach ban ghi tra sach | Backend co `GET /api/return-books`; frontend hien tai chua co man hinh rieng |
| Health/Connectivity | Kiem tra backend | `GET /api/health`, banner frontend bao trang thai API |

## 5. API endpoints

| Method | Endpoint | Muc dich |
|---|---|---|
| GET | `/api/health` | Kiem tra backend song |
| GET | `/api/stats` | Lay thong ke dashboard |
| GET | `/api/books` | Lay danh sach sach |
| GET | `/api/books?q={keyword}` | Tim sach theo title, author, subject |
| POST | `/api/books` | Them sach moi |
| GET | `/api/members` | Lay danh sach thanh vien |
| POST | `/api/members` | Them thanh vien moi |
| GET | `/api/borrow-records` | Lay toan bo phieu muon |
| GET | `/api/borrow-records/active` | Lay phieu muon trang thai BORROWED/OVERDUE |
| POST | `/api/borrow-records` | Tao phieu muon |
| POST | `/api/returns` | Tra sach |
| GET | `/api/return-books` | Lay ban ghi tra sach |
| POST | `/api/reload-check` | Kiem tra so luong data backend dang load |

## 6. Actors

| Actor | Mo ta | Quyen/chuc nang |
|---|---|---|
| Librarian/Admin | Nguoi van hanh he thong thu vien | Xem dashboard, quan ly sach, quan ly thanh vien, tao phieu muon, xu ly tra sach |
| Member/Patron | Thanh vien thu vien | Duoc luu trong database va co the muon sach neu ACTIVE; khong co UI/role dang nhap rieng trong version hien tai |
| Backend API Client | Frontend hoac cong cu API | Goi cac endpoint REST de doc/ghi du lieu |

## 7. Luong nghiep vu chinh

### 7.1 Xem dashboard

1. Admin mo frontend.
2. Frontend goi song song `/books`, `/members`, `/borrow-records/active`, `/stats`.
3. Neu API thanh cong, UI hien thi du lieu tu SQL Server.
4. Neu API loi, UI hien thi fallback data va banner canh bao backend unavailable.

### 7.2 Them sach

1. Admin mo Book Management.
2. Nhap title, author, category/subject, quantity.
3. Frontend goi `POST /api/books`.
4. Backend validate title/author/subject khong rong, totalQuantity >= 0.
5. Backend insert vao `dbo.Books`, tu sinh ISBN dang `APP-{timestamp}`, AvailableQuantity = TotalQuantity.
6. Frontend reload data va hien sach moi.

### 7.3 Them thanh vien

1. Admin mo Member Management.
2. Nhap full name, email, phone.
3. Frontend tu sinh member code dang `M{timestamp suffix}` va goi `POST /api/members`.
4. Backend validate code/fullName khong rong.
5. Backend insert thanh vien voi Status = ACTIVE, JoinDate = ngay hien tai.
6. Frontend reload data va hien thanh vien moi.

### 7.4 Muon sach

1. Admin mo Circulation.
2. Chon member ACTIVE va sach co available > 0.
3. Nhap borrow date va due date.
4. Frontend goi `POST /api/borrow-records`.
5. Backend validate dueDate >= borrowDate.
6. Backend load book/member, kiem tra member ACTIVE va book available.
7. Backend bat transaction, giam AvailableQuantity, tao BorrowRecords status BORROWED, commit.
8. Frontend reload active loans, dashboard va ton kho.

### 7.5 Tra sach

1. Admin mo Circulation, chon mot active loan.
2. Bam Return Book.
3. Frontend goi `POST /api/returns` voi returnDate = ngay hien tai.
4. Backend load BorrowRecord, chi cho tra neu status BORROWED hoac OVERDUE.
5. Backend bat transaction, cap nhat BorrowRecords thanh RETURNED, tang AvailableQuantity, update/insert ReturnBooks, commit.
6. Frontend reload active loans; phieu vua tra khong con trong danh sach active.

## 8. Database va rule du lieu quan trong

| Bang | Rule/rang buoc chinh |
|---|---|
| Books | Title, Author, Subject NOT NULL; ISBN UNIQUE; TotalQuantity >= 0; AvailableQuantity >= 0; AvailableQuantity <= TotalQuantity |
| Members | MemberCode UNIQUE; FullName NOT NULL; Status trong ACTIVE, INACTIVE, BLOCKED |
| BorrowRecords | FK toi Books/Members; Status trong BORROWED, RETURNED, OVERDUE; DueDate >= BorrowDate; ReturnDate null hoac >= BorrowDate |
| ReturnBooks | BorrowRecordId UNIQUE; FK toi BorrowRecords/Books/Members; ReturnStatus trong PENDING, RETURNED, OVERDUE |

## 9. Cac diem rui ro cao

| Risk area | Muc do | Ly do |
|---|---|---|
| Dong bo so luong sach khi muon/tra | Cao | Loi transaction co the lam AvailableQuantity sai hoac vuot TotalQuantity |
| Nghiep vu muon sach | Cao | Phu thuoc member status, book availability, date validation va FK |
| Nghiep vu tra sach | Cao | Rui ro tra lap, tang quantity nhieu lan, sai ReturnBooks |
| Validation input backend | Cao | API khong co DTO validation annotation; nhieu loi runtime tra ve 500 neu khong co exception handler |
| Duplicate member code/ISBN | Trung binh-Cao | DB co UNIQUE; frontend tu sinh code, backend phu thuoc DB exception |
| Date handling | Trung binh-Cao | dueDate, borrowDate, returnDate anh huong trang thai va tinh hop le |
| Frontend fallback data | Trung binh | Co the lam user nham tuong dang thao tac tren DB khi backend loi |
| Search/filter | Trung binh | Backend search theo title/author/subject; frontend filter them ISBN fallback |
| Error display tren UI | Trung binh | `apiPost` throw error nhung UI chua hien thong bao than thien |
| Bao mat/cau hinh DB | Trung binh | Credential mac dinh hard-code cho moi truong demo |
| CORS/API base URL | Trung binh | Chi allow localhost/127.0.0.1 port 5173; sai origin se loi frontend |
| Chuc nang UI chua hoan thien | Thap-Trung binh | Edit/delete/settings/logout co nut nhung chua co handler/API |

