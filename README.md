# Library Management System

Du an gom 2 phan rieng:

- `backend/`: Java Spring Boot REST API, ket noi SQL Server bang JDBC.
- `frontend/`: React + Vite dashboard, goi API tu backend.

## Cau truc thu muc

```text
project2/
  backend/
    database/
      library_sqlserver_seed.sql
    src/main/java/com/library/
      LibraryApplication.java
      api/
      config/
      model/
      service/
    pom.xml
  frontend/
    src/
      main.jsx
      styles.css
    package.json
  README.md
```

## Database

Database mac dinh:

```text
LibraryManagementDemo
```

File tao schema va du lieu demo:

```text
backend/database/library_sqlserver_seed.sql
```

File nay tao cac bang:

- `Books`
- `Members`
- `BorrowRecords`
- `ReturnBooks`

Va seed:

- 100 books
- 100 members
- 100 borrow records
- 50 return book records

## Backend

Backend chay tren:

```text
http://localhost:8080
```

Connection SQL Server nam trong:

```text
backend/src/main/java/com/library/config/DatabaseConfig.java
```

Mac dinh dang dung:

```text
Server: DESKTOP-T11NI5C\MSSQLSERVER01
Database: LibraryManagementDemo
User: sa
Password: sa123
```

Neu may khac co server/user/password khac, sua `DatabaseConfig.java` hoac set environment variables:

```text
LMS_DB_URL
LMS_DB_USER
LMS_DB_PASSWORD
```

### Chay backend bang IntelliJ

1. Mo project trong IntelliJ.
2. Mo Maven project trong thu muc `backend/`.
3. Chay class:

```text
com.library.LibraryApplication
```

Hoac trong Maven panel chay:

```text
spring-boot:run
```

### Chay backend bang terminal

Neu may da cai Maven:

```powershell
cd D:\projectbymyself\project2\backend
mvn spring-boot:run
```

Neu terminal bao `mvn is not recognized`, dung Maven bundled cua IntelliJ qua script:

```powershell
cd D:\projectbymyself\project2\backend
.\run-backend.ps1
```

Kiem tra API:

```text
http://localhost:8080/api/health
```

Ket qua mong doi:

```json
{"status":"ok"}
```

## API endpoints

```text
GET  /api/health
GET  /api/stats
GET  /api/books
POST /api/books
GET  /api/members
POST /api/members
GET  /api/borrow-records
GET  /api/borrow-records/active
POST /api/borrow-records
POST /api/returns
GET  /api/return-books
```

## Frontend

Frontend chay tren:

```text
http://127.0.0.1:5173
```

Chay:

```powershell
cd D:\projectbymyself\project2\frontend
npm install
npm run dev
```

Build:

```powershell
npm run build
```

Frontend mac dinh goi API:

```text
http://localhost:8080/api
```

Neu muon doi API base URL, tao file `.env` trong `frontend/`:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

## Cach chay ca he thong

1. Chay SQL script:

```text
backend/database/library_sqlserver_seed.sql
```

2. Chay backend:

```powershell
cd D:\projectbymyself\project2\backend
mvn spring-boot:run
```

3. Chay frontend:

```powershell
cd D:\projectbymyself\project2\frontend
npm run dev
```

4. Mo browser:

```text
http://127.0.0.1:5173
```

Neu backend ket noi thanh cong, tren frontend se hien:

```text
Connected to SQL Server through backend API
```

Neu backend chua chay, frontend se hien du lieu fallback local de giao dien khong bi trong.

## Chuc nang frontend da noi voi database

- Dashboard stats doc tu `/api/stats`.
- Book Management doc tu `/api/books`.
- Them sach goi `POST /api/books`.
- Member Management doc tu `/api/members`.
- Them member goi `POST /api/members`.
- Circulation doc active loans tu `/api/borrow-records/active`.
- Muon sach goi `POST /api/borrow-records`.
- Tra sach goi `POST /api/returns`.

## Git ignore

Project khong push cac thu muc build/cache:

```text
.idea/
target/
out/
frontend/node_modules/
frontend/dist/
```
