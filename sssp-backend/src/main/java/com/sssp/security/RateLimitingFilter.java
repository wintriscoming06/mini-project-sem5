package com.sssp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sssp.common.exception.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory sliding rate limiter filter for sensitive endpoints (e.g. login, register).
 * Protects against brute-force attacks and credential stuffing without external dependencies.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Maximum attempts allowed per window for sensitive endpoints
    public static final int MAX_REQUESTS_PER_WINDOW = 15;
    // Window duration: 1 minute (60,000 ms)
    public static final long WINDOW_DURATION_MS = 60_000L;

    private static class RequestCounter {
        final long windowStart;
        final AtomicInteger count;

        RequestCounter(long windowStart) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only enforce on sensitive POST authentication endpoints
        if ("POST".equalsIgnoreCase(method) && (path.endsWith("/api/auth/login") || path.endsWith("/api/auth/register"))) {
            String clientIp = getClientIP(request);
            String bucketKey = clientIp + ":" + path;
            long now = System.currentTimeMillis();

            RequestCounter counter = requestCounts.compute(bucketKey, (k, existing) -> {
                if (existing == null || (now - existing.windowStart) > WINDOW_DURATION_MS) {
                    return new RequestCounter(now);
                }
                existing.count.incrementAndGet();
                return existing;
            });

            if (counter.count.get() > MAX_REQUESTS_PER_WINDOW) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", "60");

                ErrorResponse errorResponse = ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.TOO_MANY_REQUESTS.value())
                        .message("Too many authentication attempts. Please try again after 60 seconds.")
                        .build();

                response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    // Helper for testing resets
    public void reset() {
        requestCounts.clear();
    }
}
