package com.example.demo.dto;

public record ContactDTO(
    String id,
    String username,
    String firstname,
    String lastname,
    String photo,
    String description
) {}