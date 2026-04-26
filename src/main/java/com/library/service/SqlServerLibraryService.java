package com.library.service;

import com.library.config.DatabaseConfig;
import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.BorrowStatus;
import com.library.model.Member;
import com.library.model.MemberStatus;
import com.library.model.ReturnBookRecord;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public class SqlServerLibraryService implements LibraryService {
    @Override
    public Book addBook(String title, String author, String subject, int totalQuantity) {
        validateText(title, "Book title");
        validateText(author, "Author");
        validateText(subject, "Subject");
        if (totalQuantity < 0) {
            throw new IllegalArgumentException("Total quantity must be greater than or equal to 0.");
        }

        String sql = "INSERT INTO dbo.Books "
                + "(Title, Author, Subject, Publisher, ISBN, PublishedYear, TotalQuantity, AvailableQuantity) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, title.trim());
            statement.setString(2, author.trim());
            statement.setString(3, subject.trim());
            statement.setString(4, "Manual Entry");
            statement.setString(5, createManualIsbn());
            statement.setInt(6, LocalDate.now().getYear());
            statement.setInt(7, totalQuantity);
            statement.setInt(8, totalQuantity);
            statement.executeUpdate();

            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return findBookById(keys.getInt(1))
                            .orElseThrow(() -> new IllegalStateException("Inserted book cannot be loaded."));
                }
            }
            throw new IllegalStateException("Cannot read generated book id.");
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public Member addMember(String code, String fullName, String phone) {
        validateText(code, "Member code");
        validateText(fullName, "Full name");

        String sql = "INSERT INTO dbo.Members "
                + "(MemberCode, FullName, Email, Phone, Address, JoinDate, Status) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, code.trim());
            statement.setString(2, fullName.trim());
            statement.setString(3, null);
            statement.setString(4, phone == null ? "" : phone.trim());
            statement.setString(5, null);
            statement.setDate(6, Date.valueOf(LocalDate.now()));
            statement.setString(7, MemberStatus.ACTIVE.name());
            statement.executeUpdate();

            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return findMemberById(keys.getInt(1))
                            .orElseThrow(() -> new IllegalStateException("Inserted member cannot be loaded."));
                }
            }
            throw new IllegalStateException("Cannot read generated member id.");
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public BorrowRecord borrowBook(int bookId, int memberId, LocalDate borrowDate, LocalDate dueDate) {
        if (dueDate.isBefore(borrowDate)) {
            throw new IllegalArgumentException("Due date must not be before borrow date.");
        }

        try (Connection connection = DatabaseConfig.getConnection()) {
            connection.setAutoCommit(false);
            try {
                Book book = findBookById(connection, bookId)
                        .orElseThrow(() -> new IllegalArgumentException("Book not found."));
                Member member = findMemberById(connection, memberId)
                        .orElseThrow(() -> new IllegalArgumentException("Member not found."));

                if (!member.canBorrow()) {
                    throw new IllegalStateException("Member is not active and cannot borrow books.");
                }
                if (!book.isAvailable()) {
                    throw new IllegalStateException("Book has no available copies.");
                }

                updateBookAvailability(connection, bookId, -1);
                int recordId = insertBorrowRecord(connection, bookId, memberId, borrowDate, dueDate);
                connection.commit();

                return findBorrowRecordById(recordId)
                        .orElseThrow(() -> new IllegalStateException("Inserted borrow record cannot be loaded."));
            } catch (RuntimeException | SQLException exception) {
                connection.rollback();
                throw exception;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public BorrowRecord returnBook(int borrowRecordId, LocalDate returnDate) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            connection.setAutoCommit(false);
            try {
                BorrowRecord record = findBorrowRecordById(connection, borrowRecordId)
                        .orElseThrow(() -> new IllegalArgumentException("Borrow record not found."));
                if (!record.isActive()) {
                    throw new IllegalStateException("Borrow record has already been returned.");
                }

                String sql = "UPDATE dbo.BorrowRecords "
                        + "SET ReturnDate = ?, Status = 'RETURNED', UpdatedAt = SYSUTCDATETIME() "
                        + "WHERE BorrowRecordId = ?";
                try (PreparedStatement statement = connection.prepareStatement(sql)) {
                    statement.setDate(1, Date.valueOf(returnDate));
                    statement.setInt(2, borrowRecordId);
                    statement.executeUpdate();
                }

                updateBookAvailability(connection, record.getBook().getId(), 1);
                upsertReturnBookRecord(connection, record, returnDate);
                connection.commit();

                return findBorrowRecordById(borrowRecordId)
                        .orElseThrow(() -> new IllegalStateException("Returned borrow record cannot be loaded."));
            } catch (RuntimeException | SQLException exception) {
                connection.rollback();
                throw exception;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public List<Book> getBooks() {
        String sql = "SELECT BookId, Title, Author, Subject, TotalQuantity, AvailableQuantity "
                + "FROM dbo.Books ORDER BY BookId";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            List<Book> books = new ArrayList<>();
            while (resultSet.next()) {
                books.add(mapBook(resultSet));
            }
            return books;
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public List<Member> getMembers() {
        String sql = "SELECT MemberId, MemberCode, FullName, Phone, Status FROM dbo.Members ORDER BY MemberId";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            List<Member> members = new ArrayList<>();
            while (resultSet.next()) {
                members.add(mapMember(resultSet));
            }
            return members;
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public List<BorrowRecord> getBorrowRecords() {
        return loadBorrowRecords("ORDER BY br.BorrowRecordId");
    }

    @Override
    public List<BorrowRecord> getActiveBorrowRecords() {
        return loadBorrowRecords("WHERE br.Status IN ('BORROWED', 'OVERDUE') ORDER BY br.BorrowRecordId");
    }

    @Override
    public List<ReturnBookRecord> getReturnBookRecords() {
        String sql = returnBookSelectSql() + " ORDER BY rb.ReturnBookId";
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            List<ReturnBookRecord> records = new ArrayList<>();
            while (resultSet.next()) {
                records.add(mapReturnBookRecord(resultSet));
            }
            return records;
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public List<Book> searchBooks(String keyword) {
        String sql = "SELECT BookId, Title, Author, Subject, TotalQuantity, AvailableQuantity "
                + "FROM dbo.Books "
                + "WHERE LOWER(Title) LIKE ? OR LOWER(Author) LIKE ? OR LOWER(Subject) LIKE ? "
                + "ORDER BY BookId";
        String pattern = "%" + keyword.toLowerCase(Locale.ROOT).trim() + "%";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, pattern);
            statement.setString(2, pattern);
            statement.setString(3, pattern);
            try (ResultSet resultSet = statement.executeQuery()) {
                List<Book> books = new ArrayList<>();
                while (resultSet.next()) {
                    books.add(mapBook(resultSet));
                }
                return books;
            }
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public Optional<Book> findBookById(int id) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            return findBookById(connection, id);
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public Optional<Member> findMemberById(int id) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            return findMemberById(connection, id);
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    @Override
    public Optional<BorrowRecord> findBorrowRecordById(int id) {
        try (Connection connection = DatabaseConfig.getConnection()) {
            return findBorrowRecordById(connection, id);
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    private List<BorrowRecord> loadBorrowRecords(String filterAndOrder) {
        String sql = borrowRecordSelectSql() + " " + filterAndOrder;
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            List<BorrowRecord> records = new ArrayList<>();
            while (resultSet.next()) {
                records.add(mapBorrowRecord(resultSet));
            }
            return records;
        } catch (SQLException exception) {
            throw databaseError(exception);
        }
    }

    private Optional<Book> findBookById(Connection connection, int id) throws SQLException {
        String sql = "SELECT BookId, Title, Author, Subject, TotalQuantity, AvailableQuantity "
                + "FROM dbo.Books WHERE BookId = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapBook(resultSet)) : Optional.empty();
            }
        }
    }

    private Optional<Member> findMemberById(Connection connection, int id) throws SQLException {
        String sql = "SELECT MemberId, MemberCode, FullName, Phone, Status FROM dbo.Members WHERE MemberId = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapMember(resultSet)) : Optional.empty();
            }
        }
    }

    private Optional<BorrowRecord> findBorrowRecordById(Connection connection, int id) throws SQLException {
        String sql = borrowRecordSelectSql() + " WHERE br.BorrowRecordId = ?";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapBorrowRecord(resultSet)) : Optional.empty();
            }
        }
    }

    private int insertBorrowRecord(
            Connection connection,
            int bookId,
            int memberId,
            LocalDate borrowDate,
            LocalDate dueDate
    ) throws SQLException {
        String sql = "INSERT INTO dbo.BorrowRecords "
                + "(BookId, MemberId, BorrowDate, DueDate, ReturnDate, Status, FineAmount) "
                + "VALUES (?, ?, ?, ?, NULL, 'BORROWED', 0)";
        try (PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setInt(1, bookId);
            statement.setInt(2, memberId);
            statement.setDate(3, Date.valueOf(borrowDate));
            statement.setDate(4, Date.valueOf(dueDate));
            statement.executeUpdate();

            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
            throw new IllegalStateException("Cannot read generated borrow record id.");
        }
    }

    private void updateBookAvailability(Connection connection, int bookId, int delta) throws SQLException {
        String sql = "UPDATE dbo.Books "
                + "SET AvailableQuantity = AvailableQuantity + ?, UpdatedAt = SYSUTCDATETIME() "
                + "WHERE BookId = ? AND AvailableQuantity + ? BETWEEN 0 AND TotalQuantity";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, delta);
            statement.setInt(2, bookId);
            statement.setInt(3, delta);
            int updated = statement.executeUpdate();
            if (updated == 0) {
                throw new IllegalStateException("Book quantity cannot be updated.");
            }
        }
    }

    private void upsertReturnBookRecord(Connection connection, BorrowRecord record, LocalDate returnDate) throws SQLException {
        String updateSql = "UPDATE dbo.ReturnBooks "
                + "SET IsReturned = 1, ActualReturnDate = ?, ReturnStatus = 'RETURNED', UpdatedAt = SYSUTCDATETIME(), "
                + "Notes = 'Returned from console application' "
                + "WHERE BorrowRecordId = ?";
        try (PreparedStatement statement = connection.prepareStatement(updateSql)) {
            statement.setDate(1, Date.valueOf(returnDate));
            statement.setInt(2, record.getId());
            int updated = statement.executeUpdate();
            if (updated > 0) {
                return;
            }
        }

        String insertSql = "INSERT INTO dbo.ReturnBooks "
                + "(BorrowRecordId, BookId, MemberId, IsReturned, ExpectedReturnDate, ActualReturnDate, ReturnStatus, FineAmount, Notes) "
                + "VALUES (?, ?, ?, 1, ?, ?, 'RETURNED', 0, 'Returned from console application')";
        try (PreparedStatement statement = connection.prepareStatement(insertSql)) {
            statement.setInt(1, record.getId());
            statement.setInt(2, record.getBook().getId());
            statement.setInt(3, record.getMember().getId());
            statement.setDate(4, Date.valueOf(record.getDueDate()));
            statement.setDate(5, Date.valueOf(returnDate));
            statement.executeUpdate();
        }
    }

    private String borrowRecordSelectSql() {
        return "SELECT br.BorrowRecordId, br.BorrowDate, br.DueDate, br.ReturnDate, br.Status, "
                + "b.BookId, b.Title, b.Author, b.Subject, b.TotalQuantity, b.AvailableQuantity, "
                + "m.MemberId, m.MemberCode, m.FullName, m.Phone, m.Status AS MemberStatus "
                + "FROM dbo.BorrowRecords br "
                + "INNER JOIN dbo.Books b ON b.BookId = br.BookId "
                + "INNER JOIN dbo.Members m ON m.MemberId = br.MemberId";
    }

    private String returnBookSelectSql() {
        return "SELECT rb.ReturnBookId, rb.IsReturned, rb.ExpectedReturnDate, rb.ActualReturnDate, "
                + "rb.ReturnStatus, rb.FineAmount, rb.Notes, "
                + "br.BorrowRecordId, br.BorrowDate, br.DueDate, br.ReturnDate, br.Status, "
                + "b.BookId, b.Title, b.Author, b.Subject, b.TotalQuantity, b.AvailableQuantity, "
                + "m.MemberId, m.MemberCode, m.FullName, m.Phone, m.Status AS MemberStatus "
                + "FROM dbo.ReturnBooks rb "
                + "INNER JOIN dbo.BorrowRecords br ON br.BorrowRecordId = rb.BorrowRecordId "
                + "INNER JOIN dbo.Books b ON b.BookId = rb.BookId "
                + "INNER JOIN dbo.Members m ON m.MemberId = rb.MemberId";
    }

    private Book mapBook(ResultSet resultSet) throws SQLException {
        return new Book(
                resultSet.getInt("BookId"),
                resultSet.getString("Title"),
                resultSet.getString("Author"),
                resultSet.getString("Subject"),
                resultSet.getInt("TotalQuantity"),
                resultSet.getInt("AvailableQuantity")
        );
    }

    private Member mapMember(ResultSet resultSet) throws SQLException {
        return new Member(
                resultSet.getInt("MemberId"),
                resultSet.getString("MemberCode"),
                resultSet.getString("FullName"),
                resultSet.getString("Phone"),
                MemberStatus.valueOf(resultSet.getString("Status"))
        );
    }

    private BorrowRecord mapBorrowRecord(ResultSet resultSet) throws SQLException {
        Book book = new Book(
                resultSet.getInt("BookId"),
                resultSet.getString("Title"),
                resultSet.getString("Author"),
                resultSet.getString("Subject"),
                resultSet.getInt("TotalQuantity"),
                resultSet.getInt("AvailableQuantity")
        );
        Member member = new Member(
                resultSet.getInt("MemberId"),
                resultSet.getString("MemberCode"),
                resultSet.getString("FullName"),
                resultSet.getString("Phone"),
                MemberStatus.valueOf(resultSet.getString("MemberStatus"))
        );
        Date returnDate = resultSet.getDate("ReturnDate");

        return new BorrowRecord(
                resultSet.getInt("BorrowRecordId"),
                book,
                member,
                resultSet.getDate("BorrowDate").toLocalDate(),
                resultSet.getDate("DueDate").toLocalDate(),
                returnDate == null ? null : returnDate.toLocalDate(),
                BorrowStatus.valueOf(resultSet.getString("Status"))
        );
    }

    private ReturnBookRecord mapReturnBookRecord(ResultSet resultSet) throws SQLException {
        BorrowRecord borrowRecord = mapBorrowRecord(resultSet);
        Date actualReturnDate = resultSet.getDate("ActualReturnDate");
        BigDecimal fineAmount = resultSet.getBigDecimal("FineAmount");

        return new ReturnBookRecord(
                resultSet.getInt("ReturnBookId"),
                borrowRecord,
                resultSet.getBoolean("IsReturned"),
                resultSet.getDate("ExpectedReturnDate").toLocalDate(),
                actualReturnDate == null ? null : actualReturnDate.toLocalDate(),
                resultSet.getString("ReturnStatus"),
                fineAmount == null ? BigDecimal.ZERO : fineAmount,
                resultSet.getString("Notes")
        );
    }

    private void validateText(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
    }

    private String createManualIsbn() {
        return "APP-" + System.currentTimeMillis();
    }

    private RuntimeException databaseError(SQLException exception) {
        return new IllegalStateException("Database error: " + exception.getMessage(), exception);
    }
}
