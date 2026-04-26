package com.library.service;

import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.Member;
import com.library.model.MemberStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

public class LibraryService {
    private final List<Book> books = new ArrayList<>();
    private final List<Member> members = new ArrayList<>();
    private final List<BorrowRecord> borrowRecords = new ArrayList<>();
    private int nextBookId = 1;
    private int nextMemberId = 1;
    private int nextBorrowRecordId = 1;

    public Book addBook(String title, String author, String subject, int totalQuantity) {
        validateText(title, "Book title");
        validateText(author, "Author");
        validateText(subject, "Subject");
        if (totalQuantity < 0) {
            throw new IllegalArgumentException("Total quantity must be greater than or equal to 0.");
        }

        Book book = new Book(nextBookId++, title.trim(), author.trim(), subject.trim(), totalQuantity, totalQuantity);
        books.add(book);
        return book;
    }

    public Member addMember(String code, String fullName, String phone) {
        validateText(code, "Member code");
        validateText(fullName, "Full name");
        boolean duplicateCode = members.stream().anyMatch(member -> member.getCode().equalsIgnoreCase(code.trim()));
        if (duplicateCode) {
            throw new IllegalArgumentException("Member code already exists.");
        }

        Member member = new Member(nextMemberId++, code.trim(), fullName.trim(), phone.trim(), MemberStatus.ACTIVE);
        members.add(member);
        return member;
    }

    public BorrowRecord borrowBook(int bookId, int memberId, LocalDate borrowDate, LocalDate dueDate) {
        Book book = findBookById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found."));
        Member member = findMemberById(memberId).orElseThrow(() -> new IllegalArgumentException("Member not found."));

        if (!member.canBorrow()) {
            throw new IllegalStateException("Member is not active and cannot borrow books.");
        }
        if (!book.isAvailable()) {
            throw new IllegalStateException("Book has no available copies.");
        }
        if (dueDate.isBefore(borrowDate)) {
            throw new IllegalArgumentException("Due date must not be before borrow date.");
        }

        book.borrowOneCopy();
        BorrowRecord record = new BorrowRecord(nextBorrowRecordId++, book, member, borrowDate, dueDate);
        borrowRecords.add(record);
        return record;
    }

    public BorrowRecord returnBook(int borrowRecordId, LocalDate returnDate) {
        BorrowRecord record = findBorrowRecordById(borrowRecordId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found."));

        record.markReturned(returnDate);
        record.getBook().returnOneCopy();
        return record;
    }

    public List<Book> getBooks() {
        return Collections.unmodifiableList(books);
    }

    public List<Member> getMembers() {
        return Collections.unmodifiableList(members);
    }

    public List<BorrowRecord> getBorrowRecords() {
        return Collections.unmodifiableList(borrowRecords);
    }

    public List<BorrowRecord> getActiveBorrowRecords() {
        return borrowRecords.stream()
                .filter(BorrowRecord::isActive)
                .collect(Collectors.toList());
    }

    public List<Book> searchBooks(String keyword) {
        String normalized = keyword.toLowerCase(Locale.ROOT).trim();
        return books.stream()
                .filter(book -> book.getTitle().toLowerCase(Locale.ROOT).contains(normalized)
                        || book.getAuthor().toLowerCase(Locale.ROOT).contains(normalized)
                        || book.getSubject().toLowerCase(Locale.ROOT).contains(normalized))
                .collect(Collectors.toList());
    }

    public Optional<Book> findBookById(int id) {
        return books.stream().filter(book -> book.getId() == id).findFirst();
    }

    public Optional<Member> findMemberById(int id) {
        return members.stream().filter(member -> member.getId() == id).findFirst();
    }

    public Optional<BorrowRecord> findBorrowRecordById(int id) {
        return borrowRecords.stream().filter(record -> record.getId() == id).findFirst();
    }

    private void validateText(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
    }
}
