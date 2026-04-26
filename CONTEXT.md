# Library Management System - Context Analysis

## 1. Project Overview

Library Management System la mot ung dung quan ly thu vien co giao dien GUI va ket noi co so du lieu. He thong tap trung vao viec quan ly sach, thanh vien, qua trinh muon sach va tra sach.

Du an phu hop de thuc hanh Java Desktop Application voi:

- Java Swing hoac JavaFX de xay dung giao dien.
- JDBC de ket noi va thao tac voi database.
- MySQL hoac mot relational database khac de luu tru du lieu.
- Mo hinh ung dung co nhieu man hinh, nhieu bang du lieu va nghiep vu ro rang.

## 2. Main Goals

Muc tieu chinh cua he thong:

- Quan ly danh sach sach trong thu vien.
- Quan ly thong tin thanh vien.
- Cho phep muon sach neu sach con kha dung.
- Cho phep tra sach va cap nhat lai so luong sach.
- Theo doi lich su muon tra.
- Luu tru du lieu ben vung trong database.
- Tach code theo cac lop de de bao tri va mo rong.

## 3. Users And Roles

Phien ban co ban co the chi can mot nhom nguoi dung:

- Librarian/Admin: nguoi quan ly sach, thanh vien, phieu muon va phieu tra.

Neu muon mo rong sau nay, co the them:

- Member: xem sach, xem lich su muon sach cua minh.
- Admin: quan ly tai khoan librarian va cau hinh he thong.

Trong pham vi du an ban dau, nen tap trung vao Librarian/Admin de giu ung dung gon va de hoan thanh.

## 4. Core Features

### 4.1 Manage Book Inventory

Chuc nang quan ly sach gom:

- Them sach moi.
- Cap nhat thong tin sach.
- Xoa sach neu sach chua co giao dich muon tra lien quan.
- Tim kiem sach theo title, author, category, ISBN.
- Theo doi tong so luong va so luong dang kha dung.

Thong tin sach nen co:

- Book ID.
- Title.
- Author.
- Publisher.
- Category.
- ISBN.
- Published year.
- Total quantity.
- Available quantity.
- Created date.
- Updated date.

### 4.2 Track Member Information

Chuc nang quan ly thanh vien gom:

- Them thanh vien moi.
- Cap nhat thong tin thanh vien.
- Xoa hoac vo hieu hoa thanh vien.
- Tim kiem thanh vien theo ten, email, phone hoac member code.
- Xem lich su muon tra cua mot thanh vien.

Thong tin thanh vien nen co:

- Member ID.
- Member code.
- Full name.
- Email.
- Phone.
- Address.
- Join date.
- Status: ACTIVE, INACTIVE, BLOCKED.

### 4.3 Handle Book Borrowing

Chuc nang muon sach can dam bao:

- Thanh vien ton tai va dang hoat dong.
- Sach ton tai va available quantity > 0.
- Tao ban ghi muon sach.
- Giam available quantity cua sach.
- Luu ngay muon va ngay han tra.
- Trang thai giao dich la BORROWED.

Quy tac co ban:

- Mot lan muon co the muon 1 sach. Phien ban nang cao co the cho muon nhieu sach trong mot phieu.
- Khong cho muon neu sach da het.
- Khong cho muon neu thanh vien bi khoa.
- Co the gioi han so sach dang muon toi da tren moi thanh vien.

### 4.4 Handle Book Returning

Chuc nang tra sach can dam bao:

- Tim dung ban ghi muon sach dang o trang thai BORROWED.
- Cap nhat return date.
- Doi trang thai giao dich thanh RETURNED.
- Tang available quantity cua sach.
- Co the tinh so ngay tre han neu return date > due date.
- Phien ban nang cao co the tinh tien phat.

### 4.5 Database Integration

Database giu vai tro trung tam cua he thong:

- Luu sach, thanh vien va giao dich muon tra.
- Dam bao tinh nhat quan du lieu khi muon/tra sach.
- Ho tro tim kiem va bao cao.

Nen dung JDBC voi prepared statements de tranh SQL injection va de code ro rang.

## 5. Suggested Architecture

Nen tach ung dung thanh cac tang:

```text
GUI Layer
  - JFrame, JPanel, Dialog, TableModel
  - Hien thi du lieu va nhan thao tac nguoi dung

Controller/Service Layer
  - Xu ly nghiep vu
  - Kiem tra dieu kien muon/tra
  - Goi DAO de doc/ghi database

DAO Layer
  - BookDAO
  - MemberDAO
  - BorrowDAO
  - Chua cau lenh SQL va JDBC code

Model Layer
  - Book
  - Member
  - BorrowRecord
  - Cac class du lieu thuan Java

Database Layer
  - MySQL tables
  - Primary key, foreign key, indexes
```

Loi ich cua cach tach nay:

- GUI khong bi tron voi SQL.
- De test tung phan rieng.
- De thay doi database hoac giao dien sau nay.
- Code de doc hon khi du an lon dan.

## 6. Proposed Database Schema

### 6.1 books

```sql
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    category VARCHAR(100),
    isbn VARCHAR(50) UNIQUE,
    published_year INT,
    total_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Important rules:

- available_quantity khong duoc lon hon total_quantity.
- total_quantity va available_quantity khong duoc am.
- ISBN nen unique neu co nhap.

### 6.2 members

```sql
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(500),
    join_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Important rules:

- member_code phai unique.
- status nen gioi han trong ACTIVE, INACTIVE, BLOCKED.

### 6.3 borrow_records

```sql
CREATE TABLE borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT fk_borrow_member FOREIGN KEY (member_id) REFERENCES members(id)
);
```

Important rules:

- status nen la BORROWED, RETURNED, OVERDUE.
- return_date chi co gia tri sau khi tra sach.
- Khi tao borrow record, available_quantity cua book giam 1.
- Khi tra sach, available_quantity cua book tang 1.

## 7. Main GUI Screens

Neu dung Java Swing, co the thiet ke cac man hinh sau:

### 7.1 Main Dashboard

Noi dung:

- Tong so sach.
- Tong so thanh vien.
- So sach dang duoc muon.
- So giao dich tre han.
- Navigation toi Book Management, Member Management, Borrow/Return.

### 7.2 Book Management Screen

Thanh phan GUI:

- JTable hien thi danh sach sach.
- Text fields cho title, author, publisher, ISBN, quantity.
- ComboBox cho category.
- Buttons: Add, Update, Delete, Clear, Search.

### 7.3 Member Management Screen

Thanh phan GUI:

- JTable hien thi danh sach thanh vien.
- Text fields cho member code, full name, email, phone, address.
- ComboBox cho status.
- Buttons: Add, Update, Delete/Deactivate, Clear, Search.

### 7.4 Borrow Book Screen

Thanh phan GUI:

- Chon member.
- Chon book.
- Hien thi available quantity.
- Nhap borrow date va due date.
- Button Issue/Borrow.
- Bang sach dang muon.

### 7.5 Return Book Screen

Thanh phan GUI:

- Tim borrow record theo member hoac book.
- Hien thi danh sach sach dang muon.
- Chon record can tra.
- Hien thi due date va tinh trang tre han.
- Button Return.

## 8. Important Business Flows

### 8.1 Add New Book

```text
User enters book data
System validates required fields
System checks duplicate ISBN
System inserts book into database
System refreshes book table
```

### 8.2 Issue Book To Member

```text
User selects member and book
System checks member status
System checks book availability
System starts database transaction
System inserts borrow record
System decreases book available quantity
System commits transaction
System refreshes UI
```

### 8.3 Return Book

```text
User selects active borrow record
System calculates late days/fine if needed
System starts database transaction
System updates borrow record as RETURNED
System increases book available quantity
System commits transaction
System refreshes UI
```

Nen dung database transaction cho issue va return de tranh truong hop record da tao nhung quantity chua cap nhat, hoac nguoc lai.

## 9. Suggested Java Packages

```text
src/
  main/
    java/
      com/library/
        Main.java
        config/
          DatabaseConfig.java
        model/
          Book.java
          Member.java
          BorrowRecord.java
        dao/
          BookDAO.java
          MemberDAO.java
          BorrowRecordDAO.java
        service/
          BookService.java
          MemberService.java
          BorrowService.java
        ui/
          MainFrame.java
          BookPanel.java
          MemberPanel.java
          BorrowPanel.java
          ReturnPanel.java
        util/
          ValidationUtil.java
          DateUtil.java
```

## 10. JDBC Notes

Nen co mot lop quan ly connection:

```java
public class DatabaseConfig {
    private static final String URL = "jdbc:mysql://localhost:3306/library_db";
    private static final String USER = "root";
    private static final String PASSWORD = "";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
```

Nguyen tac khi lam viec voi JDBC:

- Dung PreparedStatement thay vi noi chuoi SQL.
- Dung try-with-resources de dong Connection, Statement va ResultSet.
- Dung transaction cho cac nghiep vu can nhieu cau SQL.
- Khong hard-code password trong production. Voi project hoc tap thi chap nhan duoc, nhung nen tach vao config file neu co thoi gian.

## 11. Validation Rules

Book validation:

- Title va author khong duoc rong.
- total_quantity >= 0.
- available_quantity >= 0.
- available_quantity <= total_quantity.
- ISBN khong trung.

Member validation:

- Member code va full name khong duoc rong.
- Member code khong trung.
- Email nen dung format email co ban neu co nhap.
- Phone nen chi chua so, dau +, dau cach hoac dau -.

Borrow validation:

- Book phai con available_quantity > 0.
- Member phai co status ACTIVE.
- due_date phai sau hoac bang borrow_date.
- Mot borrow record da RETURNED khong duoc return lan nua.

## 12. Possible Enhancements

Neu phien ban co ban da hoan thanh, co the mo rong:

- Login cho librarian/admin.
- Role-based access control.
- Bao cao sach duoc muon nhieu nhat.
- Bao cao thanh vien muon qua han.
- Tinh fine tu dong theo so ngay tre.
- Export report ra CSV hoac PDF.
- Barcode/QR cho sach.
- Tim kiem nang cao va phan trang.
- Backup va restore database.

## 13. Development Milestones

Nen chia qua trinh lam thanh cac moc:

1. Tao database va schema.
2. Tao project Java va cau hinh MySQL JDBC driver.
3. Tao model classes.
4. Tao DAO va test ket noi database.
5. Lam Book Management.
6. Lam Member Management.
7. Lam Borrow Book.
8. Lam Return Book.
9. Them validation va thong bao loi.
10. Kiem thu luong chinh va sua loi giao dien.

## 14. Main Risks

Cac diem de loi trong du an:

- Cap nhat quantity sai khi muon hoac tra sach.
- Khong dung transaction lam database mat dong bo.
- GUI bi tron qua nhieu SQL code gay kho bao tri.
- Khong validate input lam du lieu rac vao database.
- Xoa sach hoac thanh vien da co borrow history gay loi foreign key.
- Quen dong JDBC resources lam ro ri connection.

## 15. Recommended Scope For First Version

Phien ban dau tien nen co:

- CRUD sach.
- CRUD thanh vien.
- Muon sach.
- Tra sach.
- Xem danh sach sach dang muon.
- MySQL database.
- Java Swing GUI.

Khong nen dua qua nhieu tinh nang nhu login, report PDF, barcode ngay tu dau. Nen hoan thanh luong nghiep vu chinh truoc, sau do moi mo rong.
