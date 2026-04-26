# Library Management System

Ung dung quan ly thu vien bang Java, chay tren console va ket noi SQL Server bang JDBC.

He thong hien tai ho tro:

- Xem danh sach sach.
- Tim kiem sach theo ten, tac gia hoac chu de.
- Them sach moi.
- Xem danh sach thanh vien.
- Them thanh vien moi.
- Muon sach.
- Tra sach.
- Xem lich su muon sach.
- Xem bang ghi nhan tra sach.

## Cong nghe su dung

- Java
- Maven
- JDBC
- SQL Server
- Microsoft SQL Server JDBC Driver
- IntelliJ IDEA

## Cau truc thu muc

```text
project2/
  database/
    library_sqlserver_seed.sql
    create_sqlserver_login.sql
  src/main/java/com/library/
    Main.java
    config/
      DatabaseConfig.java
    data/
      DemoData.java
    model/
      Book.java
      BorrowRecord.java
      BorrowStatus.java
      Member.java
      MemberStatus.java
      ReturnBookRecord.java
    service/
      LibraryService.java
      InMemoryLibraryService.java
      SqlServerLibraryService.java
  pom.xml
```

## Database

Database dang dung:

```text
LibraryManagementDemo
```

Cac bang chinh:

- `Books`: luu thong tin sach.
- `Members`: luu thong tin thanh vien.
- `BorrowRecords`: luu lich su muon sach.
- `ReturnBooks`: ghi nhan sach da tra hay chua.

File tao schema va seed data:

```text
database/library_sqlserver_seed.sql
```

File nay se:

- Tao database `LibraryManagementDemo` neu chua co.
- Xoa va tao lai cac bang demo.
- Tao 100 sach.
- Tao 100 thanh vien.
- Tao 100 ban ghi muon sach.
- Tao 50 ban ghi tra sach.

Luu y: file seed co lenh `DROP TABLE`, nen neu chay lai se reset du lieu demo.

## Thong tin ket noi SQL Server

Ung dung dang ket noi toi SQL Server bang SQL Authentication:

```text
Server: DESKTOP-T11NI5C\MSSQLSERVER01
Database: LibraryManagementDemo
User: sa
Password: sa123
```

Connection string nam trong file:

```text
src/main/java/com/library/config/DatabaseConfig.java
```

Noi dung ket noi mac dinh:

```java
jdbc:sqlserver://DESKTOP-T11NI5C\\MSSQLSERVER01;
databaseName=LibraryManagementDemo;
encrypt=true;
trustServerCertificate=true;
```

Neu may khac co ten SQL Server khac, sua `DEFAULT_URL` trong `DatabaseConfig.java`.

## Cach tao database

Mo SQL Server Management Studio, ket noi vao SQL Server, sau do chay file:

```text
database/library_sqlserver_seed.sql
```

Sau khi chay thanh cong, cuoi file se tra ve so luong du lieu:

```sql
SELECT COUNT(*) AS BookCount FROM dbo.Books;
SELECT COUNT(*) AS MemberCount FROM dbo.Members;
SELECT COUNT(*) AS BorrowRecordCount FROM dbo.BorrowRecords;
SELECT COUNT(*) AS ReturnBookCount FROM dbo.ReturnBooks;
```

Ket qua mong doi:

```text
BookCount: 100
MemberCount: 100
BorrowRecordCount: 100
ReturnBookCount: 50
```

## Cach chay tren IntelliJ IDEA

1. Mo IntelliJ IDEA.
2. Chon **Open** va mo thu muc:

```text
D:\projectbymyself\project2
```

3. Neu IntelliJ hien thong bao Maven, bam **Load Maven Project**.
4. Mo file:

```text
src/main/java/com/library/Main.java
```

5. Bam nut Run tai ham:

```java
public static void main(String[] args)
```

6. Console se hien menu:

```text
===== Library Management System =====
1. Show books
2. Search books
3. Add book
4. Show members
5. Add member
6. Borrow book
7. Return book
8. Show borrow records
9. Show return book records
0. Exit
```

## Cach su dung nhanh

### Xem sach

Chon:

```text
1
```

Ung dung se doc du lieu tu bang `Books`.

### Tim sach

Chon:

```text
2
```

Nhap keyword, vi du:

```text
Java