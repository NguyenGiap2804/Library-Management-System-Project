package com.library.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReturnBookRecord {
    private final int id;
    private final BorrowRecord borrowRecord;
    private final boolean returned;
    private final LocalDate expectedReturnDate;
    private final LocalDate actualReturnDate;
    private final String returnStatus;
    private final BigDecimal fineAmount;
    private final String notes;

    public ReturnBookRecord(
            int id,
            BorrowRecord borrowRecord,
            boolean returned,
            LocalDate expectedReturnDate,
            LocalDate actualReturnDate,
            String returnStatus,
            BigDecimal fineAmount,
            String notes
    ) {
        this.id = id;
        this.borrowRecord = borrowRecord;
        this.returned = returned;
        this.expectedReturnDate = expectedReturnDate;
        this.actualReturnDate = actualReturnDate;
        this.returnStatus = returnStatus;
        this.fineAmount = fineAmount;
        this.notes = notes;
    }

    public int getId() {
        return id;
    }

    public BorrowRecord getBorrowRecord() {
        return borrowRecord;
    }

    public boolean isReturned() {
        return returned;
    }

    public LocalDate getExpectedReturnDate() {
        return expectedReturnDate;
    }

    public LocalDate getActualReturnDate() {
        return actualReturnDate;
    }

    public String getReturnStatus() {
        return returnStatus;
    }

    public BigDecimal getFineAmount() {
        return fineAmount;
    }

    public String getNotes() {
        return notes;
    }

    @Override
    public String toString() {
        String actual = actualReturnDate == null ? "-" : actualReturnDate.toString();
        return String.format(
                "#%d | borrowRecord=%d | book=%s | member=%s | returned=%s | expected=%s | actual=%s | status=%s | fine=%s | %s",
                id,
                borrowRecord.getId(),
                borrowRecord.getBook().getTitle(),
                borrowRecord.getMember().getFullName(),
                returned ? "YES" : "NO",
                expectedReturnDate,
                actual,
                returnStatus,
                fineAmount,
                notes == null ? "" : notes
        );
    }
}
