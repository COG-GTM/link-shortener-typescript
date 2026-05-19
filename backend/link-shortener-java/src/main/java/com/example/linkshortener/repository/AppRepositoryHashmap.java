package com.example.linkshortener.repository;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("test")
public class AppRepositoryHashmap implements AppRepository {

    private final ConcurrentHashMap<String, String> hashMap = new ConcurrentHashMap<>();

    @Override
    public String put(String hash, String url) {
        hashMap.put(hash, url);
        return url;
    }

    @Override
    public String get(String hash) {
        return hashMap.get(hash);
    }
}
