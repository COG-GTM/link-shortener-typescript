package com.example.linkshortener.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.linkshortener.service.AppService;

@RestController
public class AppController {

    private final AppService appService;

    public AppController(AppService appService) {
        this.appService = appService;
    }

    @GetMapping("/")
    public String getHello() {
        return appService.getHello();
    }

    @PostMapping("/shorten")
    public ResponseEntity<Map<String, Object>> shorten(@RequestBody ShortenRequest request) {
        if (request == null || request.getUrl() == null || request.getUrl().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "No url provided. Please provide in the body. E.g. {'url':'https://google.com'}",
                    "code", 400));
        }
        String hash = appService.shorten(request.getUrl());
        return ResponseEntity.ok(Map.of("hash", hash));
    }

    @GetMapping("/{hash}")
    public ResponseEntity<?> retrieveAndRedirect(@PathVariable String hash) {
        String url = appService.retrieve(hash);
        if (url == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Hash not found", "code", 404));
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", url)
                .build();
    }
}
