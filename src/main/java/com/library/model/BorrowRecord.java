package com.library.model;

import java.time.LocalDate;

public class BorrowRecord {
    private final int id;
    private final Book book;
    private final Member member;
    private final LocalDate borrowDate;
    private final LocalDate dueDate;
    private LocalDate returnDate;
    private BorrowStatus status;

    public BorrowRecord(int id, Book book, Member member, LocalDate borrowDate, LocalDate dueDate) {
        this.id = id;
        this.book = book;
        this.member = member;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.status = BorrowStatus.BORROWED;
    }

    public BorrowRecord(
            int id,
            Book book,
            Member member,
            LocalDate borrowDate,
            LocalDate dueDate,
            LocalDate returnDate,
            BorrowStatus status
    ) {
        this.id = id;
        this.book = book;
        this.member = member;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public Book getBook() {
        return book;
    }

    public Member getMember() {
        return member;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public BorrowStatus getStatus() {
        return status;
    }

    public boolean isActive() {
        return status == BorrowStatus.BORROWED || status == BorrowStatus.OVERDUE;
    }

    public void markReturned(LocalDate returnDate) {
        if (!isActive()) {
            throw new IllegalStateException("Borrow record has already been returned.");
        }
        this.returnDate = returnDate;
        this.status = BorrowStatus.RETURNED;
    }

    @Override
    public String toString() {
        String returned = returnDate == null ? "-" : returnDate.toString();
        return String.format(
                "#%d | book=%s | member=%s | borrow=%s | due=%s | return=%s | %s",
                id,
                book.getTitle(),
                member.getFullName(),
                borrowDate,
                dueDate,
                returned,
                status
        );
    }
}
