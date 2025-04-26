package com.example.demo.domain;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Notifications {
    private Long id;
    private String message;
    private String type;
    private Long timestamp;
    private Map<String, Object> additional;
}
