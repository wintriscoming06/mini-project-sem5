package com.sssp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@Configuration
public class StitchConfig {

    private static final Logger logger = LoggerFactory.getLogger(StitchConfig.class);

    @Value("${stitch.api-key:}")
    private String apiKey;

    @Value("${stitch.host:https://stitch.googleapis.com}")
    private String host;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getenv("STITCH_API_KEY");
        }

        // Fallback: search for .env in current and parent directories
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = loadApiKeyFromDotEnv();
        }

        if (host == null || host.trim().isEmpty()) {
            host = System.getenv("STITCH_HOST");
            if (host == null || host.trim().isEmpty()) {
                host = "https://stitch.googleapis.com";
            }
        }

        if (isConfigured()) {
            logger.info("Stitch integration initialized successfully (Host: {}, Key: [PROTECTED])", host);
        } else {
            logger.warn("Stitch API key not found. Set STITCH_API_KEY environment variable or define it in .env");
        }
    }

    private String loadApiKeyFromDotEnv() {
        String[] possiblePaths = {
            ".env",
            "../.env",
            "../../.env",
            "backend/.env",
            "sssp/backend/.env"
        };

        for (String p : possiblePaths) {
            File f = new File(p);
            if (f.exists() && f.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(f.toPath());
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.startsWith("STITCH_API_KEY=")) {
                            String val = trimmed.substring("STITCH_API_KEY=".length()).trim();
                            if (!val.isEmpty()) {
                                return val;
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getHost() {
        return host;
    }

    public String getMcpEndpoint() {
        if (host == null || host.isEmpty()) {
            return "https://stitch.googleapis.com/mcp";
        }
        if (host.endsWith("/mcp")) {
            return host;
        }
        if (host.endsWith("/")) {
            return host + "mcp";
        }
        return host + "/mcp";
    }

    @Override
    public String toString() {
        return "StitchConfig{" +
                "host='" + host + '\'' +
                ", configured=" + isConfigured() +
                ", apiKey='[PROTECTED]'" +
                '}';
    }
}
