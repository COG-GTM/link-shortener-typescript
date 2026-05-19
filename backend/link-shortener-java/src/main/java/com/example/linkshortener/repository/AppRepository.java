package com.example.linkshortener.repository;

public interface AppRepository {
    String put(String hash, String url);
    String get(String hash);
}
