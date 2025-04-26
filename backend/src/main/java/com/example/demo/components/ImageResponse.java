package com.example.demo.components;

import org.springframework.http.MediaType;

public class ImageResponse {
    private final byte[] data;
    private final MediaType contentType;

    public ImageResponse(byte[] data, MediaType contentType) {
        this.data = data;
        this.contentType = contentType;
    }

    public byte[] getData() {
        return data;
    }

    public MediaType getContentType() {
        return contentType;
    }
}