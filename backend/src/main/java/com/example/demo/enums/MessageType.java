package com.example.demo.enums;

public enum MessageType {
    TEXT, // tetx message
    MEDIA(MediaType.class); // Медіа message with subtype

    private final Class<? extends Enum<?>> mediaSubtype;

    MessageType() {
        this(null);
    }

    MessageType(Class<? extends Enum<?>> mediaSubtype) {
        this.mediaSubtype = mediaSubtype;
    }

    public boolean isMedia() {
        return this == MEDIA;
    }

    public MediaType getMediaType() {
        if (!isMedia()) {
            throw new IllegalStateException("Not a media message");
        }
        if (mediaSubtype == null || !MediaType.class.isAssignableFrom(mediaSubtype)) {
            throw new IllegalStateException("Invalid media subtype");
        }
        return MediaType.class.cast(mediaSubtype.getEnumConstants()[0]);
    }
}
