package com.sssp.stitch;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sssp.config.StitchConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class StitchService {

    private static final Logger logger = LoggerFactory.getLogger(StitchService.class);

    private final StitchConfig stitchConfig;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public StitchService(StitchConfig stitchConfig) {
        this.stitchConfig = stitchConfig;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public boolean isConfigured() {
        return stitchConfig.isConfigured();
    }

    public Map<String, Object> testConnection() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("configured", isConfigured());
        status.put("endpoint", stitchConfig.getMcpEndpoint());

        if (!isConfigured()) {
            status.put("status", "UNCONFIGURED");
            status.put("message", "Stitch API key is not configured.");
            return status;
        }

        try {
            Map<String, Object> initPayload = Map.of(
                    "jsonrpc", "2.0",
                    "id", 1,
                    "method", "initialize",
                    "params", Map.of(
                            "protocolVersion", "2024-11-05",
                            "capabilities", Collections.emptyMap(),
                            "clientInfo", Map.of("name", "sssp-stitch-client", "version", "1.0")
                    )
            );

            Map<String, Object> response = executeRpcCall(initPayload);
            if (response.containsKey("result")) {
                status.put("status", "CONNECTED");
                status.put("serverInfo", ((Map<?, ?>) response.get("result")).get("serverInfo"));
            } else if (response.containsKey("error")) {
                status.put("status", "ERROR");
                status.put("error", ((Map<?, ?>) response.get("error")).get("message"));
            } else {
                status.put("status", "OK");
            }
        } catch (Exception e) {
            status.put("status", "CONNECTION_FAILED");
            status.put("message", "Could not connect to Stitch service.");
            logger.error("Failed to connect to Stitch service: {}", e.getMessage());
        }

        return status;
    }

    @SuppressWarnings("unchecked")
    public List<String> listAvailableTools() {
        if (!isConfigured()) {
            return Collections.emptyList();
        }

        try {
            Map<String, Object> payload = Map.of(
                    "jsonrpc", "2.0",
                    "id", 2,
                    "method", "tools/list"
            );

            Map<String, Object> response = executeRpcCall(payload);
            Map<String, Object> result = (Map<String, Object>) response.get("result");
            if (result != null && result.containsKey("tools")) {
                List<Map<String, Object>> tools = (List<Map<String, Object>>) result.get("tools");
                List<String> toolNames = new ArrayList<>();
                for (Map<String, Object> tool : tools) {
                    toolNames.add((String) tool.get("name"));
                }
                return toolNames;
            }
        } catch (Exception e) {
            logger.error("Failed to list Stitch tools: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    private Map<String, Object> executeRpcCall(Map<String, Object> payload) throws Exception {
        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(stitchConfig.getMcpEndpoint()))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("X-Goog-Api-Key", stitchConfig.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return objectMapper.readValue(response.body(), new TypeReference<>() {});
        } else {
            throw new RuntimeException("Stitch API returned HTTP status " + response.statusCode());
        }
    }
}
