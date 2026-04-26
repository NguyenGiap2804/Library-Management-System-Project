package com.library.model;

public class Member {
    private final int id;
    private String code;
    private String fullName;
    private String phone;
    private MemberStatus status;

    public Member(int id, String code, String fullName, String phone, MemberStatus status) {
        this.id = id;
        this.code = code;
        this.fullName = fullName;
        this.phone = phone;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public MemberStatus getStatus() {
        return status;
    }

    public void setStatus(MemberStatus status) {
        this.status = status;
    }

    public boolean canBorrow() {
        return status == MemberStatus.ACTIVE;
    }

    @Override
    public String toString() {
        return String.format("#%d | %s | %s | %s | %s", id, code, fullName, phone, status);
    }
}
