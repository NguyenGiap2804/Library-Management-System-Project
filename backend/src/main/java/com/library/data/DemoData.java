package com.library.data;

import com.library.service.InMemoryLibraryService;
import com.library.service.LibraryService;

import java.time.LocalDate;

public final class DemoData {
    private DemoData() {
    }

    public static LibraryService createLibraryService() {
        // Demo data is kept only for offline testing without SQL Server.
        // Main.java now uses SqlServerLibraryService by default.
        InMemoryLibraryService service = new InMemoryLibraryService();

        service.addBook("Clean Code", "Robert C. Martin", "Software Engineering", 3);
        service.addBook("Effective Java", "Joshua Bloch", "Java", 2);
        service.addBook("Design Patterns", "Erich Gamma", "Software Design", 2);
        service.addBook("Database System Concepts", "Abraham Silberschatz", "Database", 1);

        service.addMember("M001", "Nguyen Van An", "0901000001");
        service.addMember("M002", "Tran Thi Binh", "0901000002");
        service.addMember("M003", "Le Minh Chau", "0901000003");

        service.borrowBook(1, 1, LocalDate.now().minusDays(2), LocalDate.now().plusDays(12));
        service.borrowBook(2, 2, LocalDate.now().minusDays(1), LocalDate.now().plusDays(13));

        return service;
    }
}
