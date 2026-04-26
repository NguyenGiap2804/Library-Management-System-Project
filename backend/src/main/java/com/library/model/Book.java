package com.library.model;

public class Book {
    private final int id;
    private String title;
    private String author;
    private String subject;
    private int totalQuantity;
    private int availableQuantity;

    public Book(int id, String title, String author, String subject, int totalQuantity, int availableQuantity) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.subject = subject;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public boolean isAvailable() {
        return availableQuantity > 0;
    }

    public void borrowOneCopy() {
        if (availableQuantity <= 0) {
            throw new IllegalStateException("Book is not available.");
        }
        availableQuantity--;
    }

    public void returnOneCopy() {
        if (availableQuantity >= totalQuantity) {
            throw new IllegalStateException("All copies are already available.");
        }
        availableQuantity++;
    }

    @Override
    public String toString() {
        return String.format(
                "#%d | %s | %s | %s | available %d/%d",
                id,
                title,
                author,
                subject,
                availableQuantity,
                totalQuantity
        );
    }
}
