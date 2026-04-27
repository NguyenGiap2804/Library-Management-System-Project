# Phan tich test theo ISTQB

## 1. Test basis

Tai lieu va artifact lam co so thiet ke test:

- Business flow trong `README.md` va `CONTEXT.md`.
- API contract tu `LibraryController`.
- Business rules trong `SqlServerLibraryService`.
- Data constraints trong `library_sqlserver_seed.sql`.
- UI behavior trong `frontend/src/main.jsx`.

## 2. Chuc nang can test

| ID | Chuc nang | Can test | Muc uu tien |
|---|---|---|---|
| F01 | Health check | Backend tra status ok | Medium |
| F02 | Dashboard stats | Tinh totalBooks, totalMembers, borrowedBooks, overdueBooks dung | High |
| F03 | Xem danh sach sach | Lay data, mapping field, sap xep theo BookId | High |
| F04 | Tim sach | Search title/author/subject, keyword rong, khong co ket qua | Medium |
| F05 | Them sach | Required fields, quantity, AvailableQuantity = TotalQuantity, ISBN unique tu sinh | High |
| F06 | Xem danh sach thanh vien | Lay data, status mapping, hien phone/status | Medium |
| F07 | Them thanh vien | Required code/name, duplicate code, phone optional | High |
| F08 | Xem active loans | Chi hien BORROWED/OVERDUE, khong hien RETURNED | High |
| F09 | Muon sach | Member ACTIVE, book available, due date hop le, transaction giam quantity | Critical |
| F10 | Tra sach | Active record, update status RETURNED, tang quantity, ReturnBooks upsert | Critical |
| F11 | Lich su tra sach | Lay ReturnBooks, mapping nested borrow/book/member | Medium |
| F12 | Frontend load data | API success/failure banner, fallback data, reload sau action | Medium |
| F13 | Frontend forms | Modal add book/member, loan form date/select, return button | Medium |
| F14 | Database constraints | Check quantity range, status enum, FK, unique fields | High |
| F15 | Integration/CORS/config | Frontend goi backend dung base URL va origin | Medium |

## 3. Loai test phu hop

| Loai test | Ap dung cho | Muc dich |
|---|---|---|
| Functional testing | Tat ca API va UI flow | Xac minh chuc nang dung yeu cau |
| Negative testing | Missing field, invalid ID, inactive member, out-of-stock, duplicate code, invalid date | Dam bao he thong tu choi input/hanh dong khong hop le |
| Boundary Value Analysis | totalQuantity, AvailableQuantity, dueDate/borrowDate, stock = 0/1 | Phat hien loi tai bien du lieu |
| Equivalence Partitioning | Member status, book availability, search keyword, date relation | Giam so test nhung van bao phu nhom du lieu |
| State transition testing | BorrowRecord: BORROWED/OVERDUE -> RETURNED; RETURNED khong duoc return lai | Kiem tra thay doi trang thai hop le |
| Decision table testing | Dieu kien muon sach: member status, book available, date hop le | Bao phu ket hop rule nghiep vu |
| Integration testing | Frontend-backend, backend-database, transaction muon/tra | Kiem tra tuong tac giua component |
| API contract testing | JSON request/response, HTTP status, field mapping | Phat hien sai contract frontend/backend |
| Database testing | Constraints, FK, unique, consistency quantity | Dam bao tinh toan ven du lieu |
| Usability smoke testing | UI navigation, modal, banner, form | Xac minh user thao tac duoc cac luong chinh |
| Regression testing | Sau sua API/DB/UI | Dam bao luong chinh khong bi hong |

## 4. Ky thuat test ISTQB de xuat

### 4.1 Equivalence Partitioning

| Doi tuong | Partition hop le | Partition khong hop le |
|---|---|---|
| Book title/author/subject | Chuoi co ky tu sau trim | Null, rong, chi space |
| totalQuantity | 0, so nguyen duong | So am |
| Member code/fullName | Chuoi co ky tu sau trim | Null, rong, chi space |
| Member status | ACTIVE | INACTIVE, BLOCKED, status ngoai enum |
| Book availability | AvailableQuantity > 0 | AvailableQuantity = 0 |
| Date muon | dueDate >= borrowDate | dueDate < borrowDate |
| BorrowRecord status khi tra | BORROWED, OVERDUE | RETURNED, id khong ton tai |
| Search keyword | Match title/author/subject | Khong match, keyword rong |

### 4.2 Boundary Value Analysis

| Truong/rule | Gia tri bien can test |
|---|---|
| totalQuantity | -1, 0, 1 |
| AvailableQuantity khi muon | 0, 1 |
| AvailableQuantity khi tra | TotalQuantity - 1, TotalQuantity |
| dueDate so voi borrowDate | borrowDate - 1 ngay, bang borrowDate, borrowDate + 1 ngay |
| returnDate so voi borrowDate | borrowDate - 1 ngay, bang borrowDate, sau borrowDate |
| MemberCode VARCHAR(20) | 0 ky tu, 1 ky tu, 20 ky tu, 21 ky tu |
| ISBN VARCHAR(30) | duplicate, unique; do dai gan 30 neu test truc tiep DB |

### 4.3 Decision Table cho muon sach

| Rule | Member ACTIVE | Book available > 0 | dueDate >= borrowDate | Ket qua |
|---|---|---|---|---|
| R1 | Yes | Yes | Yes | Tao borrow record, giam quantity |
| R2 | No | Yes | Yes | Tu choi: member khong active |
| R3 | Yes | No | Yes | Tu choi: sach het |
| R4 | Yes | Yes | No | Tu choi: due date invalid |
| R5 | No | No | No | Tu choi; khong thay doi DB |

### 4.4 State Transition cho phieu muon

| Trang thai hien tai | Action | Trang thai moi | Hop le? |
|---|---|---|---|
| BORROWED | Return book | RETURNED | Hop le |
| OVERDUE | Return book | RETURNED | Hop le |
| RETURNED | Return book lan 2 | RETURNED | Khong hop le, phai bao loi |
| BORROWED | Qua due date | OVERDUE | Co trong data seed, nhung chua co job/API auto update |

## 5. Test data de xuat

| Nhom data | Gia tri mau |
|---|---|
| Sach hop le | Title: `Clean Code QA`, Author: `Robert C. Martin`, Subject: `Software Engineering`, totalQuantity: 1 |
| Sach quantity bien | totalQuantity: 0, 1, -1 |
| Thanh vien ACTIVE | Member co Status = ACTIVE trong DB seed, vi du `M001` |
| Thanh vien INACTIVE | Member co Status = INACTIVE trong DB seed, vi du `M010` |
| Thanh vien BLOCKED | Member co Status = BLOCKED trong DB seed, vi du `M020` |
| Ngay hop le | borrowDate = `2026-04-27`, dueDate = `2026-04-27` hoac `2026-05-11` |
| Ngay khong hop le | borrowDate = `2026-04-27`, dueDate = `2026-04-26` |
| Search keyword match | `Java`, `Author 1`, `Database` |
| Search keyword no match | `__NO_BOOK_RESULT__` |

## 6. Entry/Exit criteria

### Entry criteria

- SQL Server co database `LibraryManagementDemo` va seed script da chay thanh cong.
- Backend chay tai `http://localhost:8080`.
- Frontend chay tai `http://127.0.0.1:5173`.
- Test data biet truoc hoac moi test co cleanup/reset database.

### Exit criteria

- Tat ca test case Priority Critical va High pass.
- Khong con defect nghiem trong ve quantity, transaction, muon/tra, duplicate key.
- Cac loi Medium duoc ghi nhan va co workaround/decision.
- Regression smoke frontend/backend pass sau moi lan sua.

## 7. Luu y rui ro khi thuc thi test

- Backend hien chua co global exception handler, nhieu negative case co the tra HTTP 500 thay vi 400. Test case nen ghi nhan expected business result va actual HTTP de tao defect neu can.
- Frontend khong hien toast/error modal cho `apiPost`; negative test UI co the chi thay action khong thanh cong hoac loi console.
- UI co cac nut edit/delete/settings/logout nhung chua co chuc nang that; khong xem la failed neu nam ngoai scope da implement.
- Search tren frontend va backend khac nhau: frontend filter ca ISBN, backend chi search Title/Author/Subject.

