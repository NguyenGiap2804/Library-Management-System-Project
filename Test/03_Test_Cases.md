# Test cases chi tiet - Library Management System

## 1. API va backend

| Test Case ID | Title | Preconditions | Test Steps | Test Data | Expected Result | Priority | Test Type |
|---|---|---|---|---|---|---|---|
| TC-API-001 | Health check thanh cong | Backend dang chay | 1. Goi `GET /api/health` | N/A | HTTP 200; response `{"status":"ok"}` | Medium | Functional |
| TC-API-002 | Lay dashboard stats | DB da seed | 1. Goi `GET /api/stats` 2. Doi chieu voi count/aggregate DB | Seed 100 books, 100 members | Response co `totalBooks`, `totalMembers`, `borrowedBooks`, `overdueBooks`; so lieu khop DB | High | Functional, Integration |
| TC-API-003 | Lay danh sach sach | DB co books | 1. Goi `GET /api/books` | N/A | HTTP 200; danh sach sap xep BookId tang dan; moi item co id/title/author/subject/totalQuantity/availableQuantity | High | Functional |
| TC-API-004 | Tim sach theo title | DB co sach `Library Book 001` | 1. Goi `GET /api/books?q=Library Book 001` | q=`Library Book 001` | Chi tra ve sach match keyword theo title/author/subject | Medium | Functional, Equivalence Partitioning |
| TC-API-005 | Tim sach keyword khong ton tai | DB co books | 1. Goi `GET /api/books?q=__NO_BOOK_RESULT__` | q=`__NO_BOOK_RESULT__` | HTTP 200; response la mang rong | Medium | Negative |
| TC-API-006 | Them sach hop le | Backend/DB available | 1. Goi `POST /api/books` 2. Goi `GET /api/books` de kiem tra | title=`Clean Code QA`, author=`QA Author`, subject=`Software Engineering`, totalQuantity=3 | HTTP 200/201 theo implementation; sach moi duoc tao; AvailableQuantity=3; TotalQuantity=3; ISBN auto unique | High | Functional, Integration |
| TC-API-007 | Them sach voi quantity = 0 | Backend/DB available | 1. Goi `POST /api/books` | title=`Zero Copy Book`, author=`QA`, subject=`Java`, totalQuantity=0 | Sach duoc tao; AvailableQuantity=0; khong the muon sach nay | High | Boundary |
| TC-API-008 | Them sach voi quantity am | Backend/DB available | 1. Goi `POST /api/books` | totalQuantity=-1 | Request bi tu choi; khong insert DB; loi business `Total quantity must be greater than or equal to 0` | High | Negative, Boundary |
| TC-API-009 | Them sach thieu title | Backend/DB available | 1. Goi `POST /api/books` voi title rong | title=` `, author=`QA`, subject=`Java`, totalQuantity=1 | Request bi tu choi; khong insert DB; bao loi title required | High | Negative, Equivalence Partitioning |
| TC-API-010 | Them sach thieu subject | Backend/DB available | 1. Goi `POST /api/books` voi subject rong | title=`Book`, author=`QA`, subject=` `, totalQuantity=1 | Request bi tu choi; khong insert DB; bao loi subject required | Medium | Negative |
| TC-API-011 | Lay danh sach thanh vien | DB co members | 1. Goi `GET /api/members` | N/A | HTTP 200; response co id/code/fullName/phone/status | Medium | Functional |
| TC-API-012 | Them member hop le | Backend/DB available | 1. Goi `POST /api/members` 2. Goi `GET /api/members` | code=`QA001`, fullName=`Nguyen Van QA`, phone=`0900000000` | Member duoc tao; status ACTIVE; JoinDate la ngay hien tai trong DB | High | Functional, Integration |
| TC-API-013 | Them member thieu code | Backend/DB available | 1. Goi `POST /api/members` | code=` `, fullName=`Nguyen Van QA`, phone=`0900000000` | Request bi tu choi; khong insert DB; bao loi member code required | High | Negative |
| TC-API-014 | Them member duplicate code | Da co member code `M001` | 1. Goi `POST /api/members` voi code da ton tai | code=`M001`, fullName=`Duplicate`, phone=`0900000000` | Request bi tu choi boi unique constraint; khong tao member moi | High | Negative, Database |
| TC-API-015 | Them member phone rong | Backend/DB available | 1. Goi `POST /api/members` | code=`QA002`, fullName=`Phone Optional`, phone=`` | Member duoc tao; phone luu rong/null theo implementation; status ACTIVE | Medium | Boundary, Functional |
| TC-API-016 | Lay active borrow records | DB co BORROWED, OVERDUE, RETURNED | 1. Goi `GET /api/borrow-records/active` | Seed data | Response chi chua status BORROWED hoac OVERDUE; khong co RETURNED | High | Functional, State Transition |
| TC-API-017 | Muon sach hop le | Co member ACTIVE va book available > 0 | 1. Ghi nhan availableQuantity book 2. Goi `POST /api/borrow-records` 3. Goi `GET /api/books` va active loans | bookId available, memberId ACTIVE, borrowDate=`2026-04-27`, dueDate=`2026-05-11` | Tao BorrowRecord status BORROWED; AvailableQuantity giam 1; active loans tang 1 | Critical | Functional, Integration |
| TC-API-018 | Muon sach voi dueDate bang borrowDate | Co member ACTIVE va book available > 0 | 1. Goi `POST /api/borrow-records` | borrowDate=`2026-04-27`, dueDate=`2026-04-27` | Request thanh cong vi DueDate >= BorrowDate | High | Boundary |
| TC-API-019 | Muon sach dueDate truoc borrowDate | Co member ACTIVE va book available > 0 | 1. Goi `POST /api/borrow-records` | borrowDate=`2026-04-27`, dueDate=`2026-04-26` | Request bi tu choi; khong tao BorrowRecord; quantity khong doi | Critical | Negative, Boundary |
| TC-API-020 | Muon sach het hang | Co book AvailableQuantity=0 | 1. Goi `POST /api/borrow-records` | bookId cua sach quantity 0, memberId ACTIVE | Request bi tu choi; bao loi no available copies; khong tao BorrowRecord | Critical | Negative, Boundary |
| TC-API-021 | Muon sach voi member INACTIVE | Co member status INACTIVE | 1. Goi `POST /api/borrow-records` | memberId INACTIVE, bookId available | Request bi tu choi; khong tao BorrowRecord; quantity khong doi | Critical | Negative, Decision Table |
| TC-API-022 | Muon sach voi member BLOCKED | Co member status BLOCKED | 1. Goi `POST /api/borrow-records` | memberId BLOCKED, bookId available | Request bi tu choi; khong tao BorrowRecord; quantity khong doi | Critical | Negative, Decision Table |
| TC-API-023 | Muon sach voi bookId khong ton tai | Backend/DB available | 1. Goi `POST /api/borrow-records` | bookId=999999, memberId ACTIVE | Request bi tu choi; bao loi Book not found; DB khong doi | High | Negative |
| TC-API-024 | Muon sach voi memberId khong ton tai | Backend/DB available | 1. Goi `POST /api/borrow-records` | bookId available, memberId=999999 | Request bi tu choi; bao loi Member not found; quantity khong doi | High | Negative |
| TC-API-025 | Tra sach hop le tu BORROWED | Co BorrowRecord status BORROWED | 1. Ghi nhan availableQuantity 2. Goi `POST /api/returns` 3. Goi `GET /api/borrow-records/active` va `/api/return-books` | borrowRecordId BORROWED, returnDate=`2026-04-27` | BorrowRecord status RETURNED; ReturnDate duoc set; AvailableQuantity tang 1; ReturnBooks duoc update/insert; record khong con active | Critical | Functional, State Transition |
| TC-API-026 | Tra sach hop le tu OVERDUE | Co BorrowRecord status OVERDUE | 1. Goi `POST /api/returns` | borrowRecordId OVERDUE, returnDate hop le | BorrowRecord chuyen RETURNED; quantity tang 1; ReturnBooks status RETURNED | Critical | Functional, State Transition |
| TC-API-027 | Tra lai phieu da RETURNED | Co BorrowRecord status RETURNED | 1. Ghi nhan availableQuantity 2. Goi `POST /api/returns` | borrowRecordId RETURNED | Request bi tu choi; quantity khong tang them; khong duplicate ReturnBooks | Critical | Negative, State Transition |
| TC-API-028 | Tra sach voi borrowRecordId khong ton tai | Backend/DB available | 1. Goi `POST /api/returns` | borrowRecordId=999999, returnDate=`2026-04-27` | Request bi tu choi; bao loi Borrow record not found; DB khong doi | High | Negative |
| TC-API-029 | Lay return book records | DB co ReturnBooks | 1. Goi `GET /api/return-books` | Seed data | HTTP 200; moi record co borrowRecord, book, member, expectedReturnDate, returnStatus, fineAmount | Medium | Functional, Integration |
| TC-API-030 | Transaction rollback khi muon fail | Co book available > 0 | 1. Ghi nhan quantity 2. Goi borrow voi member invalid/inactive 3. Kiem tra quantity va borrow records | memberId invalid hoac INACTIVE | Khong co record moi; AvailableQuantity khong doi | Critical | Integration, Negative |

## 2. Database

| Test Case ID | Title | Preconditions | Test Steps | Test Data | Expected Result | Priority | Test Type |
|---|---|---|---|---|---|---|---|
| TC-DB-001 | Rang buoc TotalQuantity khong am | Co quyen insert DB test | 1. Insert Books voi TotalQuantity=-1 | TotalQuantity=-1, AvailableQuantity=0 | DB reject boi `CK_Books_TotalQuantity` | High | Database, Boundary |
| TC-DB-002 | Rang buoc AvailableQuantity khong vuot TotalQuantity | Co quyen insert DB test | 1. Insert Books voi AvailableQuantity > TotalQuantity | TotalQuantity=1, AvailableQuantity=2 | DB reject boi `CK_Books_QuantityRange` | High | Database, Boundary |
| TC-DB-003 | ISBN unique | Da co ISBN seed | 1. Insert Books voi ISBN da ton tai | ISBN=`978-0-000001-LMS` | DB reject duplicate key | High | Database, Negative |
| TC-DB-004 | MemberCode unique | Da co `M001` | 1. Insert Members voi MemberCode duplicate | MemberCode=`M001` | DB reject duplicate key | High | Database, Negative |
| TC-DB-005 | Member status enum | Co quyen insert DB test | 1. Insert Members voi Status invalid | Status=`SUSPENDED` | DB reject boi `CK_Members_Status` | Medium | Database, Negative |
| TC-DB-006 | DueDate khong truoc BorrowDate | Co valid BookId/MemberId | 1. Insert BorrowRecords voi DueDate < BorrowDate | BorrowDate=`2026-04-27`, DueDate=`2026-04-26` | DB reject boi `CK_BorrowRecords_DueDate` | High | Database, Boundary |
| TC-DB-007 | FK BorrowRecords BookId | Co valid MemberId | 1. Insert BorrowRecords voi BookId khong ton tai | BookId=999999 | DB reject FK | High | Database, Integration |
| TC-DB-008 | ReturnBooks BorrowRecordId unique | Co ReturnBooks record | 1. Insert ReturnBooks lan 2 cho cung BorrowRecordId | BorrowRecordId da ton tai | DB reject unique constraint | High | Database, Negative |

## 3. Frontend/UI

| Test Case ID | Title | Preconditions | Test Steps | Test Data | Expected Result | Priority | Test Type |
|---|---|---|---|---|---|---|---|
| TC-UI-001 | Load dashboard khi backend available | Backend va frontend dang chay | 1. Mo `http://127.0.0.1:5173` | N/A | Banner bao connected; dashboard hien stats tu SQL Server | High | Functional, Integration |
| TC-UI-002 | Load fallback khi backend unavailable | Tat backend, frontend dang chay | 1. Mo frontend | N/A | Banner bao backend unavailable; UI hien fallback books/members/loans | Medium | Negative, Usability |
| TC-UI-003 | Dieu huong sidebar | Frontend dang chay | 1. Bam Dashboard 2. Bam Book Management 3. Bam Member Management 4. Bam Circulation | N/A | Noi dung doi dung section; khong reload page | Medium | Functional |
| TC-UI-004 | Filter sach tren UI | Co danh sach books | 1. Vao Book Management 2. Nhap keyword | Keyword=`Java` | Bang chi hien sach match title/author/category/isbn theo filter UI | Medium | Functional |
| TC-UI-005 | Them sach hop le tu UI | Backend available | 1. Vao Book Management 2. Bam Register New Book 3. Nhap data 4. Bam Save Collection | Title=`UI Book`, Author=`UI Author`, Category=`Java`, Quantity=2 | Modal dong; danh sach reload; sach moi hien tren bang; stock 2, available 2 | High | Functional, Integration |
| TC-UI-006 | Them sach thieu title tu UI | Backend available | 1. Mo modal add book 2. De title rong 3. Bam Save Collection | Title rong, Author hop le | Khong goi API hoac khong tao sach; modal van o trang thai cho user sua | Medium | Negative |
| TC-UI-007 | Them sach quantity = 1 tu UI | Backend available | 1. Mo modal add book 2. Nhap quantity 1 3. Save | Quantity=1 | Sach duoc tao voi stock 1 va available 1 | Medium | Boundary |
| TC-UI-008 | Them member hop le tu UI | Backend available | 1. Vao Member Management 2. Bam Enroll Member 3. Nhap full name/phone 4. Bam Add Member | FullName=`UI Member`, Phone=`0901234567` | Modal dong; member moi hien trong table; status ACTIVE | High | Functional, Integration |
| TC-UI-009 | Them member thieu full name tu UI | Backend available | 1. Mo modal member 2. De full name rong 3. Bam Add Member | FullName rong | Khong tao member; modal van cho sua | Medium | Negative |
| TC-UI-010 | Tao loan hop le tu UI | Backend available; co active member va book available | 1. Vao Circulation 2. Chon member/book 3. Chon due sau issue date 4. Bam Generate Loan Ticket | Issue=`2026-04-27`, Due=`2026-05-11` | Active loan moi xuat hien; stock sach giam 1 sau reload | Critical | Functional, Integration |
| TC-UI-011 | Tao loan due date truoc issue date | Backend available | 1. Vao Circulation 2. Chon due truoc issue date 3. Bam Generate Loan Ticket | Issue=`2026-04-27`, Due=`2026-04-26` | API reject; khong tao loan; UI khong reload thanh cong; defect neu khong hien loi ro cho user | High | Negative, Boundary |
| TC-UI-012 | Chi hien member ACTIVE trong dropdown muon sach | DB co ACTIVE/INACTIVE/BLOCKED | 1. Vao Circulation 2. Mo dropdown Select Member | Seed members M010 INACTIVE, M020 BLOCKED | Dropdown chi co ACTIVE members; inactive/blocked khong duoc chon | High | Functional, Equivalence Partitioning |
| TC-UI-013 | Chi hien sach available trong dropdown muon sach | DB co sach available=0 | 1. Vao Circulation 2. Mo dropdown Select Book | Book available=0 | Dropdown khong hien sach het hang | High | Functional, Boundary |
| TC-UI-014 | Tra sach tu UI | Co active loan | 1. Vao Circulation 2. Bam Return Book tren loan | Loan BORROWED/OVERDUE | Loan bien mat khoi active list; stock sach tang 1 sau reload | Critical | Functional, Integration |
| TC-UI-015 | Dashboard New Loan navigation | Frontend dang chay | 1. O Dashboard bam New Loan | N/A | UI chuyen sang Circulation Desk | Low | Functional |
| TC-UI-016 | CORS voi origin hop le | Frontend chay tai 127.0.0.1:5173 | 1. Mo frontend 2. Kiem tra API requests | Origin `http://127.0.0.1:5173` | Requests khong bi chan CORS | Medium | Integration |

## 4. Edge cases va regression

| Test Case ID | Title | Preconditions | Test Steps | Test Data | Expected Result | Priority | Test Type |
|---|---|---|---|---|---|---|---|
| TC-EDGE-001 | Muon ban sao cuoi cung | Book AvailableQuantity=1, member ACTIVE | 1. Borrow sach 2. Kiem tra book list 3. Kiem tra dropdown UI | available=1 | Borrow thanh cong; AvailableQuantity=0; sach khong con trong dropdown muon | Critical | Boundary, Integration |
| TC-EDGE-002 | Tra sach khi AvailableQuantity = TotalQuantity - 1 | Co loan active cua book | 1. Return loan 2. Kiem tra quantity | TotalQuantity=N, AvailableQuantity=N-1 | Return thanh cong; AvailableQuantity=N, khong vuot TotalQuantity | Critical | Boundary, State Transition |
| TC-EDGE-003 | ReturnDate truoc BorrowDate qua API | Co active borrow record | 1. Goi `POST /api/returns` voi returnDate < borrowDate | returnDate=`borrowDate - 1` | DB hoac backend phai tu choi; neu backend tra database error thi tao defect ve validation thieu | High | Negative, Boundary |
| TC-EDGE-004 | Keyword search co space dau/cuoi | DB co books | 1. Goi `GET /api/books?q=  Java  ` | q co leading/trailing spaces | Backend trim keyword va tra ve ket qua match Java | Medium | Equivalence Partitioning |
| TC-EDGE-005 | Payload JSON sai kieu date | Backend available | 1. Goi borrow API voi date sai format | borrowDate=`27-04-2026` | Request bi reject; khong thay doi DB | Medium | Negative, API Contract |
| TC-EDGE-006 | Payload JSON thieu borrowDate | Backend available | 1. Goi borrow API thieu borrowDate | borrowDate missing | Request bi reject; khong thay doi DB; defect neu NullPointer/500 khong duoc handle than thien | High | Negative |
| TC-EDGE-007 | Reload data sau add book | Backend available | 1. Them sach tu UI 2. Quan sat dashboard/book table | Valid book | Book table va dashboard totalBooks cap nhat sau `loadData()` | Medium | Regression |
| TC-EDGE-008 | Reload data sau return book | Backend available | 1. Return loan 2. Quan sat dashboard/circulation/book table | Active loan | Borrowed count giam, available tăng, loan khong con active | High | Regression, Integration |
| TC-EDGE-009 | Frontend API base URL sai | Cau hinh `.env` sai hoac backend khac port | 1. Chay frontend 2. Mo app | `VITE_API_BASE_URL` invalid | Banner bao backend unavailable; khong crash app | Medium | Negative, Configuration |
| TC-EDGE-010 | Nut edit/delete book hien nhung chua implement | Frontend dang chay | 1. Vao Book Management 2. Bam icon edit/delete | N/A | Khong co thay doi data; ghi nhan la out-of-scope/chua implement, khong tinh failed neu requirement chua yeu cau | Low | Exploratory |

