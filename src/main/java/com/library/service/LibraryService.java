package com.library.service;

import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.Member;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LibraryService {
    Book addBook(String title, String author, String subject, int totalQuantity);

    Member addMember(String code, String fullName, String phone);

    BorrowRecord borrowBook(int bookId, int memberId, LocalDate borrowDate, LocalDate dueDate);

    BorrowRecord returnBook(int borrowRecordId, LocalDate returnDate);

    List<Book> getBooks();

    List<Member> getMembers();

    List<BorrowRecord> getBorrowRecords();

    List<BorrowRecord> getActiveBorrowRecords();

    List<Book> searchBooks(String keyword);

    Optional<Book> findBookById(int id);

    Optional<Member> findMemberById(int id);

    Optional<BorrowRecord> findBorrowRecordById(int id);
}
