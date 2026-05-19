package com.example.linkshortener.repository;

import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!test")
public class AppRepositoryRedis implements AppRepository {

    private final StringRedisTemplate redisTemplate;

    public AppRepositoryRedis(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public String put(String hash, String url) {
        redisTemplate.opsForValue().set(hash, url);
        return url;
    }

    @Override
    public String get(String hash) {
        return redisTemplate.opsForValue().get(hash);
    }
}
