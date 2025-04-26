package com.example.demo.domain;

public class UserProfile {
    private String fullName;
    private String username;
    private String photo;
    private String description;

    public UserProfile(String fullName, String username, String photo, String description) {
        this.fullName = fullName;
        this.username = username;
        this.photo = photo;
        this.description = description;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
