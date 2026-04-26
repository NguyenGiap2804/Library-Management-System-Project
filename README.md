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
- JDBC
- SQL Server



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
Server: MSSQLSERVER01
Database: LibraryManagementDemo
User: your username
Password: your password
```



Neu may khac co ten SQL Server khac, sua `DEFAULT_URL` trong `DatabaseConfig.java`.

## Cach tao database

Mo SQL Server Management Studio, ket noi vao SQL Server, sau do chay file:

```text
database/library_sqlserver_seed.sql
```


