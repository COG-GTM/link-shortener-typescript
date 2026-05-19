package com.example.linkshortener.service;

import org.springframework.stereotype.Service;

import com.example.linkshortener.repository.AppRepository;

@Service
public class AppService {

    private final AppRepository appRepository;

    public AppService(AppRepository appRepository) {
        this.appRepository = appRepository;
    }

    public String getHello() {
        return "Hello World!";
    }

    public String shorten(String url) {
        String hash = Long.toUnsignedString(new java.util.Random().nextLong() >>> 1 | 0x1000000000L, 36).substring(0, 6);
        appRepository.put(hash, url);
        return hash;
    }

    public String retrieve(String hash) {
        return appRepository.get(hash);
    }
}
