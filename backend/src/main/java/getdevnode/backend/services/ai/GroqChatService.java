package getdevnode.backend.services.ai;

import getdevnode.backend.config.ApiKeyRotator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.function.Consumer;

@Service
@Slf4j
public class GroqChatService {

    private final ApiKeyRotator groqKeyRotator;
    private final String modelName;
    private final HttpClient httpClient;

    public GroqChatService(
            @Value("${app.groq.api-keys:${GROQ_API_KEYS:${GROQ_API_KEY:}}}") String rawKeys,
            @Value("${app.groq.model:llama-3.3-70b-versatile}") String modelName) {
        this.groqKeyRotator = new ApiKeyRotator("Groq-Chat", rawKeys, null);
        this.modelName = modelName;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isAvailable() {
        String key = groqKeyRotator.getCurrentKey();
        return StringUtils.hasText(key) && !key.equals("dummy_key_placeholder");
    }

    public void streamChat(String systemPrompt, String userPrompt, Consumer<String> onTokenConsumer) throws Exception {
        int maxAttempts = Math.max(3, groqKeyRotator.getKeyCount() * 2);

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            String activeKey = groqKeyRotator.getCurrentKey();
            try {
                boolean success = executeStreamRequest(activeKey, systemPrompt, userPrompt, onTokenConsumer);
                if (success) {
                    return;
                }
            } catch (Exception ex) {
                String msg = ex.getMessage() != null ? ex.getMessage() : "";
                boolean isRateLimit = msg.contains("429") || msg.contains("rate") || msg.contains("quota");

                if (isRateLimit && attempt < maxAttempts && groqKeyRotator.getKeyCount() > 1) {
                    log.warn("[Groq] Rate limit hit on key #{}. Rotating to next Groq API key...", attempt);
                    groqKeyRotator.rotateNext();
                } else if (attempt == maxAttempts) {
                    log.error("[Groq] All Groq API key attempts failed", ex);
                    throw ex;
                }
            }
        }
    }

    private boolean executeStreamRequest(
            String apiKey,
            String systemPrompt,
            String userPrompt,
            Consumer<String> onTokenConsumer) throws Exception {

        String escapedSystem = escapeJson(systemPrompt);
        String escapedUser = escapeJson(userPrompt);

        String jsonBody = """
                {
                  "model": "%s",
                  "stream": true,
                  "messages": [
                    {"role": "system", "content": "%s"},
                    {"role": "user", "content": "%s"}
                  ]
                }
                """.formatted(modelName, escapedSystem, escapedUser);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<java.io.InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        if (response.statusCode() == 429) {
            throw new RuntimeException("429 Groq Rate Limit Exceeded");
        }

        if (response.statusCode() != 200) {
            byte[] errBytes = response.body().readAllBytes();
            throw new RuntimeException("Groq API returned HTTP " + response.statusCode() + ": " + new String(errBytes));
        }

        try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(response.body()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if ("[DONE]".equals(data)) {
                        break;
                    }
                    String content = extractDeltaContent(data);
                    if (content != null && !content.isEmpty()) {
                        onTokenConsumer.accept(content);
                    }
                }
            }
        }

        return true;
    }

    private String extractDeltaContent(String json) {
        int idx = json.indexOf("\"content\":\"");
        if (idx == -1) return null;
        int start = idx + 11;
        StringBuilder sb = new StringBuilder();
        boolean escaped = false;

        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escaped) {
                if (c == 'n') sb.append('\n');
                else if (c == 'r') sb.append('\r');
                else if (c == 't') sb.append('\t');
                else sb.append(c);
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                break;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
