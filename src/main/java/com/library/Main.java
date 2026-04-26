package com.library;

import com.library.data.DemoData;
import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.Member;
import com.library.service.LibraryService;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Scanner;

public class Main {
    private final Scanner scanner = new Scanner(System.in);
    private final LibraryService libraryService = DemoData.createLibraryService();

    public static void main(String[] args) {
        new Main().run();
    }

    private void run() {
        boolean running = true;
        while (running) {
            printMenu();
            int choice = readInt("Choose: ");
            try {
                switch (choice) {
                    case 1:
                        showBooks();
                        break;
                    case 2:
                        searchBooks();
                        break;
                    case 3:
                        addBook();
                        break;
                    case 4:
                        showMembers();
                        break;
                    case 5:
                        addMember();
                        break;
                    case 6:
                        borrowBook();
                        break;
                    case 7:
                        returnBook();
                        break;
                    case 8:
                        showBorrowRecords();
                        break;
                    case 0:
                        running = false;
                        break;
                    default:
                        System.out.println("Invalid option.");
                }
            } catch (RuntimeException exception) {
                System.out.println("Error: " + exception.getMessage());
            }
            System.out.println();
        }
        System.out.println("Goodbye.");
    }

    private void printMenu() {
        System.out.println("===== Library Management System =====");
        System.out.println("1. Show books");
        System.out.println("2. Search books");
        System.out.println("3. Add book");
        System.out.println("4. Show members");
        System.out.println("5. Add member");
        System.out.println("6. Borrow book");
        System.out.println("7. Return book");
        System.out.println("8. Show borrow records");
        System.out.println("0. Exit");
    }

    private void showBooks() {
        printList("Books", libraryService.getBooks());
    }

    private void searchBooks() {
        String keyword = readText("Keyword: ");
        printList("Search results", libraryService.searchBooks(keyword));
    }

    private void addBook() {
        String title = readText("Title: ");
        String author = readText("Author: ");
        String subject = readText("Subject: ");
        int quantity = readInt("Total quantity: ");

        Book book = libraryService.addBook(title, author, subject, quantity);
        System.out.println("Added book: " + book);
    }

    private void showMembers() {
        printList("Members", libraryService.getMembers());
    }

    private void addMember() {
        String code = readText("Member code: ");
        String fullName = readText("Full name: ");
        String phone = readText("Phone: ");

        Member member = libraryService.addMember(code, fullName, phone);
        System.out.println("Added member: " + member);
    }

    private void borrowBook() {
        showBooks();
        int bookId = readInt("Book ID: ");
        showMembers();
        int memberId = readInt("Member ID: ");
        LocalDate borrowDate = readDate("Borrow date (yyyy-MM-dd, blank=today): ", LocalDate.now());
        LocalDate dueDate = readDate("Due date (yyyy-MM-dd, blank=14 days later): ", borrowDate.plusDays(14));

        BorrowRecord record = libraryService.borrowBook(bookId, memberId, borrowDate, dueDate);
        System.out.println("Borrowed successfully: " + record);
    }

    private void returnBook() {
        printList("Active borrow records", libraryService.getActiveBorrowRecords());
        int recordId = readInt("Borrow record ID: ");
        LocalDate returnDate = readDate("Return date (yyyy-MM-dd, blank=today): ", LocalDate.now());

        BorrowRecord record = libraryService.returnBook(recordId, returnDate);
        System.out.println("Returned successfully: " + record);
    }

    private void showBorrowRecords() {
        printList("Borrow records", libraryService.getBorrowRecords());
    }

    private <T> void printList(String title, List<T> items) {
        System.out.println("----- " + title + " -----");
        if (items.isEmpty()) {
            System.out.println("No data.");
            return;
        }
        for (T item : items) {
            System.out.println(item);
        }
    }

    private String readText(String label) {
        System.out.print(label);
        return scanner.nextLine();
    }

    private int readInt(String label) {
        while (true) {
            System.out.print(label);
            String input = scanner.nextLine().trim();
            try {
                return Integer.parseInt(input);
            } catch (NumberFormatException exception) {
                System.out.println("Please enter a valid number.");
            }
        }
    }

    private LocalDate readDate(String label, LocalDate defaultDate) {
        while (true) {
            System.out.print(label);
            String input = scanner.nextLine().trim();
            if (input.isEmpty()) {
                return defaultDate;
            }
            try {
                return LocalDate.parse(input);
            } catch (DateTimeParseException exception) {
                System.out.println("Please enter date using yyyy-MM-dd format.");
            }
        }
    }
}
