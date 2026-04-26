package com.library.api;

import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.Member;
import com.library.model.ReturnBookRecord;
import com.library.service.LibraryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LibraryController {
    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<Book> books = libraryService.getBooks();
        List<Member> members = libraryService.getMembers();
        List<BorrowRecord> activeRecords = libraryService.getActiveBorrowRecords();
        long overdue = activeRecords.stream()
                .filter(record -> "OVERDUE".equals(record.getStatus().name()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", books.stream().mapToInt(Book::getTotalQuantity).sum());
        stats.put("totalMembers", members.size());
        stats.put("borrowedBooks", activeRecords.size());
        stats.put("overdueBooks", overdue);
        return stats;
    }

    @GetMapping("/books")
    public List<Book> books(@RequestParam(value = "q", required = false) String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return libraryService.getBooks();
        }
        return libraryService.searchBooks(keyword);
    }

    @PostMapping("/books")
    public Book addBook(@RequestBody BookRequest request) {
        return libraryService.addBook(
                request.title(),
                request.author(),
                request.subject(),
                request.totalQuantity()
        );
    }

    @GetMapping("/members")
    public List<Member> members() {
        return libraryService.getMembers();
    }

    @PostMapping("/members")
    public Member addMember(@RequestBody MemberRequest request) {
        return libraryService.addMember(request.code(), request.fullName(), request.phone());
    }

    @GetMapping("/borrow-records")
    public List<BorrowRecord> borrowRecords() {
        return libraryService.getBorrowRecords();
    }

    @GetMapping("/borrow-records/active")
    public List<BorrowRecord> activeBorrowRecords() {
        return libraryService.getActiveBorrowRecords();
    }

    @PostMapping("/borrow-records")
    public BorrowRecord borrowBook(@RequestBody BorrowRequest request) {
        return libraryService.borrowBook(
                request.bookId(),
                request.memberId(),
                request.borrowDate(),
                request.dueDate()
        );
    }

    @PostMapping("/returns")
    public BorrowRecord returnBook(@RequestBody ReturnRequest request) {
        return libraryService.returnBook(request.borrowRecordId(), request.returnDate());
    }

    @GetMapping("/return-books")
    public List<ReturnBookRecord> returnBooks() {
        return libraryService.getReturnBookRecords();
    }

    @PostMapping("/reload-check")
    public ResponseEntity<Map<String, Object>> reloadCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("books", libraryService.getBooks().size());
        result.put("members", libraryService.getMembers().size());
        result.put("activeBorrowRecords", libraryService.getActiveBorrowRecords().size());
        result.put("returnBookRecords", libraryService.getReturnBookRecords().size());
        return ResponseEntity.ok(result);
    }

    public record BookRequest(String title, String author, String subject, int totalQuantity) {
    }

    public record MemberRequest(String code, String fullName, String phone) {
    }

    public record BorrowRequest(int bookId, int memberId, LocalDate borrowDate, LocalDate dueDate) {
    }

    public record ReturnRequest(int borrowRecordId, LocalDate returnDate) {
    }
}
