IF DB_ID('LibraryManagementDemo') IS NULL
BEGIN
    CREATE DATABASE LibraryManagementDemo;
END
GO

USE LibraryManagementDemo;
GO

IF OBJECT_ID('dbo.BorrowRecords', 'U') IS NOT NULL DROP TABLE dbo.BorrowRecords;
IF OBJECT_ID('dbo.Members', 'U') IS NOT NULL DROP TABLE dbo.Members;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
GO

CREATE TABLE dbo.Books (
    BookId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Author NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(100) NOT NULL,
    Publisher NVARCHAR(255) NULL,
    ISBN VARCHAR(30) NOT NULL UNIQUE,
    PublishedYear INT NULL,
    TotalQuantity INT NOT NULL,
    AvailableQuantity INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Books_TotalQuantity CHECK (TotalQuantity >= 0),
    CONSTRAINT CK_Books_AvailableQuantity CHECK (AvailableQuantity >= 0),
    CONSTRAINT CK_Books_QuantityRange CHECK (AvailableQuantity <= TotalQuantity)
);
GO

CREATE TABLE dbo.Members (
    MemberId INT IDENTITY(1,1) PRIMARY KEY,
    MemberCode VARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(255) NOT NULL,
    Email VARCHAR(255) NULL,
    Phone VARCHAR(30) NULL,
    Address NVARCHAR(500) NULL,
    JoinDate DATE NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Members_Status CHECK (Status IN ('ACTIVE', 'INACTIVE', 'BLOCKED'))
);
GO

CREATE TABLE dbo.BorrowRecords (
    BorrowRecordId INT IDENTITY(1,1) PRIMARY KEY,
    BookId INT NOT NULL,
    MemberId INT NOT NULL,
    BorrowDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    ReturnDate DATE NULL,
    Status VARCHAR(20) NOT NULL,
    FineAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_BorrowRecords_Books FOREIGN KEY (BookId) REFERENCES dbo.Books(BookId),
    CONSTRAINT FK_BorrowRecords_Members FOREIGN KEY (MemberId) REFERENCES dbo.Members(MemberId),
    CONSTRAINT CK_BorrowRecords_Status CHECK (Status IN ('BORROWED', 'RETURNED', 'OVERDUE')),
    CONSTRAINT CK_BorrowRecords_DueDate CHECK (DueDate >= BorrowDate),
    CONSTRAINT CK_BorrowRecords_ReturnDate CHECK (ReturnDate IS NULL OR ReturnDate >= BorrowDate)
);
GO

CREATE INDEX IX_Books_Title ON dbo.Books(Title);
CREATE INDEX IX_Books_Author ON dbo.Books(Author);
CREATE INDEX IX_Books_Subject ON dbo.Books(Subject);
CREATE INDEX IX_Members_FullName ON dbo.Members(FullName);
CREATE INDEX IX_BorrowRecords_BookId ON dbo.BorrowRecords(BookId);
CREATE INDEX IX_BorrowRecords_MemberId ON dbo.BorrowRecords(MemberId);
CREATE INDEX IX_BorrowRecords_Status ON dbo.BorrowRecords(Status);
GO

DECLARE @i INT = 1;

WHILE @i <= 100
BEGIN
    INSERT INTO dbo.Books (
        Title,
        Author,
        Subject,
        Publisher,
        ISBN,
        PublishedYear,
        TotalQuantity,
        AvailableQuantity
    )
    VALUES (
        CONCAT('Library Book ', FORMAT(@i, '000')),
        CONCAT('Author ', ((@i - 1) % 25) + 1),
        CASE (@i - 1) % 10
            WHEN 0 THEN 'Software Engineering'
            WHEN 1 THEN 'Java'
            WHEN 2 THEN 'Database'
            WHEN 3 THEN 'Networking'
            WHEN 4 THEN 'Security'
            WHEN 5 THEN 'Artificial Intelligence'
            WHEN 6 THEN 'Data Structures'
            WHEN 7 THEN 'Algorithms'
            WHEN 8 THEN 'Web Development'
            ELSE 'Operating Systems'
        END,
        CONCAT('Publisher ', ((@i - 1) % 12) + 1),
        CONCAT('978-0-', FORMAT(@i, '000000'), '-LMS'),
        1995 + (@i % 30),
        5 + (@i % 6),
        5 + (@i % 6)
    );

    SET @i += 1;
END;
GO

DECLARE @i INT = 1;

WHILE @i <= 100
BEGIN
    INSERT INTO dbo.Members (
        MemberCode,
        FullName,
        Email,
        Phone,
        Address,
        JoinDate,
        Status
    )
    VALUES (
        CONCAT('M', FORMAT(@i, '000')),
        CONCAT('Demo Member ', FORMAT(@i, '000')),
        CONCAT('member', FORMAT(@i, '000'), '@example.com'),
        CONCAT('090', FORMAT(@i, '0000000')),
        CONCAT('Address ', @i, ', District ', ((@i - 1) % 12) + 1),
        DATEADD(DAY, -@i, CAST(GETDATE() AS DATE)),
        CASE
            WHEN @i % 20 = 0 THEN 'BLOCKED'
            WHEN @i % 10 = 0 THEN 'INACTIVE'
            ELSE 'ACTIVE'
        END
    );

    SET @i += 1;
END;
GO

DECLARE @i INT = 1;

WHILE @i <= 100
BEGIN
    DECLARE @borrowDate DATE = DATEADD(DAY, -((@i % 60) + 1), CAST(GETDATE() AS DATE));
    DECLARE @dueDate DATE = DATEADD(DAY, 14, @borrowDate);
    DECLARE @status VARCHAR(20);
    DECLARE @returnDate DATE = NULL;
    DECLARE @fine DECIMAL(10, 2) = 0;

    IF @i % 5 = 0
    BEGIN
        SET @status = 'OVERDUE';
        SET @returnDate = NULL;
        SET @fine = 0;
    END
    ELSE IF @i % 3 = 0
    BEGIN
        SET @status = 'RETURNED';
        SET @returnDate = DATEADD(DAY, 7 + (@i % 10), @borrowDate);
        SET @fine = CASE WHEN @returnDate > @dueDate THEN DATEDIFF(DAY, @dueDate, @returnDate) * 5000 ELSE 0 END;
    END
    ELSE
    BEGIN
        SET @status = 'BORROWED';
        SET @returnDate = NULL;
        SET @fine = 0;
    END

    INSERT INTO dbo.BorrowRecords (
        BookId,
        MemberId,
        BorrowDate,
        DueDate,
        ReturnDate,
        Status,
        FineAmount
    )
    VALUES (
        @i,
        ((@i - 1) % 95) + 1,
        @borrowDate,
        @dueDate,
        @returnDate,
        @status,
        @fine
    );

    SET @i += 1;
END;
GO

UPDATE b
SET AvailableQuantity = b.TotalQuantity - activeBorrow.ActiveCount,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.Books b
INNER JOIN (
    SELECT BookId, COUNT(*) AS ActiveCount
    FROM dbo.BorrowRecords
    WHERE Status IN ('BORROWED', 'OVERDUE')
    GROUP BY BookId
) activeBorrow ON activeBorrow.BookId = b.BookId;
GO

SELECT COUNT(*) AS BookCount FROM dbo.Books;
SELECT COUNT(*) AS MemberCount FROM dbo.Members;
SELECT COUNT(*) AS BorrowRecordCount FROM dbo.BorrowRecords;
GO
